from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    full_name: str
    age: Optional[int] = None
    residential_status: str = ""
    dependents_count: int = 0
    risk_profile: str = "moderate"
    avatar_url: str = ""


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    age: Optional[int] = None
    residential_status: str
    dependents_count: int
    risk_profile: str
    monthly_income: float
    avatar_url: str


class OnboardingRequest(BaseModel):
    age: int
    residential_status: str
    dependents_count: int
    risk_profile: str
    goals: list[str]  # goal_type list: retirement, emergency, property, marriage, car
