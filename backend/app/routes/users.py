# backend/app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.database import get_db
from app.dependencies.roles import require_admin
from app.models.user import UserCreate, UserOut, UserRole
from app.utils.security import hash_password
from typing import Optional, List
from datetime import datetime, timezone

router = APIRouter(prefix="/users", tags=["Users"])


# =======================================================
# List Users (ADMIN only)
# =======================================================
@router.get(
    "/",
    response_model=List[UserOut],
    dependencies=[Depends(require_admin)],
    summary="List users",
    description="List all users or filter by role (ADMIN only)"
)
async def get_users(
    role: Optional[str] = Query(None, description="Filter by user role"),
    db = Depends(get_db)
):
    query = {"roles": {"$in": [role]}} if role else {}
    users = await db.users.find(query).to_list(100)
    results = [UserOut.from_mongo(u) for u in users if u]
    return results


# =======================================================
# Create New User (ADMIN only)
# =======================================================
@router.post(
    "/",
    response_model=UserOut,
    dependencies=[Depends(require_admin)],
    summary="Create new user",
    description="Create a new user account (ADMIN only)"
)
async def create_user(
    user_data: UserCreate,
    db = Depends(get_db)
):
    email = user_data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    password_hash = hash_password(user_data.password)
    now = datetime.now(timezone.utc)
    new_user_doc = {
        "email": email,
        "password_hash": password_hash,
        "roles": [role.value for role in user_data.roles],
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    result = await db.users.insert_one(new_user_doc)
    new_user = await db.users.find_one({"_id": result.inserted_id})
    return UserOut.from_mongo(new_user)


# =======================================================
# Get Current User (self-view, any authenticated)
# =======================================================
@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current user",
    description="Get authenticated user info"
)
async def get_me(current_user: dict = Depends(require_admin)):
    """
    Returns info about the currently authenticated admin user.
    """
    return UserOut.from_mongo(current_user)
