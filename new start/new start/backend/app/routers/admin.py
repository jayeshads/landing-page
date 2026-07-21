"""
LeadPilot — Super Admin Management Router.
"""
import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from pydantic import BaseModel
from bson import ObjectId

from app.auth.dependencies import require_admin
from app.db.mongodb import (
    users_collection, campaigns_collection, creatives_collection,
    landing_pages_collection, support_tickets_collection, meta_accounts_collection
)
from app.services.ai.knowledge_loader import SKILLS_DIR, load_all_skills

router = APIRouter(prefix="/admin", tags=["admin"])


class UserStatusUpdate(BaseModel):
    status: Optional[str] = None  # active | blocked
    funds_frozen: Optional[bool] = None


@router.get("/users")
async def list_admin_users(
    search: Optional[str] = Query(None),
    admin_user: dict = Depends(require_admin),
):
    """List all registered platform users for admin overview."""
    query = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
        ]

    cursor = users_collection().find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    return [
        {
            "id": str(d["_id"]),
            "email": d["email"],
            "full_name": d["full_name"],
            "phone": d.get("phone", ""),
            "role": d.get("role", "client"),
            "status": d.get("status", "active"),
            "funds_frozen": d.get("funds_frozen", False),
            "workspace": d.get("workspace", {}),
            "credits_remaining": d.get("credits_remaining", 0),
            "created_at": d.get("created_at"),
        }
        for d in docs
    ]


@router.get("/users/{user_id}/full-profile")
async def get_user_deep_profile(
    user_id: str,
    admin_user: dict = Depends(require_admin),
):
    """
    Super Admin Deep User Profile inspection returning all business details,
    ad account credentials, campaign counts, generated images, and landing page stats.
    """
    user_doc = await users_collection().find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Meta Account Details
    meta_acc = await meta_accounts_collection().find_one({"user_id": user_id})

    # Campaign stats
    total_campaigns = await campaigns_collection().count_documents({"user_id": user_id})
    active_campaigns = await campaigns_collection().count_documents({"user_id": user_id, "status": "active"})
    draft_campaigns = await campaigns_collection().count_documents({"user_id": user_id, "status": "draft"})

    # Creative stats
    ai_images_count = await creatives_collection().count_documents({"user_id": user_id, "source": "ai"})
    uploaded_count = await creatives_collection().count_documents({"user_id": user_id, "source": "uploaded"})

    # Landing pages
    total_landing = await landing_pages_collection().count_documents({"user_id": user_id})

    return {
        "user_info": {
            "id": str(user_doc["_id"]),
            "email": user_doc["email"],
            "full_name": user_doc["full_name"],
            "phone": user_doc.get("phone", ""),
            "telegram": user_doc.get("telegram"),
            "role": user_doc.get("role", "client"),
            "status": user_doc.get("status", "active"),
            "funds_frozen": user_doc.get("funds_frozen", False),
            "password_view": "•••••••• (Encrypted bcrypt hash)",
            "credits_remaining": user_doc.get("credits_remaining", 0),
            "created_at": user_doc.get("created_at"),
        },
        "workspace": user_doc.get("workspace", {}),
        "meta_account_details": {
            "status": user_doc.get("meta_connection", {}).get("status", "not_connected"),
            "ad_account_id": user_doc.get("meta_connection", {}).get("ad_account_id") or (meta_acc.get("ad_account_id") if meta_acc else None),
            "bm_id": user_doc.get("meta_connection", {}).get("bm_id") or (meta_acc.get("bm_id") if meta_acc else None),
            "page_id": user_doc.get("meta_connection", {}).get("page_id") or (meta_acc.get("page_id") if meta_acc else None),
            "funds_requested_from_meta": "₹50,000 / month limit",
        },
        "statistics": {
            "total_campaigns": total_campaigns,
            "active_campaigns": active_campaigns,
            "draft_campaigns": draft_campaigns,
            "ai_images_generated": ai_images_count,
            "user_images_uploaded": uploaded_count,
            "landing_pages_used": total_landing,
        },
    }


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    body: UserStatusUpdate,
    admin_user: dict = Depends(require_admin),
):
    """Block/unblock user login or freeze/unfreeze spend capability."""
    update_fields = {}
    if body.status:
        update_fields["status"] = body.status
    if body.funds_frozen is not None:
        update_fields["funds_frozen"] = body.funds_frozen

    if not update_fields:
        return {"message": "No updates provided"}

    update_fields["updated_at"] = datetime.utcnow()

    res = await users_collection().update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields},
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"message": "User status updated successfully", "updated": update_fields}


@router.get("/support-tickets")
async def list_admin_support_tickets(admin_user: dict = Depends(require_admin)):
    """List automated support requests (triggered from missing Meta assets diagnostic)."""
    cursor = support_tickets_collection().find().sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    return [
        {
            "id": str(d["_id"]),
            "user_id": str(d.get("user_id")),
            "title": d.get("title"),
            "status": d.get("status", "open"),
            "priority": d.get("priority", "high"),
            "description": d.get("description"),
            "created_at": d.get("created_at"),
        }
        for d in docs
    ]


@router.post("/skills/upload")
async def upload_skill_file(
    file: UploadFile = File(...),
    admin_user: dict = Depends(require_admin),
):
    """Upload a new .md skill file for the AI Knowledge Manager."""
    if not file.filename.endswith(".md"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .md files allowed")

    file_path = os.path.join(SKILLS_DIR, file.filename)
    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    return {"message": f"Skill file {file.filename} uploaded successfully", "path": file_path}


@router.get("/skills")
async def list_all_skills(admin_user: dict = Depends(require_admin)):
    """List all AI knowledge .md skill files and content."""
    return load_all_skills()
