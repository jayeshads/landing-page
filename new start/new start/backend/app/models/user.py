"""
LeadPilot — User models (Pydantic v2).

Covers signup/login request bodies, the internal DB document shape, and
the sanitized response shape returned to the frontend.
"""
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field


# ─── Nested sub-models ───

class WorkspaceMember(BaseModel):
    user_id: str
    role: Literal["owner", "editor", "viewer"] = "viewer"
    invited_at: datetime = Field(default_factory=datetime.utcnow)


class Workspace(BaseModel):
    name: str = ""
    slug: str = ""
    members: List[WorkspaceMember] = []


class Subscription(BaseModel):
    razorpay_sub_id: Optional[str] = None
    status: Literal["active", "cancelled", "expired", "trial"] = "trial"
    trial_ends_at: Optional[datetime] = None
    current_period_end: Optional[datetime] = None


class MetaConnection(BaseModel):
    status: Literal["not_connected", "connected", "expired"] = "not_connected"
    access_token_encrypted: Optional[str] = None
    ad_account_id: Optional[str] = None
    page_id: Optional[str] = None
    bm_id: Optional[str] = None
    connected_at: Optional[datetime] = None


# ─── Request models ───

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)
    phone: str = Field(default="", max_length=20)
    workspace_name: str = Field(default="", max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=128)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    telegram: Optional[str] = None
    workspace_name: Optional[str] = None


# ─── Response models ───

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str
    telegram: Optional[str] = None
    role: str
    status: str
    email_verified: bool
    workspace: Workspace
    subscription: Subscription
    credits_remaining: int
    meta_connection: MetaConnection
    created_at: datetime
    updated_at: datetime


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: AuthTokens


class TokenRefreshRequest(BaseModel):
    refresh_token: str


# ─── Internal DB document helpers ───

def new_user_document(email: str, password_hash: str, full_name: str,
                      phone: str = "", workspace_name: str = "") -> dict:
    """Returns a dict ready to insert into MongoDB's users collection."""
    now = datetime.utcnow()
    slug = workspace_name.lower().replace(" ", "-").strip() if workspace_name else email.split("@")[0]

    return {
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "full_name": full_name.strip(),
        "phone": phone.strip(),
        "telegram": None,
        "role": "client",
        "status": "active",
        "funds_frozen": False,
        "email_verified": False,
        "workspace": {
            "name": workspace_name or full_name,
            "slug": slug,
            "members": [],
        },
        "plan_id": None,
        "subscription": {
            "razorpay_sub_id": None,
            "status": "trial",
            "trial_ends_at": None,
            "current_period_end": None,
        },
        "credits_remaining": 100,  # default free trial credits
        "meta_connection": {
            "status": "not_connected",
            "access_token_encrypted": None,
            "ad_account_id": None,
            "page_id": None,
            "bm_id": None,
            "connected_at": None,
        },
        "created_at": now,
        "updated_at": now,
    }


def user_doc_to_response(doc: dict) -> UserResponse:
    """Converts a raw MongoDB user document to a safe UserResponse."""
    return UserResponse(
        id=str(doc["_id"]),
        email=doc["email"],
        full_name=doc["full_name"],
        phone=doc.get("phone", ""),
        telegram=doc.get("telegram"),
        role=doc["role"],
        status=doc["status"],
        email_verified=doc.get("email_verified", False),
        workspace=Workspace(**doc.get("workspace", {})),
        subscription=Subscription(**doc.get("subscription", {})),
        credits_remaining=doc.get("credits_remaining", 0),
        meta_connection=MetaConnection(**doc.get("meta_connection", {})),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )
