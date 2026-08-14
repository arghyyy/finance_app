import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, DECIMAL, Date, ForeignKey, UniqueConstraint
from database import Base


class CashflowAllocation(Base):
    __tablename__ = "cashflow_allocations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month = Column(Date, nullable=False)
    total_income = Column(DECIMAL(15, 2), default=0)
    total_expense = Column(DECIMAL(15, 2), default=0)
    fixed_costs = Column(DECIMAL(15, 2), default=0)
    discretionary = Column(DECIMAL(15, 2), default=0)
    savings = Column(DECIMAL(15, 2), default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("user_id", "month"),)
