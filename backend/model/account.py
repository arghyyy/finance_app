import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, DECIMAL, ForeignKey, Enum, Boolean
from database import Base
import enum

class AccountType(str, enum.Enum):
    BANK = "BANK"
    EWALLET = "EWALLET"
    CASH = "CASH"
    CREDIT_CARD = "CREDIT_CARD"
    INVESTMENT = "INVESTMENT"

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False) # e.g. "BCA Utama", "GoPay"
    type = Column(Enum(AccountType), nullable=False, default=AccountType.BANK)
    bank_name = Column(String(50), nullable=True) # "BCA", "Mandiri", etc.
    account_number = Column(String(50), nullable=True)
    
    # Track the running balance of this account
    current_balance = Column(DECIMAL(15, 2), nullable=False, default=0.0)
    
    # Configuration
    is_active = Column(Boolean, default=True)
    include_in_net_worth = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
