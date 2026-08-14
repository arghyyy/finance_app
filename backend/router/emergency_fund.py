# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from database import get_db
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from schema.portfolio import EmergencyFundUpdate, EmergencyFundResponse
from service import portfolio_service
from util.deps import get_current_user
from model.user import User

router = APIRouter(prefix="/api/v1/emergency-fund", tags=["emergency-fund"])

class TopUpRequest(BaseModel):
    amount: float

@router.get("", response_model=EmergencyFundResponse)
def get_emergency_fund(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return portfolio_service.get_emergency_fund(db, current_user)

@router.put("", response_model=EmergencyFundResponse)
def update_emergency_fund(data: EmergencyFundUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return portfolio_service.upsert_emergency_fund(db, current_user, data)

@router.post("/top-up", response_model=EmergencyFundResponse)
def top_up_emergency_fund(data: TopUpRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return portfolio_service.top_up_emergency_fund(db, current_user, data.amount)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
