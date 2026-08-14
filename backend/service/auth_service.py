# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from model.user import User
from schema.auth import RegisterRequest
from util.security import hash_password, verify_password, create_access_token


def register(db: Session, req: RegisterRequest) -> User:
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise ValueError("Email already registered")
    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        password_plain=req.password, # ONLY FOR DEVELOPMENT
        full_name=req.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(db: Session, email: str, password: str) -> tuple[User, str]:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")
    token = create_access_token(user.id)
    return user, token
