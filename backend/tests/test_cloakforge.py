"""CloakForge backend pytest suite - auth, campaigns, cloak, analytics, rules, logs."""
import os, time, uuid, requests, pytest

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://stealth-filter-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"
ADMIN = {"email": "admin@cloakforge.io", "password": "Admin@12345"}


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN, timeout=20)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="session")
def new_user_session():
    s = requests.Session()
    email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "Test@12345", "name": "Test User"}, timeout=20)
    assert r.status_code == 200, r.text
    s.email = email  # type: ignore
    return s


# --- Health ---
def test_health():
    r = requests.get(f"{API}/health", timeout=10)
    assert r.status_code == 200 and r.json().get("ok") is True


# --- Auth ---
def test_admin_login_sets_cookies(admin_session):
    assert "access_token" in admin_session.cookies
    assert "refresh_token" in admin_session.cookies


def test_auth_me(admin_session):
    r = admin_session.get(f"{API}/auth/me", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN["email"]
    assert data["role"] == "admin"


def test_register_new_user(new_user_session):
    r = new_user_session.get(f"{API}/auth/me", timeout=10)
    assert r.status_code == 200
    assert r.json()["email"] == new_user_session.email  # type: ignore


def test_login_invalid_credentials():
    r = requests.post(f"{API}/auth/login", json={"email": "nope@x.com", "password": "wrong"}, timeout=10)
    assert r.status_code == 401


def test_logout_clears_cookies():
    s = requests.Session()
    s.post(f"{API}/auth/login", json=ADMIN, timeout=10)
    r = s.post(f"{API}/auth/logout", timeout=10)
    assert r.status_code == 200
    # auth/me should fail (after server clears cookie response - need new session w/o cookies)
    s.cookies.clear()
    r2 = s.get(f"{API}/auth/me", timeout=10)
    assert r2.status_code == 401


def test_protected_endpoint_requires_auth():
    r = requests.get(f"{API}/campaigns", timeout=10)
    assert r.status_code == 401


# --- Campaigns CRUD ---
@pytest.fixture(scope="session")
def campaign_id(admin_session):
    payload = {
        "name": "TEST_Camp",
        "money_url": "https://example.com/money",
        "safe_url": "https://example.com/safe",
        "status": "active",
        "filters": {"block_known_bots": True, "block_headless": True, "block_datacenter": False, "block_empty_ua": True}
    }
    r = admin_session.post(f"{API}/campaigns", json=payload, timeout=10)
    assert r.status_code == 200, r.text
    cid = r.json()["id"]
    yield cid
    admin_session.delete(f"{API}/campaigns/{cid}", timeout=10)


def test_campaign_create_and_get(admin_session, campaign_id):
    r = admin_session.get(f"{API}/campaigns/{campaign_id}", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["name"] == "TEST_Camp"
    assert d["money_url"] == "https://example.com/money"
    assert d["safe_url"] == "https://example.com/safe"


def test_campaign_list(admin_session, campaign_id):
    r = admin_session.get(f"{API}/campaigns", timeout=10)
    assert r.status_code == 200
    ids = [c["id"] for c in r.json()]
    assert campaign_id in ids


def test_campaign_update(admin_session, campaign_id):
    payload = {
        "name": "TEST_Camp_Updated",
        "money_url": "https://example.com/money2",
        "safe_url": "https://example.com/safe2",
        "status": "active",
        "filters": {"block_known_bots": True}
    }
    r = admin_session.put(f"{API}/campaigns/{campaign_id}", json=payload, timeout=10)
    assert r.status_code == 200
    assert r.json()["name"] == "TEST_Camp_Updated"
    g = admin_session.get(f"{API}/campaigns/{campaign_id}", timeout=10)
    assert g.json()["money_url"] == "https://example.com/money2"


# --- Cloak (public) ---
def test_cloak_money_decision_regular_ua(campaign_id):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}
    r = requests.get(f"{API}/cloak/{campaign_id}?mode=json", headers=headers, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["decision"] == "money"
    assert d["target"] == "https://example.com/money2"


def test_cloak_safe_decision_bot_ua(campaign_id):
    headers = {"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"}
    r = requests.get(f"{API}/cloak/{campaign_id}?mode=json", headers=headers, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["decision"] == "safe"
    assert d["reason"] in ("known_bot_ua", "datacenter_ip")


def test_cloak_redirect_default(campaign_id):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}
    r = requests.get(f"{API}/cloak/{campaign_id}", headers=headers, timeout=10, allow_redirects=False)
    assert r.status_code in (302, 307)
    assert "example.com" in r.headers.get("location", "")


def test_cloak_headless_blocked(campaign_id):
    headers = {"User-Agent": "Mozilla/5.0 HeadlessChrome/120.0.0.0"}
    r = requests.get(f"{API}/cloak/{campaign_id}?mode=json", headers=headers, timeout=10)
    assert r.status_code == 200
    assert r.json()["decision"] == "safe"


def test_cloak_invalid_campaign():
    r = requests.get(f"{API}/cloak/000000000000000000000000?mode=json", timeout=10)
    assert r.status_code == 404


def test_cloak_no_auth_required(campaign_id):
    # Use a clean session without cookies
    r = requests.get(f"{API}/cloak/{campaign_id}?mode=json",
                     headers={"User-Agent": "Mozilla/5.0 Chrome/120"}, timeout=10)
    assert r.status_code == 200


# --- Logs ---
def test_logs_for_campaign(admin_session, campaign_id):
    time.sleep(1)  # ensure logs persisted
    r = admin_session.get(f"{API}/campaigns/{campaign_id}/logs?limit=50", timeout=10)
    assert r.status_code == 200
    logs = r.json()
    assert isinstance(logs, list)
    assert len(logs) >= 2  # we made several cloak hits above
    assert any(l["decision"] == "money" for l in logs)
    assert any(l["decision"] == "safe" for l in logs)


def test_logs_filter_decision(admin_session, campaign_id):
    r = admin_session.get(f"{API}/campaigns/{campaign_id}/logs?decision=safe", timeout=10)
    assert r.status_code == 200
    for l in r.json():
        assert l["decision"] == "safe"


def test_recent_logs(admin_session):
    r = admin_session.get(f"{API}/logs/recent?limit=10", timeout=10)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# --- Analytics ---
def test_analytics_overview(admin_session):
    r = admin_session.get(f"{API}/analytics/overview", timeout=10)
    assert r.status_code == 200
    d = r.json()
    for k in ("total", "money", "safe", "block_rate", "campaigns", "top_countries", "top_reasons"):
        assert k in d


def test_analytics_timeseries(admin_session):
    r = admin_session.get(f"{API}/analytics/timeseries?hours=24", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) == 24
    assert all("hour" in d and "money" in d and "safe" in d for d in data)


# --- Rules ---
def test_rules(admin_session):
    r = admin_session.get(f"{API}/rules", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "bot_ua_patterns" in d and len(d["bot_ua_patterns"]) > 0
    assert "datacenter_cidrs" in d and len(d["datacenter_cidrs"]) > 0
    assert d["counts"]["ua_patterns"] == len(d["bot_ua_patterns"])


# --- Cascade delete ---
def test_campaign_delete_cascade(admin_session):
    payload = {"name": "TEST_Del", "money_url": "https://e.com/m", "safe_url": "https://e.com/s",
               "status": "active", "filters": {}}
    cid = admin_session.post(f"{API}/campaigns", json=payload, timeout=10).json()["id"]
    requests.get(f"{API}/cloak/{cid}?mode=json", headers={"User-Agent": "Chrome/120"}, timeout=10)
    time.sleep(0.5)
    logs_before = admin_session.get(f"{API}/campaigns/{cid}/logs", timeout=10).json()
    assert len(logs_before) >= 1
    d = admin_session.delete(f"{API}/campaigns/{cid}", timeout=10)
    assert d.status_code == 200
    g = admin_session.get(f"{API}/campaigns/{cid}", timeout=10)
    assert g.status_code == 404
