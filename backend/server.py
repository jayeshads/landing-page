from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import uuid
import logging
import secrets
import ipaddress
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# -----------------------------------------------------------------------------
# Logging & DB
# -----------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("cloakforge")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET_ENV = "JWT_SECRET"
JWT_ALGORITHM = "HS256"

app = FastAPI(title="CloakForge API")
api = APIRouter(prefix="/api")

# -----------------------------------------------------------------------------
# Static bot intel lists (Built-in, no external API)
# -----------------------------------------------------------------------------
KNOWN_BOT_UA_PATTERNS = [
    "googlebot", "google-inspectiontool", "adsbot-google", "bingbot", "duckduckbot",
    "baiduspider", "yandexbot", "facebookexternalhit", "facebot", "twitterbot",
    "linkedinbot", "slackbot", "telegrambot", "whatsapp", "discordbot", "pinterest",
    "rogerbot", "ahrefsbot", "semrushbot", "mj12bot", "dotbot", "spbot",
    "petalbot", "applebot", "yahoo! slurp", "yahooseeker", "exabot", "sogou",
    "headlesschrome", "phantomjs", "puppeteer", "selenium", "playwright",
    "python-requests", "curl/", "wget/", "go-http-client", "okhttp", "java/",
    "axios", "scrapy", "httpclient", "perl", "lwp::simple", "ruby",
    "bot", "crawler", "spider", "scraper", "monitor", "uptime", "preview",
    "fetch", "checker", "validator", "lighthouse", "pingdom", "gtmetrix",
    "pagespeed", "chrome-lighthouse",
]

# Known datacenter / cloud / scanner CIDR blocks (subset — built-in static intel)
DATACENTER_CIDRS = [
    # Google
    "8.8.8.0/24", "8.34.208.0/20", "8.35.192.0/20", "34.64.0.0/10", "34.128.0.0/10",
    "35.184.0.0/13", "35.192.0.0/14", "35.196.0.0/15", "35.198.0.0/16", "35.199.0.0/17",
    "66.249.64.0/19", "72.14.192.0/18", "74.125.0.0/16", "108.59.80.0/20",
    "108.170.192.0/18", "130.211.0.0/16", "146.148.0.0/17", "162.216.148.0/22",
    "172.217.0.0/16", "173.194.0.0/16", "207.223.160.0/20", "209.85.128.0/17",
    "216.58.192.0/19", "216.239.32.0/19",
    # Amazon AWS
    "3.0.0.0/8", "13.32.0.0/15", "13.224.0.0/14", "15.177.0.0/18", "18.0.0.0/8",
    "23.20.0.0/14", "34.192.0.0/10", "35.71.64.0/22", "50.16.0.0/15", "52.0.0.0/11",
    "52.32.0.0/11", "52.64.0.0/12", "52.80.0.0/12", "52.94.0.0/22", "52.119.128.0/17",
    "54.64.0.0/11", "54.144.0.0/12", "54.160.0.0/11", "54.192.0.0/12", "54.208.0.0/13",
    "54.224.0.0/11", "54.240.0.0/12", "67.202.0.0/18", "72.21.192.0/19",
    "75.101.128.0/17", "174.129.0.0/16", "176.32.64.0/19", "184.72.0.0/15",
    # Microsoft / Azure
    "13.64.0.0/11", "13.96.0.0/13", "13.104.0.0/14", "20.0.0.0/8",
    "40.64.0.0/10", "52.96.0.0/12", "65.52.0.0/14", "70.37.0.0/17",
    "104.40.0.0/13", "131.107.0.0/16", "131.253.0.0/16", "157.55.0.0/16",
    "168.61.0.0/16", "191.232.0.0/13", "207.46.0.0/16",
    # Facebook / Meta
    "31.13.24.0/21", "31.13.64.0/18", "66.220.144.0/20", "69.63.176.0/20",
    "69.171.224.0/19", "157.240.0.0/16", "173.252.64.0/18", "179.60.192.0/22",
    # DigitalOcean
    "104.131.0.0/16", "104.236.0.0/16", "138.197.0.0/16", "138.68.0.0/16",
    "139.59.0.0/16", "159.65.0.0/16", "159.89.0.0/16", "165.227.0.0/16",
    "167.71.0.0/16", "167.99.0.0/16", "178.62.0.0/17", "188.166.0.0/17",
    "188.226.128.0/17", "192.241.128.0/17", "198.199.64.0/18",
    # OVH / Hetzner / Linode
    "5.39.0.0/16", "37.187.0.0/16", "51.38.0.0/16", "51.68.0.0/16",
    "78.46.0.0/15", "88.198.0.0/16", "94.130.0.0/16", "136.243.0.0/16",
    "144.76.0.0/16", "176.9.0.0/16", "188.40.0.0/16", "213.133.96.0/19",
    "45.33.0.0/17", "45.56.64.0/18", "50.116.0.0/17", "66.175.208.0/20",
    "97.107.128.0/20", "173.230.128.0/17",
    # Tor / Anonymous (sample)
    "5.2.64.0/24", "23.129.64.0/24", "104.244.72.0/21", "185.220.100.0/22",
]

_DATACENTER_NETS = [ipaddress.ip_network(c, strict=False) for c in DATACENTER_CIDRS]

# Suspicious referrers (search engines, social previews) that often mean inspection
INSPECTION_REFERRERS = [
    "google.com/search", "bing.com/search", "duckduckgo.com",
    "transparencyreport.google.com", "support.google.com", "adstransparency.google.com",
    "facebook.com/ads", "scanurl.net", "virustotal.com", "urlvoid.com", "sucuri.net",
]

# Vector for headless / automated browser detection
HEADLESS_HINTS = ["headless", "phantomjs", "electron", "puppeteer", "playwright", "selenium"]


# -----------------------------------------------------------------------------
# Auth helpers
# -----------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: str, email: str, kind: str, ttl: timedelta) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": kind,
        "exp": datetime.now(timezone.utc) + ttl,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, os.environ[JWT_SECRET_ENV], algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, httponly=True, secure=False,
                        samesite="lax", max_age=15 * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False,
                        samesite="lax", max_age=7 * 24 * 60 * 60, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, os.environ[JWT_SECRET_ENV], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: Optional[str] = None


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class CampaignFilters(BaseModel):
    allowed_countries: List[str] = Field(default_factory=list)        # ISO codes, empty = allow all
    blocked_countries: List[str] = Field(default_factory=list)
    allowed_devices: List[Literal["mobile", "desktop", "tablet"]] = Field(default_factory=list)
    allowed_os: List[str] = Field(default_factory=list)               # windows, android, ios, macos, linux
    blocked_referrers: List[str] = Field(default_factory=list)
    block_datacenter: bool = True
    block_known_bots: bool = True
    block_headless: bool = True
    block_empty_ua: bool = True
    require_referrer: bool = False


class CampaignIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    money_url: str
    safe_url: str
    status: Literal["active", "paused"] = "active"
    notes: Optional[str] = None
    custom_domain: Optional[str] = None
    custom_path: Optional[str] = None
    filters: CampaignFilters = Field(default_factory=CampaignFilters)


class CampaignOut(CampaignIn):
    id: str
    owner_id: str
    created_at: str
    stats: dict = Field(default_factory=dict)


def doc_to_campaign(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "owner_id": doc.get("owner_id", ""),
        "name": doc["name"],
        "money_url": doc["money_url"],
        "safe_url": doc["safe_url"],
        "status": doc.get("status", "active"),
        "notes": doc.get("notes"),
        "custom_domain": doc.get("custom_domain"),
        "custom_path": doc.get("custom_path"),
        "filters": doc.get("filters", CampaignFilters().model_dump()),
        "created_at": doc.get("created_at", datetime.now(timezone.utc).isoformat()),
        "stats": doc.get("stats", {"total": 0, "money": 0, "safe": 0}),
    }


# -----------------------------------------------------------------------------
# Bot detection engine
# -----------------------------------------------------------------------------
def country_from_ip(ip: str) -> str:
    """Very lightweight built-in country resolution. Returns 'XX' if unknown.

    For a production GeoIP we'd plug MaxMind here, but per user choice this is
    a built-in static heuristic based on a few well-known prefixes.
    """
    addr = None
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return "XX"
    if addr is None:
        return "XX"
    # Quick crude mapping (sample) — extend or replace with MMDB later.
    mapping = [
        ("8.8.8.0/24", "US"), ("1.1.1.0/24", "US"), ("9.9.9.0/24", "US"),
        ("64.0.0.0/8", "US"), ("66.0.0.0/8", "US"), ("69.0.0.0/8", "US"),
        ("104.0.0.0/8", "US"), ("172.217.0.0/16", "US"), ("31.13.0.0/16", "US"),
        ("203.0.0.0/8", "AU"), ("210.0.0.0/7", "JP"), ("220.0.0.0/8", "CN"),
        ("106.0.0.0/8", "CN"), ("122.0.0.0/8", "CN"), ("180.0.0.0/8", "CN"),
        ("117.0.0.0/8", "IN"), ("49.0.0.0/8", "IN"), ("103.0.0.0/8", "IN"),
        ("85.0.0.0/8", "DE"), ("88.0.0.0/8", "DE"), ("78.0.0.0/8", "DE"),
        ("90.0.0.0/8", "FR"), ("212.0.0.0/8", "FR"),
        ("81.0.0.0/8", "GB"), ("86.0.0.0/8", "GB"),
        ("177.0.0.0/8", "BR"), ("189.0.0.0/8", "BR"),
        ("190.0.0.0/8", "AR"), ("181.0.0.0/8", "AR"),
        ("197.0.0.0/8", "ZA"), ("196.0.0.0/8", "ZA"),
        ("41.0.0.0/8", "NG"), ("105.0.0.0/8", "EG"),
    ]
    for cidr, cc in mapping:
        if addr in ipaddress.ip_network(cidr, strict=False):
            return cc
    return "XX"


def ip_in_datacenter(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return any(addr in net for net in _DATACENTER_NETS)


def detect_device(ua: str) -> str:
    ua_l = ua.lower()
    if "tablet" in ua_l or "ipad" in ua_l:
        return "tablet"
    if any(t in ua_l for t in ["mobile", "android", "iphone", "ipod", "windows phone"]):
        return "mobile"
    return "desktop"


def detect_os(ua: str) -> str:
    ua_l = ua.lower()
    if "windows" in ua_l:
        return "windows"
    if "android" in ua_l:
        return "android"
    if "iphone" in ua_l or "ipad" in ua_l or "ios" in ua_l:
        return "ios"
    if "mac os" in ua_l or "macintosh" in ua_l:
        return "macos"
    if "linux" in ua_l:
        return "linux"
    return "unknown"


def get_client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    real = request.headers.get("x-real-ip")
    if real:
        return real.strip()
    return request.client.host if request.client else "0.0.0.0"


def _check_filter_violation(ua: str, ua_l: str, ip: str, referrer: str, country: str,
                            device: str, os_name: str, f: dict) -> Optional[str]:
    """Return a violation reason string or None if the request passes all filters."""
    if f.get("block_empty_ua", True) and not ua.strip():
        return "empty_user_agent"
    if f.get("block_known_bots", True) and any(p in ua_l for p in KNOWN_BOT_UA_PATTERNS):
        return "known_bot_ua"
    if f.get("block_headless", True) and any(h in ua_l for h in HEADLESS_HINTS):
        return "headless_browser"
    if f.get("block_datacenter", True) and ip_in_datacenter(ip):
        return "datacenter_ip"
    if f.get("require_referrer") and not referrer:
        return "missing_referrer"
    blocked_refs = [b.lower() for b in (f.get("blocked_referrers") or []) if b]
    if any(b in referrer.lower() for b in blocked_refs):
        return "blocked_referrer"
    if any(r in referrer.lower() for r in INSPECTION_REFERRERS):
        return "inspection_referrer"
    allowed_countries = [c.upper() for c in (f.get("allowed_countries") or [])]
    if allowed_countries and country not in allowed_countries:
        return "country_not_allowed"
    blocked_countries = [c.upper() for c in (f.get("blocked_countries") or [])]
    if blocked_countries and country in blocked_countries:
        return "country_blocked"
    allowed_devices = f.get("allowed_devices") or []
    if allowed_devices and device not in allowed_devices:
        return "device_not_allowed"
    allowed_os = [o.lower() for o in (f.get("allowed_os") or [])]
    if allowed_os and os_name not in allowed_os:
        return "os_not_allowed"
    return None


def evaluate_request(request: Request, filters: dict) -> dict:
    """Return decision dict: {decision, reason, ip, ua, country, device, os, is_bot}."""
    ip = get_client_ip(request)
    ua = request.headers.get("user-agent", "") or ""
    referrer = request.headers.get("referer", "") or ""
    lang = request.headers.get("accept-language", "")

    country = country_from_ip(ip)
    device = detect_device(ua)
    os_name = detect_os(ua)

    violation = _check_filter_violation(ua, ua.lower(), ip, referrer, country, device, os_name, filters or {})
    is_bot = violation is not None
    reason = violation or "passed"

    return {
        "ip": ip, "ua": ua, "country": country, "device": device, "os": os_name,
        "referrer": referrer, "language": lang,
        "decision": "safe" if is_bot else "money",
        "reason": reason,
        "is_bot": is_bot,
    }


# -----------------------------------------------------------------------------
# Auth endpoints
# -----------------------------------------------------------------------------
@api.post("/auth/register", response_model=UserOut)
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name.strip(),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(doc)
    uid = str(result.inserted_id)
    access = create_token(uid, email, "access", timedelta(minutes=15))
    refresh = create_token(uid, email, "refresh", timedelta(days=7))
    set_auth_cookies(response, access, refresh)
    return UserOut(id=uid, email=email, name=doc["name"], role=doc["role"], created_at=doc["created_at"])


@api.post("/auth/login", response_model=UserOut)
async def login(payload: LoginIn, response: Response, request: Request):
    email = payload.email.lower().strip()
    ident = f"{get_client_ip(request)}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": ident}) or {}
    if attempts.get("count", 0) >= 5:
        locked_until = attempts.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": ident},
            {"$inc": {"count": 1},
             "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": ident})
    uid = str(user["_id"])
    access = create_token(uid, email, "access", timedelta(minutes=15))
    refresh = create_token(uid, email, "refresh", timedelta(days=7))
    set_auth_cookies(response, access, refresh)
    return UserOut(id=uid, email=email, name=user.get("name", ""), role=user.get("role", "user"),
                   created_at=user.get("created_at"))


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(id=user["_id"], email=user["email"], name=user.get("name", ""),
                   role=user.get("role", "user"), created_at=user.get("created_at"))


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, os.environ[JWT_SECRET_ENV], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        uid = payload["sub"]
        email = payload.get("email", "")
        access = create_token(uid, email, "access", timedelta(minutes=15))
        response.set_cookie("access_token", access, httponly=True, secure=False,
                            samesite="lax", max_age=15 * 60, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# -----------------------------------------------------------------------------
# Campaigns
# -----------------------------------------------------------------------------
@api.get("/campaigns", response_model=List[CampaignOut])
async def list_campaigns(user: dict = Depends(get_current_user)):
    cursor = db.campaigns.find({"owner_id": user["_id"]}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    return [doc_to_campaign(d) for d in docs]


@api.post("/campaigns", response_model=CampaignOut)
async def create_campaign(payload: CampaignIn, user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc["owner_id"] = user["_id"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["stats"] = {"total": 0, "money": 0, "safe": 0}
    result = await db.campaigns.insert_one(doc)
    saved = await db.campaigns.find_one({"_id": result.inserted_id})
    return doc_to_campaign(saved)


@api.get("/campaigns/{campaign_id}", response_model=CampaignOut)
async def get_campaign(campaign_id: str, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=404, detail="Not found")
    doc = await db.campaigns.find_one({"_id": ObjectId(campaign_id), "owner_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc_to_campaign(doc)


@api.put("/campaigns/{campaign_id}", response_model=CampaignOut)
async def update_campaign(campaign_id: str, payload: CampaignIn,
                          user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=404, detail="Not found")
    update = payload.model_dump()
    result = await db.campaigns.update_one(
        {"_id": ObjectId(campaign_id), "owner_id": user["_id"]},
        {"$set": update},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
    return doc_to_campaign(doc)


@api.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=404, detail="Not found")
    result = await db.campaigns.delete_one({"_id": ObjectId(campaign_id), "owner_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    await db.click_logs.delete_many({"campaign_id": campaign_id})
    return {"ok": True}


# -----------------------------------------------------------------------------
# Click logs
# -----------------------------------------------------------------------------
@api.get("/campaigns/{campaign_id}/logs")
async def get_logs(campaign_id: str,
                   limit: int = 100,
                   decision: Optional[str] = None,
                   country: Optional[str] = None,
                   user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=404, detail="Not found")
    own = await db.campaigns.find_one({"_id": ObjectId(campaign_id), "owner_id": user["_id"]})
    if not own:
        raise HTTPException(status_code=404, detail="Not found")
    q: dict = {"campaign_id": campaign_id}
    if decision in ("money", "safe"):
        q["decision"] = decision
    if country:
        q["country"] = country.upper()
    docs = await db.click_logs.find(q, {"_id": 0}).sort("ts", -1).to_list(min(limit, 500))
    return docs


@api.get("/logs/recent")
async def get_recent_logs(limit: int = 50, user: dict = Depends(get_current_user)):
    own_ids = [str(c["_id"]) async for c in db.campaigns.find({"owner_id": user["_id"]}, {"_id": 1})]
    if not own_ids:
        return []
    docs = await db.click_logs.find({"campaign_id": {"$in": own_ids}}, {"_id": 0}) \
        .sort("ts", -1).to_list(min(limit, 500))
    return docs


# -----------------------------------------------------------------------------
# Analytics
# -----------------------------------------------------------------------------
@api.get("/analytics/overview")
async def overview(user: dict = Depends(get_current_user)):
    own_ids = [str(c["_id"]) async for c in db.campaigns.find({"owner_id": user["_id"]}, {"_id": 1})]
    if not own_ids:
        return {"total": 0, "money": 0, "safe": 0, "block_rate": 0,
                "campaigns": 0, "active_campaigns": 0, "top_countries": [], "top_reasons": []}

    total = await db.click_logs.count_documents({"campaign_id": {"$in": own_ids}})
    money = await db.click_logs.count_documents({"campaign_id": {"$in": own_ids}, "decision": "money"})
    safe = total - money
    block_rate = (safe / total * 100) if total else 0

    campaigns = await db.campaigns.count_documents({"owner_id": user["_id"]})
    active_campaigns = await db.campaigns.count_documents({"owner_id": user["_id"], "status": "active"})

    pipeline_countries = [
        {"$match": {"campaign_id": {"$in": own_ids}}},
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 6},
    ]
    top_countries = [{"country": d["_id"] or "XX", "count": d["count"]}
                     async for d in db.click_logs.aggregate(pipeline_countries)]

    pipeline_reasons = [
        {"$match": {"campaign_id": {"$in": own_ids}, "decision": "safe"}},
        {"$group": {"_id": "$reason", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 6},
    ]
    top_reasons = [{"reason": d["_id"] or "unknown", "count": d["count"]}
                   async for d in db.click_logs.aggregate(pipeline_reasons)]

    return {
        "total": total, "money": money, "safe": safe,
        "block_rate": round(block_rate, 1),
        "campaigns": campaigns, "active_campaigns": active_campaigns,
        "top_countries": top_countries, "top_reasons": top_reasons,
    }


@api.get("/analytics/timeseries")
async def timeseries(hours: int = 24, user: dict = Depends(get_current_user)):
    own_ids = [str(c["_id"]) async for c in db.campaigns.find({"owner_id": user["_id"]}, {"_id": 1})]
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    if not own_ids:
        return [{"hour": (since + timedelta(hours=h)).strftime("%H:00"),
                 "money": 0, "safe": 0} for h in range(hours)]
    pipeline = [
        {"$match": {"campaign_id": {"$in": own_ids}, "ts": {"$gte": since.isoformat()}}},
        {"$group": {
            "_id": {"hour": {"$substr": ["$ts", 0, 13]}, "decision": "$decision"},
            "count": {"$sum": 1},
        }},
    ]
    rows = [d async for d in db.click_logs.aggregate(pipeline)]
    buckets: dict = {}
    for h in range(hours):
        key = (since + timedelta(hours=h)).strftime("%Y-%m-%dT%H")
        buckets[key] = {"hour": (since + timedelta(hours=h)).strftime("%H:00"),
                        "money": 0, "safe": 0}
    for row in rows:
        key = row["_id"]["hour"]
        if key in buckets:
            buckets[key][row["_id"]["decision"]] = row["count"]
    return list(buckets.values())


# -----------------------------------------------------------------------------
# Rule definitions (read-only, static — built-in lists)
# -----------------------------------------------------------------------------
@api.get("/rules")
async def get_rules(user: dict = Depends(get_current_user)):
    return {
        "bot_ua_patterns": KNOWN_BOT_UA_PATTERNS,
        "datacenter_cidrs": DATACENTER_CIDRS,
        "inspection_referrers": INSPECTION_REFERRERS,
        "headless_hints": HEADLESS_HINTS,
        "counts": {
            "ua_patterns": len(KNOWN_BOT_UA_PATTERNS),
            "datacenter_cidrs": len(DATACENTER_CIDRS),
            "inspection_referrers": len(INSPECTION_REFERRERS),
            "headless_hints": len(HEADLESS_HINTS),
        },
    }


# -----------------------------------------------------------------------------
# Cloak endpoint (PUBLIC) — heart of the product
# -----------------------------------------------------------------------------
@api.get("/cloak/{campaign_id}")
async def cloak(campaign_id: str, request: Request, mode: str = "redirect"):
    """Public cloak endpoint. Returns either a redirect (default) or JSON.

    Embed example (JS):  window.location.href = '<BACKEND>/api/cloak/<campaign_id>'
    """
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    camp = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
    if not camp or camp.get("status") != "active":
        raise HTTPException(status_code=404, detail="Campaign not found or paused")

    evaluation = evaluate_request(request, camp.get("filters", {}))
    target_url = camp["safe_url"] if evaluation["decision"] == "safe" else camp["money_url"]

    log_doc = {
        "campaign_id": campaign_id,
        "ts": datetime.now(timezone.utc).isoformat(),
        "ip": evaluation["ip"],
        "ua": evaluation["ua"][:400],
        "country": evaluation["country"],
        "device": evaluation["device"],
        "os": evaluation["os"],
        "referrer": evaluation["referrer"][:300],
        "language": evaluation["language"][:80],
        "decision": evaluation["decision"],
        "reason": evaluation["reason"],
        "target": target_url,
    }
    await db.click_logs.insert_one(log_doc)

    stat_field = "stats.money" if evaluation["decision"] == "money" else "stats.safe"
    await db.campaigns.update_one(
        {"_id": ObjectId(campaign_id)},
        {"$inc": {"stats.total": 1, stat_field: 1}},
    )

    if mode == "json":
        return {
            "decision": evaluation["decision"],
            "reason": evaluation["reason"],
            "target": target_url,
            "country": evaluation["country"],
            "device": evaluation["device"],
            "os": evaluation["os"],
        }
    return RedirectResponse(target_url, status_code=302)


@api.get("/health")
async def health():
    return {"ok": True, "service": "cloakforge", "ts": datetime.now(timezone.utc).isoformat()}


# -----------------------------------------------------------------------------
# App init
# -----------------------------------------------------------------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # cloak endpoint must be embeddable anywhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.campaigns.create_index([("owner_id", 1), ("created_at", -1)])
    await db.click_logs.create_index([("campaign_id", 1), ("ts", -1)])
    await db.login_attempts.create_index("identifier")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@cloakforge.io").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@12345")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user: %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Refreshed admin password from .env")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
