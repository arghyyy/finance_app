from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class BudgetCreate(BaseModel):
    category: str
    month_year: str  # Format: "2026-07"
    target_amount: float
    alert_threshold: int = 80


class BudgetUpdate(BaseModel):
    target_amount: Optional[float] = None
    alert_threshold: Optional[int] = None
    category: Optional[str] = None
    month_year: Optional[str] = None


class BudgetResponse(BaseModel):
    id: str
    category: str
    month_year: str
    target_amount: float
    realized_amount: float = 0.0
    percentage: float = 0.0
    status: str = "normal"  # normal, warning, exceeded
    alert_threshold: int


class BudgetSummaryResponse(BaseModel):
    month_year: str
    total_budget: float
    total_realized: float
    overall_percentage: float
    status_counts: Dict[str, int]
    budgets: List[BudgetResponse]
