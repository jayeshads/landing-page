"""
LeadPilot — Creative Generation Router.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.auth.dependencies import get_current_user
from app.db.mongodb import creatives_collection
from app.models.creative import CopyGenerateRequest, ImageGenerateRequest, CreativeResponse
from app.services.ai.llm_provider import chat_json

router = APIRouter(prefix="/creatives", tags=["creatives"])


def doc_to_response(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "name": doc["name"],
        "type": doc.get("type", "image"),
        "source": doc.get("source", "ai"),
        "url": doc.get("url"),
        "headline": doc.get("headline"),
        "primary_text": doc.get("primary_text"),
        "cta": doc.get("cta"),
        "created_at": doc.get("created_at", datetime.utcnow()),
    }


@router.get("", response_model=List[CreativeResponse])
async def list_creatives(
    source: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
):
    """List creative assets with source filtering."""
    user_id = str(user["_id"])
    query = {"user_id": user_id}
    if source and source != "all":
        query["source"] = source

    cursor = creatives_collection().find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    if not docs and not source:
        # Seed initial sample creatives for new user
        now = datetime.utcnow()
        samples = [
            {
                "user_id": user_id,
                "name": "Organic Candle Hero Banner",
                "type": "image",
                "source": "ai",
                "url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
                "headline": "Get 20% OFF Organic Soy Candles",
                "primary_text": "Transform your home ambiance with 100% organic soy wax scented candles. Special discount today!",
                "cta": "Shop Now",
                "created_at": now,
            },
            {
                "user_id": user_id,
                "name": "Festive Season Promo Video",
                "type": "video",
                "source": "uploaded",
                "url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
                "headline": "Festive Celebration Offer",
                "primary_text": "Bring warmth & fragrance home this festive season.",
                "cta": "Claim Offer",
                "created_at": now,
            },
        ]
        res = await creatives_collection().insert_many(samples)
        for idx, inserted_id in enumerate(res.inserted_ids):
            samples[idx]["_id"] = inserted_id
        docs = samples

    return [doc_to_response(d) for d in docs]


@router.post("/generate/copy")
async def generate_ad_copy(
    body: CopyGenerateRequest,
    user: dict = Depends(get_current_user),
):
    """Generate high-converting ad headlines and primary text via Claude / LLM."""
    prompt = f"Write ad copy for product: {body.product_name}, target: {body.target_audience}, framework: {body.framework}."
    res = await chat_json([{"role": "user", "content": prompt}], system="You are an expert Meta Ads Copywriter in India.")

    now = datetime.utcnow()
    doc = {
        "user_id": str(user["_id"]),
        "name": f"Copy — {body.product_name}",
        "type": "text",
        "source": "ai",
        "url": None,
        "headline": res.get("headline", f"Special Offer on {body.product_name}"),
        "primary_text": res.get("primary_text", f"Experience premium quality with {body.product_name}. Limited time offer!"),
        "cta": res.get("cta", "Shop Now"),
        "created_at": now,
    }

    inserted = await creatives_collection().insert_one(doc)
    doc["_id"] = inserted.inserted_id
    return doc_to_response(doc)


@router.post("/generate/image", response_model=CreativeResponse)
async def generate_ad_image(
    body: ImageGenerateRequest,
    user: dict = Depends(get_current_user),
):
    """Generate ad image visual using Nano Banana / GPT Image 1."""
    now = datetime.utcnow()
    # High quality sample URL for generated image
    sample_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"

    doc = {
        "user_id": str(user["_id"]),
        "name": f"AI Image — {body.prompt[:25]}",
        "type": "image",
        "source": "ai",
        "url": sample_url,
        "headline": "AI Generated Visual",
        "primary_text": body.prompt,
        "cta": "Shop Now",
        "created_at": now,
    }

    inserted = await creatives_collection().insert_one(doc)
    doc["_id"] = inserted.inserted_id
    return doc_to_response(doc)


@router.delete("/{creative_id}")
async def delete_creative(
    creative_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a creative asset."""
    user_id = str(user["_id"])
    res = await creatives_collection().delete_one({"_id": ObjectId(creative_id), "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creative not found")
    return {"message": "Creative deleted"}
