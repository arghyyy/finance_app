# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from model.transaction import Transaction
from database import get_db
from schema.goal import GoalCreate, GoalUpdate, GoalResponse
from service import goal_service
from util.deps import get_current_user
from model.user import User

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])


@router.get("", response_model=list[GoalResponse])
def list_goals(db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    goals = goal_service.list_goals(db, current_user.id)
    
    # Ambil agregat transaksi berdasarkan kategori
    txs = db.query(Transaction.category, func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id
    ).group_by(Transaction.category).all()
    tx_map = {category: float(amount) for category, amount in txs if category}
    
    response = []
    for g in goals:
        tx_sum = 0.0
        
        # Normalisasi untuk menyelaraskan "Membeli Mobil" dengan "membeli_mobil"
        for category, amount in tx_map.items():
            norm_cat = category.lower().replace(" ", "_")
            norm_label = g.label.lower().replace(" ", "_") if g.label else ""
            norm_type = g.goal_type.lower()
            
            # Map khusus karena ID berbeda dengan nama kategorinya
            special_maps = {
                "dana_pendidikan_anak": "pendidikan_anak",
                "emergency_fund": "dana_darurat",
                "emergency": "dana_darurat"
            }
            mapped_cat = special_maps.get(norm_cat, norm_cat)
            
            if norm_cat == norm_label or norm_cat == norm_type or mapped_cat == norm_type:
                tx_sum += amount
            
        response.append(GoalResponse(
            id=g.id,
            goal_type=g.goal_type,
            label=g.label,
            target_amount=float(g.target_amount or 0),
            current_amount=float(g.current_amount or 0) + tx_sum,
            target_date=g.target_date.isoformat() if g.target_date else None,
            priority=g.priority,
            is_active=g.is_active,
        ))
    return response


@router.post("", response_model=GoalResponse, status_code=201)
def create_goal(data: GoalCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    goal = goal_service.create_goal(db, current_user.id, data)
    return GoalResponse(
        id=goal.id,
        goal_type=goal.goal_type,
        label=goal.label,
        target_amount=float(goal.target_amount or 0),
        current_amount=float(goal.current_amount or 0),
        target_date=goal.target_date.isoformat() if goal.target_date else None,
        priority=goal.priority,
        is_active=goal.is_active,
    )


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: str, data: GoalUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    goal = goal_service.update_goal(db, current_user.id, goal_id, data)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return GoalResponse(
        id=goal.id,
        goal_type=goal.goal_type,
        label=goal.label,
        target_amount=float(goal.target_amount or 0),
        current_amount=float(goal.current_amount or 0),
        target_date=goal.target_date.isoformat() if goal.target_date else None,
        priority=goal.priority,
        is_active=goal.is_active,
    )


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    deleted = goal_service.delete_goal(db, current_user.id, goal_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

from pydantic import BaseModel
class GoalTopUp(BaseModel):
    amount: float

@router.post("/{goal_id}/top-up", response_model=GoalResponse)
def top_up_goal(goal_id: str, data: GoalTopUp, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
        
    goal = db.query(goal_service.Goal).filter(
        goal_service.Goal.id == goal_id,
        goal_service.Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    goal.current_amount = float(goal.current_amount or 0) + data.amount
    db.commit()
    db.refresh(goal)
    
    return update_goal(goal_id, GoalUpdate(), db, current_user)
