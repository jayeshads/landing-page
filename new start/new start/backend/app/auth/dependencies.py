"""
LeadPilot — FastAPI auth dependencies.

These are injected into route handlers via `Depends(...)` to extract
and validate the current user from the Authorization header.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from app.auth.jwt_handler import verify_token, TokenError
from app.db.mongodb import users_collection

# HTTPBearer extracts "Bearer <token>" from the Authorization header
_bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """
    FastAPI dependency: extracts JWT from Authorization header, verifies it,
    looks up the user in MongoDB, and returns the full user document.

    Raises 401 if the token is invalid/expired or the user doesn't exist.
    Raises 403 if the user account is blocked.
    """
    try:
        payload = verify_token(credentials.credentials, expected_type="access")
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id or not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = await users_collection().find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if user.get("status") == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Contact support.",
        )

    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    FastAPI dependency: ensures the current user has admin or super_admin role.
    Chain after get_current_user.
    """
    if user.get("role") not in ("admin", "super_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


async def optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
) -> dict | None:
    """
    Like get_current_user but returns None instead of raising if no token
    is provided. Useful for endpoints that work differently for logged-in
    vs anonymous users (e.g. public landing pages).
    """
    if credentials is None:
        return None

    try:
        payload = verify_token(credentials.credentials, expected_type="access")
    except TokenError:
        return None

    user_id = payload.get("sub")
    if not user_id or not ObjectId.is_valid(user_id):
        return None

    return await users_collection().find_one({"_id": ObjectId(user_id)})
