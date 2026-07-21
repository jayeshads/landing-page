"""
LeadPilot — Security utilities.

Provides AES-256 Fernet symmetric encryption for sensitive data at rest
(e.g., Meta access tokens, API credentials).
"""
import base64
import hashlib
from cryptography.fernet import Fernet
from app.config import settings


def _get_fernet_key() -> bytes:
    """
    Returns a 32-byte url-safe base64 key for Fernet encryption.
    Uses ENCRYPTION_KEY if set, or derives a deterministic key from JWT_SECRET.
    """
    raw_key = settings.ENCRYPTION_KEY or settings.JWT_SECRET
    hashed = hashlib.sha256(raw_key.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(hashed)


def encrypt_token(plain_token: str) -> str:
    """Encrypt a plaintext string using AES-256 Fernet."""
    if not plain_token:
        return ""
    f = Fernet(_get_fernet_key())
    return f.encrypt(plain_token.encode("utf-8")).decode("utf-8")


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a Fernet-encrypted string."""
    if not encrypted_token:
        return ""
    try:
        f = Fernet(_get_fernet_key())
        return f.decrypt(encrypted_token.encode("utf-8")).decode("utf-8")
    except Exception as e:
        print(f"Decryption error: {e}")
        return ""
