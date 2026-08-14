from sqlalchemy.orm import Session
from model.user import User
from model.goal import Goal
from model.emergency_fund import EmergencyFund
from schema.user import UserProfile, OnboardingRequest


def update_profile(db: Session, user: User, data: UserProfile) -> User:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def complete_onboarding(db: Session, user: User, data: OnboardingRequest) -> dict:
    """Simpan semua data onboarding — user profile, goals, emergency fund target."""

    # 1. Update user profile
    user.age = data.age
    user.residential_status = data.residential_status
    user.dependents_count = data.dependents_count
    user.risk_profile = data.risk_profile

    # 2. Buat goals
    goal_definitions = {
        "retirement": "Retirement Planning",
        "emergency": "Emergency Fund",
        "property": "Property Purchase",
        "marriage": "Marriage / Wedding",
        "car": "Car Purchase",
    }

    goals_created = []
    for gtype in data.goals:
        if gtype not in goal_definitions:
            continue
        # Cek apakah goal udah ada
        existing = db.query(Goal).filter(
            Goal.user_id == user.id, Goal.goal_type == gtype
        ).first()
        if existing:
            goals_created.append(existing)
            continue
        goal = Goal(
            user_id=user.id,
            goal_type=gtype,
            label=goal_definitions[gtype],
            is_active=True,
        )
        db.add(goal)
        goals_created.append(goal)

    # 3. Init emergency fund kalau belum ada
    ef = db.query(EmergencyFund).filter(EmergencyFund.user_id == user.id).first()
    if not ef:
        ef = EmergencyFund(
            user_id=user.id,
            target_months=6,
            monthly_needs=0,
            current_amount=0,
            monthly_top_up=0,
        )
        db.add(ef)

    db.commit()

    return {
        "user_id": user.id,
        "goals_count": len(goals_created),
        "emergency_fund_initialized": True,
    }
