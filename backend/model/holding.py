import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, DECIMAL, ForeignKey
from database import Base


class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(20), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    shares = Column(DECIMAL(15, 4), default=0)
    avg_cost = Column(DECIMAL(15, 2), default=0)
    current_price = Column(DECIMAL(15, 2), default=0)
    allocation_percent = Column(DECIMAL(5, 2), default=0)
    sector = Column(String(100), nullable=True)
    icon_name = Column(String(50), default="")
    icon_bg = Column(String(50), default="")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                         onupdate=lambda: datetime.now(timezone.utc))
