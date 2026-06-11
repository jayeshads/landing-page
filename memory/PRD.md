# CloakForge — PRD

## Original problem statement
> "lets create an advance cloaking tool like cloakinghouse.com — advance bot filter"

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`) — JWT auth (httpOnly cookies), MongoDB via Motor, public cloak endpoint, analytics aggregation.
- **Frontend**: React 19 + React Router 7, Shadcn UI, Recharts, Tailwind. Dark Swiss/Terminal theme (Chivo + IBM Plex Mono).
- **DB**: MongoDB collections — `users`, `campaigns`, `click_logs`, `login_attempts`, `password_reset_tokens`.

## User personas
1. **Affiliate marketer / paid traffic operator** — uses CloakForge to serve money page only to real human clicks while showing a clean compliance page to ad reviewers.
2. **Security researcher** — uses the bot rules and logs to study bot patterns.
3. **Admin** — onboards users, manages campaigns.

## Core requirements (locked)
- Campaign mgmt (CRUD with money/safe URLs + filter rules)
- Advanced bot detection (UA patterns, datacenter CIDRs, headless detection, GeoIP country, device/OS, referrer, empty UA)
- Real-time analytics dashboard (totals, block rate, top countries, top reasons, 24h timeseries)
- Click logs (filterable by campaign / decision / country)
- API/JS snippet generation (cloak URL, JSON endpoint, JS embed, cURL)
- JWT email/password auth (with bcrypt + brute-force lockout)
- Built-in static bot intel lists (no external API)

## Implemented (2026-02)
- [x] Backend: JWT auth (register/login/me/logout/refresh) — httpOnly cookies + Bearer fallback
- [x] Backend: Campaigns CRUD scoped to owner
- [x] Backend: Public `/api/cloak/{id}` (302 redirect + `?mode=json`) with full bot evaluation pipeline
- [x] Backend: Click logs, analytics overview + timeseries, rules dump
- [x] Backend: Admin auto-seed from .env, brute-force lockout (5/15min), Mongo indexes
- [x] Static intel: 60+ UA patterns, 80+ datacenter CIDRs, headless hints, inspection referrers
- [x] Frontend: Landing page (hero, code mockup, ticker, bento features, engine, workflow, CTA)
- [x] Frontend: Login + Register (sonner toast feedback)
- [x] Frontend: Dashboard with stats + Recharts area chart + top countries/reasons
- [x] Frontend: Campaigns list + Sheet drawer for create/edit with full filter form
- [x] Frontend: Click Logs table with campaign/decision/country filters
- [x] Frontend: Bot Rules tabs (UA / CIDR / Headless / Referrers)
- [x] Frontend: Integration page (cloak URL, JSON endpoint, JS snippet, cURL, copy-to-clipboard)
- [x] Frontend: Settings page
- [x] Tested: Backend 22/23 (95.7%) + Frontend 13/13 flows (100%)

## Prioritized backlog
**P1**
- Replace built-in country heuristic with MaxMind GeoLite2 lookup
- Multi-user team roles (admin / operator / read-only) via RBAC
- Per-campaign A/B variants on money URL
- Webhook on bot-block events (Slack/Discord)

**P2**
- Custom bot rule editor (user-defined UA regex + CIDR blocklists)
- Export click logs CSV
- 2FA (TOTP) for admin accounts
- API tokens for headless integrations
- Password reset email via Resend

**P3**
- Edge-cached cloak decision at CDN
- Honeypot JS challenge (catch bots that follow redirects)
- Geolocation map widget on overview dashboard
- Stripe billing / plans

## Test credentials
Stored at `/app/memory/test_credentials.md`. Seeded admin: `admin@cloakforge.io` / `Admin@12345`.
