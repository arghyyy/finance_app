import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, DECIMAL, ForeignKey
from database import Base


class EmergencyFund(Base):
    __tablename__ = "emergency_funds"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    target_months = Column(Integer, default=6)
    monthly_needs = Column(DECIMAL(15, 2), default=0)
    current_amount = Column(DECIMAL(15, 2), default=0)
    monthly_top_up = Column(DECIMAL(15, 2), default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                         onupdate=lambda: datetime.now(timezone.utc))
