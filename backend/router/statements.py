import os
import shutil
from tempfile import NamedTemporaryFile
from typing import Optional

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from service.statement_processing.service import process_and_classify_statement
from service.statement_processing.bank_detector import (
    SUPPORTED_BANKS,
    detect_statement_bank,
    normalize_bank_name,
)
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from database import get_db
from model.user import User
from model.transaction import Transaction as DBTransaction
from model.statement import Statement as DBStatement
from util.deps import get_current_user
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import dateutil.parser

class TransactionUpdate(BaseModel):
    date: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None

router = APIRouter(prefix="/api/v1/statements", tags=["Statements"])

@router.post("/upload")
async def upload_statement(
    file: UploadFile = File(...),
    bank_name: str = Form(...),
    password: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    selected_bank = normalize_bank_name(bank_name)
    if not selected_bank:
        raise HTTPException(
            status_code=400,
            detail=f"Bank tidak didukung. Pilih salah satu: {', '.join(SUPPORTED_BANKS)}."
        )
    
    # Check extension
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in ['.pdf', '.xlsx', '.xls', '.csv']:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension: {ext}")
    
    # Get file size before reading
    file_content = await file.read()
    file_size = len(file_content)
    await file.seek(0)  # Reset file pointer for processing
    
    try:
        # Create a temporary file to save the uploaded content
        suffix = ext.lower()
        with NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name
            
        try:
            detected_bank = detect_statement_bank(temp_path, password=password)
            if not detected_bank:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Bank pada e-statement tidak dapat dikenali. Pastikan dokumen asli, "
                        "teksnya dapat dibaca, dan berasal dari bank yang dipilih."
                    )
                )
            if detected_bank != selected_bank:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Bank tidak sesuai: Anda memilih {selected_bank}, tetapi "
                        f"e-statement terdeteksi sebagai {detected_bank}."
                    )
                )

            # Process and classify
            result = process_and_classify_statement(temp_path, password=password)
            result["detected_bank"] = detected_bank
            
            # --- Create Statement record immediately on upload ---
            statement_record = DBStatement(
                user_id=current_user.id,
                filename=file.filename,
                file_type=ext.lower().lstrip('.'),
                file_size=file_size,
                status="pending"
            )
            db.add(statement_record)
            db.commit()
            db.refresh(statement_record)
            
            # Include statement_id in the response
            result["statement_id"] = statement_record.id
            return result
        except Exception as e:
            # Re-raise HTTPExceptions directly to preserve status code and detail
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

class TransactionSaveRequest(BaseModel):
    account_id: Optional[str] = None
    bank_name: Optional[str] = None
    transactions: List[dict]
    statement_id: str


class TransactionCreate(BaseModel):
    date: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    amount: float
    type: Optional[str] = None
    account_id: Optional[str] = None

@router.post("/bulk-save")
def bulk_save_transactions(
    payload: TransactionSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = current_user
    
    # The upload endpoint creates this record. Saving must always target that
    # exact statement so transactions cannot be stored as orphan records.
    statement_record = db.query(DBStatement).filter(
        DBStatement.id == payload.statement_id,
        DBStatement.user_id == user.id
    ).first()
    if not statement_record:
        raise HTTPException(status_code=404, detail="Statement upload tidak ditemukan.")

    statement_record.status = "uploaded"

    # Resolve the account that will own these transactions. A new user may not
    # have created an account yet, so create/reuse one for the selected bank.
    from model.account import Account, AccountType

    account = None
    if payload.account_id:
        account = db.query(Account).filter(
            Account.id == payload.account_id,
            Account.user_id == user.id,
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Rekening tidak ditemukan.")
    else:
        selected_bank = normalize_bank_name(payload.bank_name or "")
        if not selected_bank:
            raise HTTPException(
                status_code=400,
                detail="Bank diperlukan untuk membuat rekening secara otomatis.",
            )

        account = db.query(Account).filter(
            Account.user_id == user.id,
            Account.bank_name.ilike(selected_bank),
        ).first()
        if not account:
            display_names = {"MANDIRI": "Mandiri"}
            display_bank = display_names.get(selected_bank, selected_bank)
            account = Account(
                user_id=user.id,
                name=f"{display_bank} Account",
                type=AccountType.BANK,
                bank_name=display_bank,
                current_balance=0,
            )
            db.add(account)
            db.flush()

    resolved_account_id = account.id
    
    # --- Poin 2: Save transactions and link to statement_id ---
    last_balance = None
    for tx in payload.transactions:
        date_str = tx.get('date', '')
        parsed_date = datetime.now().date()
        if date_str:
            try:
                # Handle dd/mm format by appending current year
                if len(date_str.split('/')) == 2:
                    date_str = f"{date_str}/{datetime.now().year}"
                    
                if '/' in date_str or '-' in date_str:
                    sep = '/' if '/' in date_str else '-'
                    parts = date_str.split(sep)
                    # If format is DD/MM/YYYY or DD/MM/YY
                    if len(parts) == 3:
                        year = int(parts[2])
                        if year < 100:
                            year += 2000
                        parsed_date = datetime(year, int(parts[1]), int(parts[0])).date()
                else:
                    parsed_date = datetime.strptime(date_str.strip(), "%d %b %Y").date()
            except:
                pass

        db_tx = DBTransaction(
            statement_id=statement_record.id,
            account_id=resolved_account_id,
            user_id=user.id,
            date=parsed_date,
            description=tx.get('description', ''),
            amount=float(tx.get('amount') or 0),
            category=tx.get('category'),
            type=tx.get('type'),
            balance=float(tx.get('balance')) if tx.get('balance') is not None else None
        )
        db.add(db_tx)
        
        if db_tx.balance is not None:
            last_balance = db_tx.balance
    
    if last_balance is not None:
        account.current_balance = last_balance
            
    db.commit()
    return {
        "message": f"Successfully saved {len(payload.transactions)} transactions",
        "statement_id": statement_record.id,
        "account_id": resolved_account_id,
        "status": statement_record.status
    }

@router.post("/backfill-statements")
def backfill_statements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    One-time backfill: creates Statement records for existing transactions
    that have statement_id = NULL, so the user doesn't need to reset and re-upload.
    Groups orphan transactions by account_id.
    """
    from model.account import Account
    
    user = current_user
    
    # Find all orphan transactions (no statement linked)
    orphan_txs = db.query(DBTransaction).filter(
        DBTransaction.user_id == user.id,
        DBTransaction.statement_id.is_(None)
    ).all()
    
    if not orphan_txs:
        return {"message": "No orphan transactions found. All transactions are already linked to a statement.", "statements_created": 0}
    
    # Group orphan transactions by account_id
    groups = {}
    for tx in orphan_txs:
        key = tx.account_id or "no_account"
        if key not in groups:
            groups[key] = []
        groups[key].append(tx)
    
    statements_created = 0
    for account_id, txs in groups.items():
        # Get account info for a descriptive filename
        account_name = "Unknown Account"
        bank_name = "Unknown"
        if account_id != "no_account":
            account = db.query(Account).filter(Account.id == account_id).first()
            if account:
                account_name = account.name or "Account"
                bank_name = account.bank_name or "Bank"
        
        # Determine date range from transactions
        dates = [tx.date for tx in txs if tx.date]
        if dates:
            min_date = min(dates).strftime("%Y%m%d")
            max_date = max(dates).strftime("%Y%m%d")
            date_range = f"{min_date}-{max_date}"
        else:
            date_range = datetime.now().strftime("%Y%m%d")
        
        # Generate a descriptive filename
        filename = f"e-statement_{bank_name}_{account_name}_{date_range}.pdf"
        
        # Create Statement record
        statement_record = DBStatement(
            user_id=user.id,
            filename=filename,
            file_type="pdf",
            file_size=0,
            status="uploaded"
        )
        # Use the earliest created_at as the upload_date
        created_ats = [tx.created_at for tx in txs if tx.created_at]
        if created_ats:
            statement_record.upload_date = min(created_ats)
        
        db.add(statement_record)
        db.flush()
        
        # Link all transactions in this group to the statement
        for tx in txs:
            tx.statement_id = statement_record.id
        
        statements_created += 1
    
    db.commit()
    return {
        "message": f"Backfill complete. Created {statements_created} statement(s) and linked {len(orphan_txs)} transaction(s).",
        "statements_created": statements_created,
        "transactions_linked": len(orphan_txs)
    }

@router.get("/transactions")
def get_transactions(
    account_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = current_user
    
    query = db.query(DBTransaction).filter(DBTransaction.user_id == user.id)
    if account_id:
        query = query.filter(DBTransaction.account_id == account_id)
        
    txs = query.order_by(DBTransaction.date.desc(), DBTransaction.created_at.desc()).all()
    res = []
    for tx in txs:
        res.append({
            "id": tx.id,
            "date": tx.date.strftime("%d %b %Y") if tx.date else "",
            "description": tx.description,
            "amount": float(tx.amount),
            "category": tx.category,
            "type": tx.type,
            "balance": float(tx.balance) if tx.balance is not None else None,
            "created_at": tx.created_at.isoformat() if tx.created_at else ""
        })
    return res


@router.get("/transactions/{tx_id}")
def get_transaction(
    tx_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(DBTransaction).filter(
        DBTransaction.id == tx_id, DBTransaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {
        "id": tx.id,
        "date": tx.date.strftime("%d %b %Y") if tx.date else "",
        "description": tx.description,
        "amount": float(tx.amount),
        "category": tx.category,
        "type": tx.type,
        "balance": float(tx.balance) if tx.balance is not None else None
    }


@router.post("/transactions")
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    date_str = payload.date or ""
    parsed_date = datetime.now().date()
    if date_str:
        try:
            if '/' in date_str:
                parts = date_str.split('/')
                parsed_date = datetime(int(parts[2]), int(parts[1]), int(parts[0])).date()
            else:
                parsed_date = datetime.strptime(date_str.strip(), "%d %b %Y").date()
        except:
            pass

    db_tx = DBTransaction(
        account_id=payload.account_id,
        user_id=current_user.id,
        date=parsed_date,
        description=payload.description or '',
        amount=payload.amount,
        category=payload.category,
        type=payload.type
    )
    db.add(db_tx)
    
    # Update account balance
    if payload.account_id:
        from model.account import Account
        account = db.query(Account).filter(Account.id == payload.account_id).first()
        if account:
            bal = float(account.current_balance or 0)
            amt = float(payload.amount)
            if payload.type == 'CREDIT':
                bal += amt
            else:
                bal -= amt
            account.current_balance = bal
            db_tx.balance = bal

    db.commit()
    db.refresh(db_tx)
    return {
        "id": db_tx.id,
        "date": db_tx.date.strftime("%d %b %Y") if db_tx.date else "",
        "description": db_tx.description,
        "amount": float(db_tx.amount),
        "category": db_tx.category,
        "type": db_tx.type,
        "balance": float(db_tx.balance) if db_tx.balance is not None else None
    }


@router.delete("/transactions")
def delete_all_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = current_user
    
    deleted_transactions = db.query(DBTransaction).filter(
        DBTransaction.user_id == user.id
    ).delete(synchronize_session=False)
    deleted_statements = db.query(DBStatement).filter(
        DBStatement.user_id == user.id
    ).delete(synchronize_session=False)
    db.commit()
    return {
        "status": "success",
        "message": "All transactions and statements deleted",
        "deleted_transactions": deleted_transactions,
        "deleted_statements": deleted_statements,
    }

@router.delete("/transactions/{tx_id}")
def delete_transaction(tx_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tx = db.query(DBTransaction).filter(
        DBTransaction.id == tx_id, DBTransaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return {"status": "success"}

@router.put("/transactions/{tx_id}")
def update_transaction(tx_id: str, payload: TransactionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tx = db.query(DBTransaction).filter(
        DBTransaction.id == tx_id, DBTransaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if payload.date is not None:
        try:
            tx.date = dateutil.parser.parse(payload.date).date()
        except:
            pass # ignore parse error
    if payload.description is not None:
        tx.description = payload.description
    if payload.category is not None:
        tx.category = payload.category
    if payload.amount is not None:
        tx.amount = payload.amount
    if payload.type is not None:
        tx.type = payload.type
        
    db.commit()
    db.refresh(tx)
    
    return {
        "status": "success", 
        "transaction": {
            "id": tx.id,
            "date": tx.date.strftime("%d %b %Y") if tx.date else "",
            "description": tx.description,
            "amount": float(tx.amount),
            "category": tx.category,
            "type": tx.type,
            "balance": None
        }
    }
