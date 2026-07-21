"""
LeadPilot — JWT token creation and verification.

Access tokens are short-lived (15 min default). Refresh tokens are
long-lived (7 days default). Both are signed with the same HS256 secret
but carry a different `type` claim so one can't be used in place of the other.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from app.config import settings


class TokenError(Exception):
    """Raised when a token is invalid, expired, or of the wrong type."""
    pass


def create_access_token(user_id: str, role: str) -> str:
    """Create a short-lived access token."""
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create a long-lived refresh token."""
    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> dict:
    """
    Decode and validate a JWT. Returns the payload dict.

    Raises TokenError if the token is expired, malformed, or the `type`
    claim doesn't match `expected_type`.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise TokenError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise TokenError(f"Invalid token: {e}")

    if payload.get("type") != expected_type:
        raise TokenError(f"Expected {expected_type} token, got {payload.get('type')}")

    return payload


def create_password_reset_token(user_id: str) -> str:
    """Create a short-lived token for password reset (30 min)."""
    payload = {
        "sub": user_id,
        "type": "password_reset",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
