from typing import List, Optional
from sqlalchemy.orm import Session
from model.budget import Budget
from model.transaction import Transaction
from schema.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetSummaryResponse


def calculate_budget_response(budget: Budget, realized: float) -> BudgetResponse:
    target = float(budget.target_amount or 0)
    percentage = (realized / target * 100) if target > 0 else (100.0 if realized > 0 else 0.0)
    
    threshold = budget.alert_threshold or 80
    if percentage >= 100.0:
        status = "exceeded"
    elif percentage >= threshold:
        status = "warning"
    else:
        status = "normal"
        
    return BudgetResponse(
        id=budget.id,
        category=budget.category,
        month_year=budget.month_year,
        target_amount=target,
        realized_amount=realized,
        percentage=round(percentage, 1),
        status=status,
        alert_threshold=threshold
    )


def list_budgets(db: Session, user_id: str, month_year: str) -> BudgetSummaryResponse:
    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month_year == month_year
    ).order_by(Budget.category).all()

    # Fetch all transactions for this user
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).all()

    # Filter debit transactions in python for database-agnostic string date matching
    debit_txs = []
    for tx in transactions:
        tx_type = (tx.type or "").upper()
        if tx_type in ["DEBIT", "EXPENSE"] or tx_type != "CREDIT":
            tx_date_str = str(tx.date) if tx.date else ""
            if tx_date_str.startswith(month_year) or month_year in tx_date_str:
                debit_txs.append(tx)

    # Calculate realized amount per category
    budget_responses = []
    total_budget = 0.0
    total_realized = 0.0
    status_counts = {"normal": 0, "warning": 0, "exceeded": 0}

    for b in budgets:
        # Sum transactions matching category (case-insensitive or partial match)
        b_cat = (b.category or "").lower().strip()
        realized = 0.0
        for tx in debit_txs:
            tx_cat = (tx.category or "").lower().strip()
            if b_cat == tx_cat or (b_cat in tx_cat) or (tx_cat in b_cat and len(tx_cat) > 3):
                realized += float(tx.amount or 0)
        
        resp = calculate_budget_response(b, realized)
        budget_responses.append(resp)
        total_budget += resp.target_amount
        total_realized += resp.realized_amount
        if resp.status in status_counts:
            status_counts[resp.status] += 1

    overall_percentage = (total_realized / total_budget * 100) if total_budget > 0 else 0.0

    return BudgetSummaryResponse(
        month_year=month_year,
        total_budget=round(total_budget, 2),
        total_realized=round(total_realized, 2),
        overall_percentage=round(overall_percentage, 1),
        status_counts=status_counts,
        budgets=budget_responses
    )


def create_budget(db: Session, user_id: str, data: BudgetCreate) -> BudgetResponse:
    # Check if budget already exists for this category and month
    existing = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.category == data.category,
        Budget.month_year == data.month_year
    ).first()

    if existing:
        existing.target_amount = data.target_amount
        existing.alert_threshold = data.alert_threshold
        db.commit()
        db.refresh(existing)
        budget = existing
    else:
        budget = Budget(
            user_id=user_id,
            category=data.category,
            month_year=data.month_year,
            target_amount=data.target_amount,
            alert_threshold=data.alert_threshold
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)

    # Calculate realization
    return list_budgets(db, user_id, data.month_year).budgets[0] if list_budgets(db, user_id, data.month_year).budgets else calculate_budget_response(budget, 0.0)


def update_budget(db: Session, budget_id: str, data: BudgetUpdate) -> Optional[BudgetResponse]:
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        return None

    if data.target_amount is not None:
        budget.target_amount = data.target_amount
    if data.alert_threshold is not None:
        budget.alert_threshold = data.alert_threshold
    if data.category is not None:
        budget.category = data.category
    if data.month_year is not None:
        budget.month_year = data.month_year

    db.commit()
    db.refresh(budget)

    summary = list_budgets(db, budget.user_id, budget.month_year)
    for b in summary.budgets:
        if b.id == budget_id:
            return b
    return calculate_budget_response(budget, 0.0)


def delete_budget(db: Session, budget_id: str) -> bool:
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        return False
    db.delete(budget)
    db.commit()
    return True