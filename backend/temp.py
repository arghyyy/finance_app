"""
One-time backfill script: 
Membuat record di tabel 'statements' untuk transaksi yang sudah ada
dan menghubungkan statement_id-nya. Tidak perlu reset atau re-upload.
"""
from datetime import datetime
from database import SessionLocal
from model.transaction import Transaction
from model.account import Account
from model.statement import Statement

db = SessionLocal()

try:
    # Cari semua transaksi yang statement_id-nya masih NULL
    orphan_txs = db.query(Transaction).filter(Transaction.statement_id.is_(None)).all()
    
    if not orphan_txs:
        print("✅ Tidak ada transaksi orphan. Semua transaksi sudah terhubung ke statement.")
    else:
        print(f"📋 Ditemukan {len(orphan_txs)} transaksi tanpa statement_id.")
        
        # Kelompokkan berdasarkan account_id
        groups = {}
        for tx in orphan_txs:
            key = tx.account_id or "no_account"
            if key not in groups:
                groups[key] = []
            groups[key].append(tx)
        
        statements_created = 0
        for account_id, txs in groups.items():
            # Ambil info akun untuk nama file
            account_name = "Unknown Account"
            bank_name = "Unknown"
            if account_id != "no_account":
                account = db.query(Account).filter(Account.id == account_id).first()
                if account:
                    account_name = account.name or "Account"
                    bank_name = account.bank_name or "Bank"
            
            # Tentukan rentang tanggal dari transaksi
            dates = [tx.date for tx in txs if tx.date]
            if dates:
                min_date = min(dates).strftime("%Y%m%d")
                max_date = max(dates).strftime("%Y%m%d")
                date_range = f"{min_date}-{max_date}"
            else:
                date_range = datetime.now().strftime("%Y%m%d")
            
            # Buat nama file otomatis
            filename = f"e-statement_{bank_name}_{account_name}_{date_range}.pdf"
            
            # Buat record Statement
            statement_record = Statement(
                user_id=txs[0].user_id,
                filename=filename,
                file_type="pdf",
                file_size=0,
                status="uploaded"
            )
            # Gunakan created_at paling awal sebagai upload_date
            created_ats = [tx.created_at for tx in txs if tx.created_at]
            if created_ats:
                statement_record.upload_date = min(created_ats)
            
            db.add(statement_record)
            db.flush()
            
            # Hubungkan semua transaksi ke statement ini
            for tx in txs:
                tx.statement_id = statement_record.id
            
            statements_created += 1
            print(f"  ✅ Statement dibuat: {filename} → {len(txs)} transaksi terhubung")
        
        db.commit()
        print(f"\n🎉 Backfill selesai! {statements_created} statement dibuat, {len(orphan_txs)} transaksi terhubung.")

except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
finally:
    db.close()
