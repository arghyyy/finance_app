from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schema.user import UserProfile, UserResponse, OnboardingRequest
from service import user_service
from util.deps import get_current_user
from model.user import User

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name or "",
        age=current_user.age,
        residential_status=current_user.residential_status or "",
        dependents_count=current_user.dependents_count or 0,
        risk_profile=current_user.risk_profile or "moderate",
        monthly_income=float(current_user.monthly_income or 0),
        avatar_url=current_user.avatar_url or "",
    )


@router.put("/me", response_model=UserResponse)
def update_me(data: dict, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    # Support partial update using dict directly to bypass strict Pydantic missing fields
    for field, value in data.items():
        if hasattr(current_user, field) and field not in ['id', 'email', 'password_hash', 'created_at']:
            setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name or "",
        age=current_user.age,
        residential_status=current_user.residential_status or "",
        dependents_count=current_user.dependents_count or 0,
        risk_profile=current_user.risk_profile or "moderate",
        monthly_income=float(current_user.monthly_income or 0),
        avatar_url=current_user.avatar_url or "",
    )


@router.post("/onboarding")
def complete_onboarding(data: OnboardingRequest, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    result = user_service.complete_onboarding(db, current_user, data)
    return {"message": "Onboarding completed", "data": result}

@router.delete("/me")
def delete_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Clean up transactions and accounts associated with this user
    from model.account import Account
    from model.transaction import Transaction as DBTransaction
    
    db.query(DBTransaction).filter(DBTransaction.user_id == current_user.id).delete()
    db.query(Account).filter(Account.user_id == current_user.id).delete()
    
    db.delete(current_user)
    db.commit()
    return {"status": "success", "message": "User profile deleted"}
