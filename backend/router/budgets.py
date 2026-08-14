from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from schema.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetSummaryResponse
from service import budget_service
from util.deps import get_current_user
from model.user import User
from datetime import datetime

router = APIRouter(prefix="/api/v1/budgets", tags=["budgets"])


@router.get("", response_model=BudgetSummaryResponse)
def list_budgets(
    month_year: str = Query(default_factory=lambda: datetime.now().strftime("%Y-%m")),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return budget_service.list_budgets(db, current_user.id, month_year)


@router.post("", response_model=BudgetResponse, status_code=201)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return budget_service.create_budget(db, current_user.id, data)


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: str,
    data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = budget_service.update_budget(db, budget_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return updated


@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = budget_service.delete_budget(db, budget_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
