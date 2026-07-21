"""
LeadPilot — Meta OAuth & Asset Management Router.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.auth.dependencies import get_current_user
from app.core.security import encrypt_token, decrypt_token
from app.db.mongodb import users_collection, meta_accounts_collection
from app.models.meta_account import (
    MetaConnectRequest, MetaStatusResponse, MetaDiagnosticResult,
    MetaAssetsResponse, MetaBusinessManager, MetaAdAccount, MetaPage,
)
from app.services.meta_service import (
    build_oauth_url, exchange_code_for_long_lived_token,
    run_asset_diagnostics, fetch_user_businesses,
    fetch_user_ad_accounts, fetch_user_pages,
)

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/oauth/init")
async def init_meta_oauth(user: dict = Depends(get_current_user)):
    """Return Facebook OAuth authorization URL."""
    state = str(user["_id"])
    url = build_oauth_url(state)
    return {"oauth_url": url, "state": state}


@router.get("/oauth/callback")
async def meta_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
):
    """
    OAuth Callback hit by Facebook redirect.
    Exchanges code for long-lived token, encrypts token at rest, and runs AI asset diagnostics.
    """
    user_id = state
    user = await users_collection().find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User session invalid")

    # 1. Exchange token
    long_lived_token = await exchange_code_for_long_lived_token(code)
    encrypted_token = encrypt_token(long_lived_token)

    # 2. Run Diagnostic
    diagnostic = await run_asset_diagnostics(user_id, long_lived_token)

    # 3. Store temp meta account doc
    await meta_accounts_collection().update_one(
        {"user_id": str(user["_id"])},
        {
            "$set": {
                "user_id": str(user["_id"]),
                "access_token_encrypted": encrypted_token,
                "status": "pending",
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )

    return {
        "status": "success",
        "diagnostic": diagnostic,
    }


@router.get("/assets", response_model=MetaAssetsResponse)
async def get_meta_assets(user: dict = Depends(get_current_user)):
    """Fetch available Business Managers, Ad Accounts, and Pages for current user."""
    meta_acc = await meta_accounts_collection().find_one({"user_id": str(user["_id"])})
    if not meta_acc or not meta_acc.get("access_token_encrypted"):
        # Return fallback/sandbox assets if not connected yet
        return MetaAssetsResponse(
            businesses=[MetaBusinessManager(id="bm_981247129", name="Candle Craft Business")],
            ad_accounts=[MetaAdAccount(id="act_40912401", name="Candle Craft Main Ad Acc", account_status=1, currency="INR")],
            pages=[MetaPage(id="page_88124019", name="Candle Craft India")],
        )

    token = decrypt_token(meta_acc["access_token_encrypted"])
    bms = await fetch_user_businesses(token)
    ad_accs = await fetch_user_ad_accounts(token)
    pages = await fetch_user_pages(token)

    return MetaAssetsResponse(
        businesses=[MetaBusinessManager(**b) for b in bms],
        ad_accounts=[MetaAdAccount(**a) for a in ad_accs],
        pages=[MetaPage(**p) for p in pages],
    )


@router.post("/connect", response_model=MetaStatusResponse)
async def finalize_meta_connect(
    body: MetaConnectRequest,
    user: dict = Depends(get_current_user),
):
    """
    Finalize asset selection (bind selected ad_account_id, page_id, bm_id, pixel_id to user profile)
    and set status to 'connected'.
    """
    user_id = str(user["_id"])
    now = datetime.utcnow()

    # Update user document
    await users_collection().update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "meta_connection.status": "connected",
                "meta_connection.ad_account_id": body.ad_account_id,
                "meta_connection.page_id": body.page_id,
                "meta_connection.bm_id": body.bm_id,
                "meta_connection.connected_at": now,
                "updated_at": now,
            }
        },
    )

    # Update meta_accounts collection
    await meta_accounts_collection().update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "ad_account_id": body.ad_account_id,
                "page_id": body.page_id,
                "bm_id": body.bm_id,
                "pixel_id": body.pixel_id,
                "status": "connected",
                "connected_at": now,
                "updated_at": now,
            }
        },
        upsert=True,
    )

    return MetaStatusResponse(
        status="connected",
        ad_account_id=body.ad_account_id,
        page_id=body.page_id,
        bm_id=body.bm_id,
        pixel_id=body.pixel_id,
        connected_at=now,
    )


@router.post("/disconnect", response_model=MetaStatusResponse)
async def disconnect_meta(user: dict = Depends(get_current_user)):
    """Disconnect Meta account."""
    user_id = str(user["_id"])
    now = datetime.utcnow()

    await users_collection().update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "meta_connection.status": "not_connected",
                "meta_connection.ad_account_id": None,
                "meta_connection.page_id": None,
                "meta_connection.bm_id": None,
                "meta_connection.connected_at": None,
                "updated_at": now,
            }
        },
    )

    await meta_accounts_collection().delete_one({"user_id": user_id})

    return MetaStatusResponse(status="not_connected")


@router.get("/status", response_model=MetaStatusResponse)
async def get_meta_status(user: dict = Depends(get_current_user)):
    """Get current Meta connection status."""
    meta_conn = user.get("meta_connection", {})
    return MetaStatusResponse(
        status=meta_conn.get("status", "not_connected"),
        ad_account_id=meta_conn.get("ad_account_id"),
        page_id=meta_conn.get("page_id"),
        bm_id=meta_conn.get("bm_id"),
        connected_at=meta_conn.get("connected_at"),
    )
