# backend/app/routes/auth.py
"""
Authentication endpoints for user login, registration, and token management.

Endpoints:
- POST /api/auth/login - User login
- POST /api/auth/register - User registration (admin only)
- POST /api/auth/refresh - Refresh access token
- GET /api/auth/me - Get current user info
- POST /api/auth/change-password - Change password
"""

from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

from app.database import get_db
from app.models.user import (
    LoginRequest,
    LoginResponse,
    UserOut,
    UserCreate,
    Token,
    RefreshTokenRequest,
    PasswordChangeRequest,
    UserRole
)
from app.utils.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_token_expiry_seconds,
    validate_password_strength
)
from app.dependencies.roles import get_current_user, require_admin


router = APIRouter(prefix="/auth", tags=["Authentication"])



# ==============================
# Authentication Endpoints
# ==============================
@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login with email and password",
    description="Authenticate user and return JWT access token + refresh token"
)
async def login(
    credentials: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Login endpoint - returns JWT tokens and user information.
    
    **Flow:**
    1. Validate email and password
    2. Check user exists and is active
    3. Generate access token (30 min) + refresh token (7 days)
    4. Return tokens with user info
    
    **Example Request:**
    ```
    {
        "email": "admin@agrimanage.com",
        "password": "admin123"
    }
    ```
    
    **Example Response:**
    ```
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "expires_in": 1800,
        "user": {
            "_id": "507f1f77bcf86cd799439011",
            "email": "admin@agrimanage.com",
            "roles": ["ADMIN"],
            "is_active": true
        }
    }
    ```
    """
    # Find user by email (case-insensitive)
    email = credentials.email.lower().strip()
    user_doc = await db.users.find_one({"email": email})
    
    # Check if user exists
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user_doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Contact administrator.",
        )
    
    # Create tokens with roles embedded
    user_roles = user_doc.get("roles", [])
    access_token = create_access_token(email, roles=user_roles)
    refresh_token = create_refresh_token(email)
    
    # Update last login timestamp
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"email": email},
        {"$set": {"last_login": now}}
    )
    
    # Build user response
    user_out = UserOut.from_mongo(user_doc)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=get_token_expiry_seconds("access"),
        user=user_out
    )


@router.post(
    "/register",
    response_model=UserOut,
    summary="Register a new user (Admin only)",
    description="Create a new user account. Only admins can register new users.",
    dependencies=[Depends(require_admin)]
)
async def register_user(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    """
    Register a new user (admin-only endpoint).
    
    **Permissions:** ADMIN only
    
    **Password Requirements:**
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    
    **Example Request:**
    ```
    {
        "email": "operator@agrimanage.com",
        "password": "SecurePass123",
        "roles": ["OPERATOR"]
    }
    ```
    """
    # Check if user already exists
    email = user_data.email.lower().strip()
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email {email} already exists"
        )
    
    # Validate password strength (redundant with Pydantic validator, but extra check)
    is_valid, error_msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user document
    now = datetime.now(timezone.utc)
    user_doc = {
        "email": email,
        "password_hash": password_hash,
        "roles": [role.value for role in user_data.roles],
        "is_active": True,
        "created_at": now,
        "updated_at": now,
        "created_by": admin.get("email"),
    }
    
    # Insert into database
    result = await db.users.insert_one(user_doc)
    
    # Fetch created user
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return UserOut.from_mongo(created_user)


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh access token",
    description="Exchange a valid refresh token for a new access token"
)
async def refresh_access_token(
    payload: RefreshTokenRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Refresh endpoint - exchange refresh token for new access token.
    
    **Use Case:** When access token expires (30 min), use refresh token (7 days) to get a new one.
    
    **Example Request:**
    ```
    {
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
    
    **Example Response:**
    ```
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "expires_in": 1800
    }
    ```
    """
    try:
        # Decode refresh token
        token_data = decode_token(payload.refresh_token)
        
        # Verify token type
        if token_data.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type. Must be a refresh token."
            )
        
        # Get user email from token
        email = token_data.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Verify user still exists and is active
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled"
            )
        
        # Create new access token with current roles
        user_roles = user.get("roles", [])
        new_access_token = create_access_token(email, roles=user_roles)
        
        return Token(
            access_token=new_access_token,
            token_type="bearer",
            expires_in=get_token_expiry_seconds("access")
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired refresh token: {str(e)}"
        )


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current user info",
    description="Returns information about the currently authenticated user"
)
async def get_me(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current user endpoint - returns authenticated user's information.
    
    **Authentication Required:** Yes (Bearer token)
    
    **Example Response:**
    ```
    {
        "_id": "507f1f77bcf86cd799439011",
        "email": "admin@agrimanage.com",
        "roles": ["ADMIN"],
        "is_active": true,
        "created_at": "2025-01-01T00:00:00Z",
        "last_login": "2025-11-17T12:00:00Z"
    }
    ```
    """
    return UserOut.from_mongo(current_user)


@router.post(
    "/change-password",
    summary="Change password",
    description="Change password for the currently authenticated user"
)
async def change_password(
    request: PasswordChangeRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Change password endpoint - allows users to update their password.
    
    **Authentication Required:** Yes
    
    **Example Request:**
    ```
    {
        "current_password": "OldPass123",
        "new_password": "NewSecurePass456"
    }
    ```
    """
    # Verify current password
    if not verify_password(request.current_password, current_user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Validate new password strength (Pydantic validator already checked, but double-check)
    is_valid, error_msg = validate_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Ensure new password is different from old
    if request.current_password == request.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )
    
    # Hash new password
    new_password_hash = hash_password(request.new_password)
    
    # Update password in database
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"email": current_user["email"]},
        {
            "$set": {
                "password_hash": new_password_hash,
                "updated_at": now
            }
        }
    )
    
    return {
        "message": "Password changed successfully",
        "email": current_user["email"]
    }


@router.post(
    "/logout",
    summary="Logout (client-side token removal)",
    description="Logout is handled client-side by removing the token. This endpoint is for tracking purposes."
)
async def logout(
    current_user: dict = Depends(get_current_user)
):
    """
    Logout endpoint.
    
    **Note:** JWT tokens are stateless, so logout is handled client-side by:
    1. Removing the token from localStorage/sessionStorage
    2. Clearing any auth state in the frontend
    
    This endpoint can be used for:
    - Logging logout events
    - Invalidating refresh tokens (if stored server-side)
    - Analytics
    """
    return {
        "message": "Logged out successfully",
        "email": current_user["email"]
    }
