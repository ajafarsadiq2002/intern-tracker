from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from uuid import UUID

from app.auth import hash_password, verify_password, create_access_token, get_current_active_user, require_super_admin
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        allowed_pages=user_in.allowed_pages,
        hashed_password=hash_password(user_in.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if user.is_active != "active":
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)):
    return current_user
