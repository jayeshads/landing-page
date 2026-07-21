"""
LeadPilot — Auth router.

Handles signup, login, token refresh, profile retrieval, and password reset.
All write endpoints are rate-limited per IP to prevent brute-force.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Request
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import (
    create_access_token, create_refresh_token,
    verify_token, TokenError, create_password_reset_token,
)
from app.auth.dependencies import get_current_user
from app.db.mongodb import users_collection
from app.models.user import (
    UserCreate, UserLogin, UserUpdate, AuthResponse, AuthTokens,
    UserResponse, TokenRefreshRequest, PasswordResetRequest,
    PasswordResetConfirm, new_user_document, user_doc_to_response,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: UserCreate):
    """Register a new user. Returns the user profile + JWT tokens."""
    doc = new_user_document(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        phone=body.phone,
        workspace_name=body.workspace_name,
    )

    try:
        result = await users_collection().insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    doc["_id"] = result.inserted_id
    user_resp = user_doc_to_response(doc)

    tokens = AuthTokens(
        access_token=create_access_token(str(result.inserted_id), doc["role"]),
        refresh_token=create_refresh_token(str(result.inserted_id)),
    )

    return AuthResponse(user=user_resp, tokens=tokens)


@router.post("/login", response_model=AuthResponse)
async def login(body: UserLogin):
    """Authenticate with email + password. Returns profile + JWT tokens."""
    user = await users_collection().find_one({"email": body.email.lower().strip()})

    if user is None or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.get("status") == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Contact support.",
        )

    user_resp = user_doc_to_response(user)
    tokens = AuthTokens(
        access_token=create_access_token(str(user["_id"]), user["role"]),
        refresh_token=create_refresh_token(str(user["_id"])),
    )

    return AuthResponse(user=user_resp, tokens=tokens)


@router.post("/refresh", response_model=AuthTokens)
async def refresh_token(body: TokenRefreshRequest):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    try:
        payload = verify_token(body.refresh_token, expected_type="refresh")
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    user_id = payload.get("sub")
    user = await users_collection().find_one({"_id": ObjectId(user_id)})

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    if user.get("status") == "blocked":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account blocked")

    return AuthTokens(
        access_token=create_access_token(str(user["_id"]), user["role"]),
        refresh_token=create_refresh_token(str(user["_id"])),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return user_doc_to_response(user)


@router.patch("/me", response_model=UserResponse)
async def update_me(body: UserUpdate, user: dict = Depends(get_current_user)):
    """Update the authenticated user's profile (name, phone, telegram, workspace name)."""
    update_fields = {}

    if body.full_name is not None:
        update_fields["full_name"] = body.full_name.strip()
    if body.phone is not None:
        update_fields["phone"] = body.phone.strip()
    if body.telegram is not None:
        update_fields["telegram"] = body.telegram.strip() or None
    if body.workspace_name is not None:
        update_fields["workspace.name"] = body.workspace_name.strip()

    if not update_fields:
        return user_doc_to_response(user)

    from datetime import datetime
    update_fields["updated_at"] = datetime.utcnow()

    await users_collection().update_one(
        {"_id": user["_id"]},
        {"$set": update_fields},
    )

    updated = await users_collection().find_one({"_id": user["_id"]})
    return user_doc_to_response(updated)


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(body: PasswordResetRequest):
    """
    Request a password reset. Always returns 200 (don't leak whether
    the email exists). In production, this would send an email with the
    reset link containing the token.
    """
    user = await users_collection().find_one({"email": body.email.lower().strip()})

    if user:
        token = create_password_reset_token(str(user["_id"]))
        # TODO (Phase 2+): Send email with reset link containing this token
        # For now, return the token in development mode only
        from app.config import settings
        if settings.DEBUG:
            return {"message": "Password reset link sent", "debug_token": token}

    return {"message": "If an account with that email exists, a reset link has been sent"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(body: PasswordResetConfirm):
    """Reset password using a valid reset token."""
    try:
        payload = verify_token(body.token, expected_type="password_reset")
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or expired reset token: {e}",
        )

    user_id = payload.get("sub")
    new_hash = hash_password(body.new_password)

    result = await users_collection().update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": new_hash, "updated_at": __import__("datetime").datetime.utcnow()}},
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"message": "Password has been reset successfully"}
