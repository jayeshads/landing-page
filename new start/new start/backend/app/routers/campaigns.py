"""
LeadPilot — Campaign Router.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.auth.dependencies import get_current_user
from app.db.mongodb import campaigns_collection
from app.models.campaign import CampaignCreate, CampaignResponse, MetricsCache
from app.services.meta_service import publish_campaign_to_meta

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def doc_to_response(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "meta_campaign_id": doc.get("meta_campaign_id"),
        "name": doc["name"],
        "objective": doc["objective"],
        "status": doc.get("status", "draft"),
        "budget": doc.get("budget", {"type": "daily", "amount": 500}),
        "placements": doc.get("placements", ["facebook_feed", "instagram_feed"]),
        "adsets": doc.get("adsets", []),
        "metrics_cache": doc.get("metrics_cache", {"spend": 0, "leads": 0, "cpl": 0, "cpc": 0, "roas": 0}),
        "has_recommendation": doc.get("has_recommendation", False),
        "created_at": doc.get("created_at", datetime.utcnow()),
        "updated_at": doc.get("updated_at", datetime.utcnow()),
    }


@router.get("", response_model=List[CampaignResponse])
async def list_campaigns(
    status_filter: Optional[str] = Query(None, alias="status"),
    user: dict = Depends(get_current_user),
):
    user_id = str(user["_id"])
    query = {"user_id": user_id}
    if status_filter:
        query["status"] = status_filter

    cursor = campaigns_collection().find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    if not docs and not status_filter:
        now = datetime.utcnow()
        sample_doc = {
            "user_id": user_id,
            "meta_campaign_id": "meta_camp_89124",
            "name": "Handmade Candles — Lead Gen Q3",
            "objective": "OUTCOME_LEADS",
            "status": "active",
            "budget": {"type": "daily", "amount": 500},
            "placements": ["facebook_feed", "instagram_feed", "instagram_stories"],
            "adsets": [
                {
                    "name": "Home Decor Lovers",
                    "audience": {"name": "Home Scent", "locations": ["India"], "age_min": 21, "age_max": 45, "interests": ["Candles", "Aromatherapy"]},
                    "ads": [{"headline": "20% OFF Organic Candles", "primary_text": "100% Soy Wax Scented Candles", "cta": "Shop Now"}],
                }
            ],
            "metrics_cache": {"spend": 12400.0, "leads": 78, "cpl": 158.9, "cpc": 12.4, "roas": 3.4, "impressions": 45000},
            "has_recommendation": True,
            "created_at": now,
            "updated_at": now,
        }
        res = await campaigns_collection().insert_one(sample_doc)
        sample_doc["_id"] = res.inserted_id
        docs = [sample_doc]

    return [doc_to_response(d) for d in docs]


@router.post("/draft", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign_draft(
    body: CampaignCreate,
    user: dict = Depends(get_current_user),
):
    now = datetime.utcnow()
    doc = {
        "user_id": str(user["_id"]),
        "meta_campaign_id": None,
        "name": body.name,
        "objective": body.objective,
        "status": "draft",
        "budget": body.budget.dict(),
        "placements": body.placements,
        "adsets": [a.dict() for a in body.adsets],
        "metrics_cache": MetricsCache().dict(),
        "has_recommendation": False,
        "created_at": now,
        "updated_at": now,
    }

    res = await campaigns_collection().insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc_to_response(doc)


@router.post("/{campaign_id}/publish")
async def publish_campaign(
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    """Publish campaign to Meta Marketing API."""
    user_id = str(user["_id"])
    return await publish_campaign_to_meta(user_id, campaign_id)


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    user_id = str(user["_id"])
    doc = await campaigns_collection().find_one({"_id": ObjectId(campaign_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return doc_to_response(doc)


@router.patch("/{campaign_id}/toggle", response_model=CampaignResponse)
async def toggle_campaign_status(
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    user_id = str(user["_id"])
    doc = await campaigns_collection().find_one({"_id": ObjectId(campaign_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    new_status = "paused" if doc.get("status") == "active" else "active"
    now = datetime.utcnow()

    await campaigns_collection().update_one(
        {"_id": ObjectId(campaign_id)},
        {"$set": {"status": new_status, "updated_at": now}},
    )

    doc["status"] = new_status
    doc["updated_at"] = now
    return doc_to_response(doc)


@router.delete("/{campaign_id}", status_code=status.HTTP_200_OK)
async def delete_campaign(
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    user_id = str(user["_id"])
    res = await campaigns_collection().delete_one({"_id": ObjectId(campaign_id), "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return {"message": "Campaign deleted successfully"}


@router.get("/{campaign_id}/recommendations")
async def get_campaign_recommendations(
    campaign_id: str,
    user: dict = Depends(get_current_user),
):
    user_id = str(user["_id"])
    doc = await campaigns_collection().find_one({"_id": ObjectId(campaign_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    return {
        "campaign_id": campaign_id,
        "recommendations": [
            {
                "id": "rec_1",
                "type": "budget_scale",
                "title": "Scale High Performing Ad Set",
                "description": "CPL is ₹120 (30% lower than average). Increase daily budget from ₹500 to ₹800.",
                "action_type": "update_budget",
                "new_budget": 800,
            },
        ],
    }
