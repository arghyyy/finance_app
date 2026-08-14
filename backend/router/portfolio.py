from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from service import portfolio_service
from util.deps import get_current_user
from model.user import User

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])


@router.get("/summary")
def summary(db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return portfolio_service.get_summary(db, current_user)


@router.get("/cashflow")
def cashflow(month: str | None = Query(None),
             db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    data = portfolio_service.get_cashflow(db, current_user, month)
    if data is None:
        return {"month": "", "total_income": 0, "total_expense": 0,
                "fixed_costs": 0, "discretionary": 0, "savings": 0}
    return data


@router.get("/emergency-fund")
def emergency_fund(db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    return portfolio_service.get_emergency_fund(db, current_user)


@router.get("/holdings")
def holdings(db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    return portfolio_service.get_holdings(db, current_user)
