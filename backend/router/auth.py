from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schema.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshResponse
from util.security import create_access_token, decode_access_token
from service import auth_service
from util.deps import get_current_user
from model.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.register(db, req)
        token = create_access_token(user.id)
        return TokenResponse(
            access_token=token, user_id=user.id, email=user.email
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    try:
        user, token = auth_service.login(db, req.email, req.password)
        return TokenResponse(
            access_token=token, user_id=user.id, email=user.email
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=RefreshResponse)
def refresh(current_user: User = Depends(get_current_user)):
    token = create_access_token(current_user.id)
    return RefreshResponse(access_token=token)
