import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from dotenv import load_dotenv

from core.auth import get_current_user, get_password_hash, get_users_by_username, authenticate_user, create_access_token
from core.database import get_db
from models.user import UserDB
from schemas.user import UserCreate, Token

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

router = APIRouter()


@router.post("/signup")
def signup(user: UserCreate, db: Session=Depends(get_db)):
    db_user = get_users_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="User Already Exists")
    
    hashed_password = get_password_hash(user.password)
    new_user = UserDB(
        username=user.username,
        email = user.email,
        full_name = user.full_name,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "Success", "message": f"Username {new_user.username} created successfully"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm=Depends(), db: Session=Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Username or Password")
    
    access_token_expires = timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/protected")
def protected_route(current_user: UserDB=Depends(get_current_user)):
    return {
        "message": f"User {current_user.username}, is authenticated.",
        "user": {
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name
        }
    }