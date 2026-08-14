from pydantic import BaseModel
from typing import Optional


class PortfolioSummary(BaseModel):
    total_value: float
    total_cost: float
    total_return: float
    return_percent: float
    cashflow_surplus: float
    monthly_income: float
    monthly_expense: float
    savings_rate: float
    emergency_current: float
    emergency_target: float
    emergency_progress: float
    holdings_count: int


class CashflowResponse(BaseModel):
    month: str
    total_income: float
    total_expense: float
    fixed_costs: float
    discretionary: float
    savings: float
    categories: list[dict]  # [{label, amount, pct}]


class EmergencyFundResponse(BaseModel):
    target_months: int
    monthly_needs: float
    current_amount: float
    target_amount: float
    progress_percent: float
    monthly_top_up: float
    estimated_months: int


class EmergencyFundUpdate(BaseModel):
    target_months: Optional[int] = None
    monthly_needs: Optional[float] = None
    current_amount: Optional[float] = None
    monthly_top_up: Optional[float] = None


class HoldingResponse(BaseModel):
    id: str
    symbol: str
    name: str
    category: str
    shares: float
    avg_cost: float
    current_price: float
    value: float
    allocation_percent: float
    sector: str
    change: float
    change_percent: float
    status: str  # optimal, overweight, underweight


class RebalanceRequest(BaseModel):
    suggestions: list[dict]  # [{symbol, action, amount, reason}]
