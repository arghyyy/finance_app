from sqlalchemy.orm import Session
from model.goal import Goal
from schema.goal import GoalCreate, GoalUpdate
from datetime import date


def list_goals(db: Session, user_id: str) -> list[Goal]:
    return db.query(Goal).filter(
        Goal.user_id == user_id, Goal.is_active == True
    ).order_by(Goal.priority).all()


def create_goal(db: Session, user_id: str, data: GoalCreate) -> Goal:
    target_date = None
    if data.target_date:
        try:
            target_date = date.fromisoformat(data.target_date)
        except ValueError:
            pass
    goal = Goal(
        user_id=user_id,
        goal_type=data.goal_type,
        label=data.label,
        target_amount=data.target_amount,
        target_date=target_date,
        priority=data.priority,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_goal(db: Session, user_id: str, goal_id: str, data: GoalUpdate) -> Goal | None:
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == user_id,
    ).first()
    if not goal:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        if field == "target_date" and value:
            try:
                value = date.fromisoformat(value)
            except ValueError:
                continue
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, user_id: str, goal_id: str) -> bool:
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == user_id,
    ).first()
    if not goal:
        return False
    db.delete(goal)
    db.commit()
    return True
