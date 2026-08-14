# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from model.transaction import Transaction
from model.user import User
from model.holding import PortfolioHolding
from model.emergency_fund import EmergencyFund
from model.cashflow import CashflowAllocation
from schema.portfolio import PortfolioSummary, EmergencyFundResponse, EmergencyFundUpdate
from datetime import date


def get_summary(db: Session, user: User) -> PortfolioSummary:
    holdings = db.query(PortfolioHolding).filter(PortfolioHolding.user_id == user.id).all()
    total_value = sum(float(h.shares * h.current_price) for h in holdings)
    total_cost = sum(float(h.shares * h.avg_cost) for h in holdings)
    total_return = total_value - total_cost
    return_pct = ((total_return / total_cost) * 100) if total_cost else 0

    # Latest cashflow
    cf = db.query(CashflowAllocation).filter(
        CashflowAllocation.user_id == user.id
    ).order_by(CashflowAllocation.month.desc()).first()

    income = float(cf.total_income) if cf else 0
    expense = float(cf.total_expense) if cf else 0
    surplus = income - expense
    savings_rate = ((surplus / income) * 100) if income else 0

    # Emergency fund
    ef_response = get_emergency_fund(db, user)
    ef_current = ef_response.current_amount
    ef_target = ef_response.target_amount

    # mengembalikan semua data diatas dalam satu objek utuh
    return PortfolioSummary(
        total_value=total_value,
        total_cost=total_cost,
        total_return=total_return,
        return_percent=return_pct,
        cashflow_surplus=surplus,
        monthly_income=income,
        monthly_expense=expense,
        savings_rate=savings_rate,
        emergency_current=ef_current,
        emergency_target=ef_target,
        emergency_progress=ef_response.progress_percent,
        holdings_count=len(holdings),
    )


def get_cashflow(db: Session, user: User, month: str | None = None):
    """Return cashflow data for a given month (default: latest)."""
    query = db.query(CashflowAllocation).filter(
        CashflowAllocation.user_id == user.id
    ).order_by(CashflowAllocation.month.desc())

    if month:
        try:
            target = date.fromisoformat(month)
            query = query.filter(CashflowAllocation.month == target)
        except ValueError:
            pass

    cf = query.first()
    if not cf:
        return None

    return {
        "month": cf.month.isoformat() if cf.month else "",
        "total_income": float(cf.total_income),
        "total_expense": float(cf.total_expense),
        "fixed_costs": float(cf.fixed_costs),
        "discretionary": float(cf.discretionary),
        "savings": float(cf.savings),
    }

def get_emergency_fund(db: Session, user: User) -> EmergencyFundResponse:
    ef = db.query(EmergencyFund).filter(EmergencyFund.user_id == user.id).first()
    
    tx_sum = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id,
        Transaction.category.in_(["Dana Darurat", "Emergency Fund"])
    ).scalar() or 0
    
    base_current = float(ef.current_amount) if ef else 0
    current = base_current + float(tx_sum)
    
    if not ef:
        return EmergencyFundResponse(
            target_months=6, monthly_needs=0, current_amount=current,
            target_amount=0, progress_percent=0, monthly_top_up=0,
            estimated_months=0,
        )
    
    target_amount = float(ef.monthly_needs * ef.target_months)
    progress = (current / target_amount * 100) if target_amount else 0
    top_up = float(ef.monthly_top_up)
    remaining = target_amount - current
    estimated = int(remaining / top_up) if top_up > 0 else 0

    return EmergencyFundResponse(
        target_months=ef.target_months,
        monthly_needs=float(ef.monthly_needs),
        current_amount=current,
        target_amount=target_amount,
        progress_percent=round(progress, 1),
        monthly_top_up=top_up,
        estimated_months=max(0, estimated),
    )
def upsert_emergency_fund(db: Session, user: User, data: "schema.portfolio.EmergencyFundUpdate") -> EmergencyFundResponse:
    ef = db.query(EmergencyFund).filter(EmergencyFund.user_id == user.id).first()
    if not ef:
        ef = EmergencyFund(
            user_id=user.id,
            target_months=6,
            monthly_needs=0,
            current_amount=0,
            monthly_top_up=0
        )
        db.add(ef)
    
    if data.target_months is not None:
        ef.target_months = data.target_months
    if data.monthly_needs is not None:
        ef.monthly_needs = data.monthly_needs
    if data.current_amount is not None:
        ef.current_amount = data.current_amount
    if data.monthly_top_up is not None:
        ef.monthly_top_up = data.monthly_top_up
        
    db.commit()
    return get_emergency_fund(db, user)

def top_up_emergency_fund(db: Session, user: User, amount: float) -> EmergencyFundResponse:
    if amount <= 0:
        raise ValueError("amount must be positive")
        
    ef = db.query(EmergencyFund).filter(EmergencyFund.user_id == user.id).first()
    if not ef:
        ef = EmergencyFund(
            user_id=user.id,
            target_months=6,
            monthly_needs=0,
            current_amount=0,
            monthly_top_up=0
        )
        db.add(ef)
        
    ef.current_amount = float(ef.current_amount or 0) + amount
    
    # Sync with goal if exists
    from model.goal import Goal
    goal = db.query(Goal).filter(
        Goal.user_id == user.id, 
        Goal.goal_type.in_(["emergency", "dana_darurat"]), 
        Goal.is_active == True
    ).first()
    if goal:
        goal.current_amount = float(goal.current_amount or 0) + amount
        
    db.commit()
    return get_emergency_fund(db, user)


def get_holdings(db: Session, user: User) -> list:
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.user_id == user.id
    ).all()
    result = []
    for h in holdings:
        current_price = float(h.current_price)
        avg_cost = float(h.avg_cost)
        change = current_price - avg_cost
        change_pct = (change / avg_cost * 100) if avg_cost else 0
        value = float(h.shares * current_price)
        alloc = float(h.allocation_percent)

        # Determine status based on deviation from target
        status = "optimal"
        if alloc > 30:
            status = "overweight"
        elif alloc < 5:
            status = "underweight"

        result.append({
            "id": h.id,
            "symbol": h.symbol,
            "name": h.name,
            "category": h.category or "",
            "shares": float(h.shares),
            "avg_cost": avg_cost,
            "current_price": current_price,
            "value": round(value, 2),
            "allocation_percent": alloc,
            "sector": h.sector or "",
            "change": round(change, 2),
            "change_percent": round(change_pct, 2),
            "status": status,
        })
    return result
