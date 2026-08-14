from pydantic import BaseModel
from typing import Optional


class GoalCreate(BaseModel):
    goal_type: str
    label: str
    target_amount: float = 0
    target_date: Optional[str] = None
    priority: int = 1


class GoalUpdate(BaseModel):
    label: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None


class GoalResponse(BaseModel):
    id: str
    goal_type: str
    label: str
    target_amount: float
    current_amount: float
    target_date: Optional[str] = None
    priority: int
    is_active: bool
