import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, DECIMAL, Boolean, Date, ForeignKey
from database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_type = Column(String(50), nullable=False)  # retirement, emergency, property, marriage, car
    label = Column(String(255), nullable=False)
    target_amount = Column(DECIMAL(15, 2), default=0)
    current_amount = Column(DECIMAL(15, 2), default=0)
    target_date = Column(Date, nullable=True)
    priority = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                         onupdate=lambda: datetime.now(timezone.utc))
