"""
LeadPilot — In-process sliding-window rate limiter.

Limits requests per user (or per IP for unauthenticated endpoints).
Single-process only — swap for Redis-backed (e.g. slowapi) if you run
multiple backend replicas.
"""
import time
from collections import defaultdict
from typing import Optional

from fastapi import Request, HTTPException, status


class RateLimiter:
    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # key -> list of timestamps
        self._hits: dict[str, list[float]] = defaultdict(list)
        self._last_sweep = time.time()

    def _sweep_stale(self):
        """Periodically remove empty entries to prevent unbounded growth."""
        now = time.time()
        if now - self._last_sweep < 300:  # sweep every 5 min
            return
        self._last_sweep = now
        stale = [k for k, v in self._hits.items() if not v]
        for k in stale:
            del self._hits[k]

    def check(self, key: str) -> bool:
        """Returns True if the request is allowed, False if rate-limited."""
        now = time.time()
        cutoff = now - self.window_seconds

        # Drop old timestamps
        hits = self._hits[key]
        self._hits[key] = [t for t in hits if t > cutoff]

        if len(self._hits[key]) >= self.max_requests:
            return False

        self._hits[key].append(now)
        self._sweep_stale()
        return True

    def remaining(self, key: str) -> int:
        """How many requests remain in the current window."""
        now = time.time()
        cutoff = now - self.window_seconds
        hits = [t for t in self._hits[key] if t > cutoff]
        return max(0, self.max_requests - len(hits))


# Global limiter instance
_limiter = RateLimiter()


def get_rate_limit_key(request: Request, user_id: Optional[str] = None) -> str:
    """Build a rate limit key from user ID or client IP."""
    if user_id:
        return f"user:{user_id}"
    # Fall back to IP for unauthenticated endpoints
    forwarded = request.headers.get("X-Forwarded-For")
    ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
    return f"ip:{ip}"


def check_rate_limit(request: Request, user_id: Optional[str] = None):
    """Call from any route to enforce rate limiting. Raises 429 if exceeded."""
    key = get_rate_limit_key(request, user_id)
    if not _limiter.check(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(_limiter.window_seconds)},
        )
