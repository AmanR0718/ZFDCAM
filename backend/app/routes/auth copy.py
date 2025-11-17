# backend/app/routes/auth.py
from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
from app.database import get_database
from app.utils.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ==============================
# Models
# ==============================
class LoginIn(BaseModel):
    username: str
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


# ==============================
# Routes
# ==============================
@router.post("/login", summary="Authenticate user and return JWT tokens")
async def login(payload: LoginIn, db=Depends(get_database)):
    """Login with username/password → get access + refresh tokens"""
    user_doc = await db.users.find_one({"email": payload.username.lower().strip()})
    if not user_doc or not verify_password(payload.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(user_doc["email"])
    refresh_token = create_refresh_token(user_doc["email"])

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "email": user_doc["email"],
            "roles": user_doc.get("roles", []),
            "is_active": user_doc.get("is_active", True),
        },
    }


@router.post("/refresh", summary="Exchange refresh token for a new access token")
async def refresh_token(payload: RefreshIn):
    """Validate refresh token and issue new access token"""
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        new_access_token = create_access_token(data["sub"])
        return {"access_token": new_access_token, "token_type": "bearer"}

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired refresh token: {e}")


@router.get("/me", summary="Return current logged-in user info")
async def get_current_user(authorization: Optional[str] = Header(None), db=Depends(get_database)):
    """Validate access token and return user identity"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        email = payload.get("sub")

        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "email": user["email"],
            "roles": user.get("roles", []),
            "is_active": user.get("is_active", True),
            "token_type": payload.get("type"),
        }

    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
