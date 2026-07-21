"""
LeadPilot — Plans, Promo Codes & Razorpay Payment Router.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from bson import ObjectId

from app.auth.dependencies import get_current_user, require_admin
from app.db.mongodb import plans_collection, promo_codes_collection, subscriptions_collection, users_collection
from app.config import settings

router = APIRouter(prefix="/plans", tags=["plans"])


class PlanCreate(BaseModel):
    name: str
    slug: str
    price_inr: float
    credits_per_month: int
    features: List[str] = []


class PromoApplyRequest(BaseModel):
    code: str


class RazorpayOrderRequest(BaseModel):
    plan_slug: str


@router.get("")
async def list_plans():
    """List public pricing plans."""
    cursor = plans_collection().find().sort("price_inr", 1)
    docs = await cursor.to_list(length=20)

    if not docs:
        # Seed default plans
        defaults = [
            {
                "name": "Free Trial",
                "slug": "free-trial",
                "price_inr": 0.0,
                "credits_per_month": 100,
                "features": ["1 Meta Connection", "Basic AI Campaign Builder", "Standard Support"],
            },
            {
                "name": "Starter Pro",
                "slug": "starter-pro",
                "price_inr": 2999.0,
                "credits_per_month": 1000,
                "features": ["All Free Features", "Multi-agent AI (Sonnet 4.5)", "AI Image Generation", "1-Click Recommendations"],
            },
            {
                "name": "Agency Scale",
                "slug": "agency-scale",
                "price_inr": 7999.0,
                "credits_per_month": 5000,
                "features": ["Unlimited Meta Accounts", "Multi-tenant Team Workspace", "Priority Custom Domain"],
            },
        ]
        res = await plans_collection().insert_many(defaults)
        for idx, inserted_id in enumerate(res.inserted_ids):
            defaults[idx]["_id"] = str(inserted_id)
        return defaults

    return [
        {
            "id": str(d["_id"]),
            "name": d["name"],
            "slug": d["slug"],
            "price_inr": d["price_inr"],
            "credits_per_month": d["credits_per_month"],
            "features": d.get("features", []),
        }
        for d in docs
    ]


@router.post("/promo/apply")
async def apply_promo_code(
    body: PromoApplyRequest,
    user: dict = Depends(get_current_user),
):
    """Validate & apply promo code."""
    code = body.code.upper().strip()

    if code == "LAUNCH50":
        return {
            "valid": True,
            "code": "LAUNCH50",
            "discount_percent": 50,
            "message": "50% Discount applied successfully!",
        }

    promo = await promo_codes_collection().find_one({"code": code, "active": True})
    if not promo:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired promo code")

    return {
        "valid": True,
        "code": promo["code"],
        "discount_percent": promo.get("discount_percent", 10),
        "message": f"{promo.get('discount_percent', 10)}% Discount applied!",
    }


@router.post("/razorpay/order")
async def create_razorpay_order(
    body: RazorpayOrderRequest,
    user: dict = Depends(get_current_user),
):
    """Create Razorpay order ID for subscription payment."""
    plan = await plans_collection().find_one({"slug": body.plan_slug})
    price = plan["price_inr"] if plan else 2999.0
    amount_in_paise = int(price * 100)

    # Simulated order structure (in production, calls razorpay.Client().order.create)
    order_id = f"order_rzp_{int(datetime.utcnow().timestamp())}"

    return {
        "order_id": order_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_placeholder",
    }


@router.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request):
    """Process Razorpay payment webhook events."""
    payload = await request.json()
    event = payload.get("event")

    if event in ("payment.captured", "subscription.charged"):
        # Update user subscription in MongoDB
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        email = payment_entity.get("email")
        if email:
            await users_collection().update_one(
                {"email": email.lower()},
                {"$set": {"subscription.status": "active", "updated_at": datetime.utcnow()}},
            )

    return {"status": "ok"}
