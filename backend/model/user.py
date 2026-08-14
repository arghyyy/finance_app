import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, DECIMAL, Text
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    password_plain = Column(String(255), nullable=True) # ONLY FOR DEVELOPMENT - DO NOT USE IN PRODUCTION
    full_name = Column(String(255), default="")
    age = Column(Integer, default=None, nullable=True)
    residential_status = Column(String(50), default="")
    dependents_count = Column(Integer, default=0)
    risk_profile = Column(String(20), default="moderate")
    monthly_income = Column(DECIMAL(15, 2), default=0)
    avatar_url = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                         onupdate=lambda: datetime.now(timezone.utc))
