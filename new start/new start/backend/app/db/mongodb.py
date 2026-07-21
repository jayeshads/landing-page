"""
LeadPilot — MongoDB connection layer (async via Motor).

Provides a single shared MongoClient for the entire backend, connected on
FastAPI startup and closed on shutdown via the lifespan hooks in main.py.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db():
    """Called once on FastAPI startup."""
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    _db = _client[settings.MONGODB_DB_NAME]
    await _create_indexes()
    print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")


async def disconnect_db():
    """Called once on FastAPI shutdown."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
    print("🔌 Disconnected from MongoDB")


def get_db() -> AsyncIOMotorDatabase:
    """Returns the database instance. Call only after connect_db()."""
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db


# ─── Collection accessors ───
# These are thin wrappers so the rest of the codebase never has to know
# the actual collection name strings — rename once, here, done.

def users_collection():
    return get_db()["users"]

def campaigns_collection():
    return get_db()["campaigns"]

def creatives_collection():
    return get_db()["creatives"]

def landing_pages_collection():
    return get_db()["landing_pages"]

def templates_collection():
    return get_db()["templates"]

def ai_sessions_collection():
    return get_db()["ai_sessions"]

def ai_turns_collection():
    return get_db()["ai_turns"]

def ai_skills_collection():
    return get_db()["ai_skills"]

def plans_collection():
    return get_db()["plans"]

def subscriptions_collection():
    return get_db()["subscriptions"]

def promo_codes_collection():
    return get_db()["promo_codes"]

def support_tickets_collection():
    return get_db()["support_tickets"]

def audit_logs_collection():
    return get_db()["audit_logs"]

def meta_accounts_collection():
    return get_db()["meta_accounts"]

def notifications_collection():
    return get_db()["notifications"]


# ─── Indexes ───

async def _create_indexes():
    """Ensure indexes exist on startup. Idempotent (createIndex is a no-op
    if the index already exists)."""
    db = get_db()

    # users
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("workspace.slug", unique=True, sparse=True)
    await db["users"].create_index([("role", 1), ("status", 1)])

    # campaigns
    await db["campaigns"].create_index("user_id")
    await db["campaigns"].create_index([("user_id", 1), ("status", 1)])
    await db["campaigns"].create_index("meta_campaign_id", sparse=True)

    # creatives
    await db["creatives"].create_index("user_id")
    await db["creatives"].create_index([("user_id", 1), ("campaign_id", 1)])

    # landing_pages
    await db["landing_pages"].create_index("user_id")
    await db["landing_pages"].create_index("hosted_slug", unique=True, sparse=True)

    # ai_sessions
    await db["ai_sessions"].create_index([("user_id", 1), ("updated_at", -1)])

    # ai_turns
    await db["ai_turns"].create_index([("session_id", 1), ("created_at", 1)])

    # plans
    await db["plans"].create_index("slug", unique=True)

    # support_tickets
    await db["support_tickets"].create_index([("user_id", 1), ("status", 1)])

    # audit_logs
    await db["audit_logs"].create_index([("user_id", 1), ("created_at", -1)])
    await db["audit_logs"].create_index([("action", 1), ("created_at", -1)])

    # meta_accounts
    await db["meta_accounts"].create_index("user_id", unique=True, sparse=True)

    print("📇 MongoDB indexes ensured")
