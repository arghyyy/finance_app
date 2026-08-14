from pydantic import BaseModel
from typing import Optional


class DependentCreate(BaseModel):
    name: str
    relation: str = ""
    birth_year: Optional[int] = None


class DependentUpdate(BaseModel):
    name: Optional[str] = None
    relation: Optional[str] = None
    birth_year: Optional[int] = None


class DependentResponse(BaseModel):
    id: str
    user_id: str
    name: str
    relation: str
    birth_year: Optional[int] = None

    class Config:
        from_attributes = True
