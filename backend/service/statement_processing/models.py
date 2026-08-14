# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class Transaction(BaseModel):
    date: str
    description: str
    type: str = Field(..., pattern="^(CREDIT|DEBIT)$")
    amount: float
    category: Optional[str] = None
    raw_text: Optional[str] = None
    balance: Optional[float] = None
