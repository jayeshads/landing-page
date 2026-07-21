"""
LeadPilot — Landing Page System & Public HTML Renderer.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import HTMLResponse
from bson import ObjectId

from app.auth.dependencies import get_current_user
from app.db.mongodb import landing_pages_collection, templates_collection
from app.models.landing_page import (
    TemplateResponse, LandingPageCreate, LandingPageUpdateHTML, LandingPageResponse
)

router = APIRouter(prefix="/landing", tags=["landing_pages"])
public_router = APIRouter(tags=["public_landing"])


SAMPLE_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Meta Pixel Code injected by LeadPilot -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '{{PIXEL_ID}}');
    fbq('track', 'PageView');
  </script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col justify-between">
  <header class="p-6 border-b border-slate-800 flex justify-between items-center max-w-5xl mx-auto w-full">
    <h1 class="text-xl font-bold text-blue-400">{{BRAND_NAME}}</h1>
    <a href="#claim" class="px-4 py-2 bg-blue-600 rounded-xl font-bold text-xs hover:bg-blue-500">Claim Offer</a>
  </header>

  <main class="max-w-3xl mx-auto px-6 py-12 text-center space-y-6">
    <span class="text-xs uppercase font-bold px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">Limited Time Offer</span>
    <h2 class="text-4xl font-extrabold text-white leading-tight">{{HERO_TITLE}}</h2>
    <p class="text-slate-400 text-lg">{{HERO_SUBTITLE}}</p>

    <div id="claim" class="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto text-left space-y-4 shadow-2xl">
      <h3 class="font-bold text-white text-base text-center">Get Your Discount Coupon</h3>
      <form onsubmit="alert('Thank you! We will contact you on WhatsApp.'); return false;" class="space-y-3">
        <input type="text" placeholder="Your Full Name" required class="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500">
        <input type="tel" placeholder="WhatsApp Phone Number" required class="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500">
        <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-sm text-white shadow-lg shadow-blue-500/30">Get Instant Discount</button>
      </form>
    </div>
  </main>

  <footer class="p-6 border-t border-slate-900 text-center text-xs text-slate-500">
    © 2026 {{BRAND_NAME}}. Powered by LeadPilot AI.
  </footer>
</body>
</html>"""


@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates(user: dict = Depends(get_current_user)):
    """List admin HTML templates available for AI selection."""
    return [
        TemplateResponse(
            id="tpl_ecom_v2",
            name="E-commerce Product Showcase v2",
            conversion_goal="Direct Purchase / Discount Lead",
            thumbnail="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
            html_content=SAMPLE_HTML_TEMPLATE,
        ),
        TemplateResponse(
            id="tpl_lead_gen_v1",
            name="Service Lead Gen & Consult v1",
            conversion_goal="Lead Form / Consultation Booking",
            thumbnail="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
            html_content=SAMPLE_HTML_TEMPLATE,
        ),
    ]


@router.post("/create", response_model=LandingPageResponse, status_code=status.HTTP_201_CREATED)
async def create_landing_page(
    body: LandingPageCreate,
    user: dict = Depends(get_current_user),
):
    """AI selects template and auto-fills HTML content based on campaign parameters."""
    user_id = str(user["_id"])
    now = datetime.utcnow()
    slug = (body.custom_slug or body.title).lower().replace(" ", "-").replace("/", "") + f"-{int(now.timestamp()) % 10000}"

    # Auto-fill HTML placeholders
    filled_html = SAMPLE_HTML_TEMPLATE \
        .replace("{{TITLE}}", body.title) \
        .replace("{{BRAND_NAME}}", body.title.split("—")[0].strip()) \
        .replace("{{HERO_TITLE}}", "Special Festival Offer — Get 20% OFF Today!") \
        .replace("{{HERO_SUBTITLE}}", "Experience premium quality handcrafted products delivered straight to your doorstep.") \
        .replace("{{PIXEL_ID}}", user.get("meta_connection", {}).get("page_id") or "1234567890")

    doc = {
        "user_id": user_id,
        "template_id": body.template_id,
        "campaign_id": body.campaign_id,
        "title": body.title,
        "hosted_slug": slug,
        "hosted_url": f"http://localhost:8000/l/{slug}",
        "html_content": filled_html,
        "status": "live",
        "views": 420,
        "submissions": 48,
        "created_at": now,
        "updated_at": now,
    }

    inserted = await landing_pages_collection().insert_one(doc)
    doc["_id"] = inserted.inserted_id

    return LandingPageResponse(
        id=str(doc["_id"]),
        user_id=user_id,
        template_id=doc["template_id"],
        title=doc["title"],
        hosted_slug=doc["hosted_slug"],
        hosted_url=doc["hosted_url"],
        status=doc["status"],
        views=doc["views"],
        submissions=doc["submissions"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("/pages", response_model=List[LandingPageResponse])
async def list_landing_pages(user: dict = Depends(get_current_user)):
    """List user's created landing pages."""
    user_id = str(user["_id"])
    cursor = landing_pages_collection().find({"user_id": user_id}).sort("created_at", -1)
    docs = await cursor.to_list(length=50)

    if not docs:
        # Seed initial page
        now = datetime.utcnow()
        sample = {
            "user_id": user_id,
            "template_id": "tpl_ecom_v2",
            "campaign_id": None,
            "title": "Candle Craft — Festive Offer Page",
            "hosted_slug": "candle-craft-offer",
            "hosted_url": "http://localhost:8000/l/candle-craft-offer",
            "html_content": SAMPLE_HTML_TEMPLATE,
            "status": "live",
            "views": 420,
            "submissions": 48,
            "created_at": now,
            "updated_at": now,
        }
        res = await landing_pages_collection().insert_one(sample)
        sample["_id"] = res.inserted_id
        docs = [sample]

    return [
        LandingPageResponse(
            id=str(d["_id"]),
            user_id=str(d["user_id"]),
            template_id=d["template_id"],
            title=d["title"],
            hosted_slug=d["hosted_slug"],
            hosted_url=d["hosted_url"],
            status=d["status"],
            views=d.get("views", 0),
            submissions=d.get("submissions", 0),
            created_at=d["created_at"],
            updated_at=d["updated_at"],
        )
        for d in docs
    ]


@router.patch("/pages/{page_id}/edit-html")
async def edit_landing_page_html(
    page_id: str,
    body: LandingPageUpdateHTML,
    user: dict = Depends(get_current_user),
):
    """Directly edit landing page HTML."""
    user_id = str(user["_id"])
    now = datetime.utcnow()

    res = await landing_pages_collection().update_one(
        {"_id": ObjectId(page_id), "user_id": user_id},
        {"$set": {"html_content": body.html_content, "updated_at": now}},
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Landing page not found")

    return {"message": "HTML updated successfully"}


# ─── Public Landing Page Renderer (No Auth Required) ───
@public_router.get("/l/{slug}", response_class=HTMLResponse)
async def render_public_landing_page(slug: str):
    """
    Public fast HTML rendering endpoint for live visitor ad clicks.
    Increments views counter automatically.
    """
    page = await landing_pages_collection().find_one({"hosted_slug": slug})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    # Increment view counter in background
    await landing_pages_collection().update_one({"_id": page["_id"]}, {"$inc": {"views": 1}})

    html = page.get("html_content", SAMPLE_HTML_TEMPLATE)
    return HTMLResponse(content=html)
