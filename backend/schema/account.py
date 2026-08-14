from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from model.account import AccountType

class AccountBase(BaseModel):
    name: str = Field(..., max_length=100)
    type: AccountType = AccountType.BANK
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    include_in_net_worth: bool = True

class AccountCreate(AccountBase):
    initial_balance: Decimal = Field(default=0.0)


class AccountUpdate(BaseModel):
    """Partial update — all fields optional."""
    name: Optional[str] = Field(default=None, max_length=100)
    type: Optional[AccountType] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    include_in_net_worth: Optional[bool] = None
    current_balance: Optional[Decimal] = None
    is_active: Optional[bool] = None

class AccountResponse(AccountBase):
    id: str
    user_id: str
    current_balance: Decimal
    is_active: bool

    class Config:
        from_attributes = True
