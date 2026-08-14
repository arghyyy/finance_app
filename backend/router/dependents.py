from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from model.dependent import Dependent
from model.user import User
from schema.dependent import DependentCreate, DependentUpdate, DependentResponse
from util.deps import get_current_user

router = APIRouter(prefix="/api/v1/users/me/dependents", tags=["dependents"])


@router.get("", response_model=List[DependentResponse])
def list_dependents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deps = (
        db.query(Dependent)
        .filter(Dependent.user_id == current_user.id)
        .order_by(Dependent.created_at.desc())
        .all()
    )
    return deps


@router.post("", response_model=DependentResponse, status_code=201)
def add_dependent(
    data: DependentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.name.strip():
        raise HTTPException(status_code=422, detail="Name is required")
    dep = Dependent(
        user_id=current_user.id,
        name=data.name.strip(),
        relation=data.relation or "",
        birth_year=data.birth_year,
    )
    db.add(dep)

    # Keep dependents_count in sync
    current_user.dependents_count = (
        db.query(Dependent).filter(Dependent.user_id == current_user.id).count() + 1
    )

    db.commit()
    db.refresh(dep)
    return dep


@router.put("/{dep_id}", response_model=DependentResponse)
def update_dependent(
    dep_id: str,
    data: DependentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dep = db.query(Dependent).filter(
        Dependent.id == dep_id, Dependent.user_id == current_user.id
    ).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Dependent not found")

    updates = data.model_dump(exclude_unset=True)
    if "name" in updates and not (updates["name"] or "").strip():
        raise HTTPException(status_code=422, detail="Name cannot be empty")
    for field, value in updates.items():
        setattr(dep, field, value)
    db.commit()
    db.refresh(dep)
    return dep


@router.delete("/{dep_id}", status_code=204)
def delete_dependent(
    dep_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = db.query(Dependent).filter(
        Dependent.id == dep_id, Dependent.user_id == current_user.id
    ).delete()
    if not deleted:
        raise HTTPException(status_code=404, detail="Dependent not found")

    current_user.dependents_count = (
        db.query(Dependent).filter(Dependent.user_id == current_user.id).count()
    )
    db.commit()
