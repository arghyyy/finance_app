from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class CashflowCreate(BaseModel):
    month: str  # Format: "YYYY-MM"
    total_income: Decimal = Decimal("0")
    total_expense: Decimal = Decimal("0")
    fixed_costs: Decimal = Decimal("0")
    discretionary: Decimal = Decimal("0")
    savings: Decimal = Decimal("0")


class CashflowUpdate(BaseModel):
    """Partial update — all fields optional."""
    total_income: Optional[Decimal] = None
    total_expense: Optional[Decimal] = None
    fixed_costs: Optional[Decimal] = None
    discretionary: Optional[Decimal] = None
    savings: Optional[Decimal] = None


class CashflowResponse(BaseModel):
    id: str
    month: str
    total_income: float
    total_expense: float
    fixed_costs: float
    discretionary: float
    savings: float

    class Config:
        from_attributes = True
