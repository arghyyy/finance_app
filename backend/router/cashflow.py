from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from model.cashflow import CashflowAllocation
from schema.cashflow import CashflowCreate, CashflowUpdate, CashflowResponse
from model.user import User
from util.deps import get_current_user

router = APIRouter(prefix="/api/v1/cashflows", tags=["cashflows"])


def _parse_month(value: str) -> date:
    """Accept 'YYYY-MM' or full ISO date; return first-day-of-month."""
    try:
        parts = value.split("-")
        if len(parts) == 2:
            return date(int(parts[0]), int(parts[1]), 1)
        return date.fromisoformat(value).replace(day=1)
    except Exception:
        raise HTTPException(status_code=422, detail=f"Invalid month format: {value!r}")


def _to_response(cf: CashflowAllocation) -> CashflowResponse:
    return CashflowResponse(
        id=cf.id,
        month=cf.month.strftime("%Y-%m"),
        total_income=float(cf.total_income or 0),
        total_expense=float(cf.total_expense or 0),
        fixed_costs=float(cf.fixed_costs or 0),
        discretionary=float(cf.discretionary or 0),
        savings=float(cf.savings or 0),
    )


@router.get("", response_model=list[CashflowResponse])
def list_cashflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(CashflowAllocation)
        .filter(CashflowAllocation.user_id == current_user.id)
        .order_by(CashflowAllocation.month.desc())
        .all()
    )
    return [_to_response(r) for r in rows]


@router.get("/{month}", response_model=CashflowResponse)
def get_cashflow(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = _parse_month(month)
    row = (
        db.query(CashflowAllocation)
        .filter(
            CashflowAllocation.user_id == current_user.id,
            CashflowAllocation.month == target,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Cashflow not found")
    return _to_response(row)


@router.post("", response_model=CashflowResponse, status_code=201)
def create_cashflow(
    data: CashflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = _parse_month(data.month)
    # Upsert on (user_id, month) to respect the unique constraint
    existing = (
        db.query(CashflowAllocation)
        .filter(
            CashflowAllocation.user_id == current_user.id,
            CashflowAllocation.month == target,
        )
        .first()
    )
    if existing:
        existing.total_income = data.total_income
        existing.total_expense = data.total_expense
        existing.fixed_costs = data.fixed_costs
        existing.discretionary = data.discretionary
        existing.savings = data.savings
        db.commit()
        db.refresh(existing)
        return _to_response(existing)

    row = CashflowAllocation(
        user_id=current_user.id,
        month=target,
        total_income=data.total_income,
        total_expense=data.total_expense,
        fixed_costs=data.fixed_costs,
        discretionary=data.discretionary,
        savings=data.savings,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_response(row)


@router.put("/{month}", response_model=CashflowResponse)
def update_cashflow(
    month: str,
    data: CashflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = _parse_month(month)
    row = (
        db.query(CashflowAllocation)
        .filter(
            CashflowAllocation.user_id == current_user.id,
            CashflowAllocation.month == target,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Cashflow not found")

    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return _to_response(row)


@router.delete("/{month}", status_code=204)
def delete_cashflow(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = _parse_month(month)
    deleted = (
        db.query(CashflowAllocation)
        .filter(
            CashflowAllocation.user_id == current_user.id,
            CashflowAllocation.month == target,
        )
        .delete()
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Cashflow not found")
    db.commit()
