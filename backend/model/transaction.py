# pyrefly: ignore [missing-import]
import uuid
from datetime import datetime, timezone
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, String, Integer, DateTime, DECIMAL, Date, Text, ForeignKey
from database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    statement_id = Column(String, ForeignKey("statements.id", ondelete="CASCADE"), nullable=True)
    account_id = Column(String, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(DECIMAL(15, 2), nullable=False)
    balance = Column(DECIMAL(15, 2), nullable=True)
    category = Column(String(100), nullable=True)
    type = Column(String(10), nullable=True)  # income / expense
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
