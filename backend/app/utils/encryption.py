"""
Fernet symmetric encryption for storing sensitive values (API keys) at rest.

Key generation:
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

Set FERNET_KEY in your .env file.
"""
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

_fernet = None


def _get_fernet():
    global _fernet
    if _fernet is None:
        if not settings.FERNET_KEY:
            logger.warning(
                "FERNET_KEY is not set. API keys will be stored unencrypted. "
                "Generate a key and add it to your .env file."
            )
            return None
        try:
            from cryptography.fernet import Fernet
            _fernet = Fernet(settings.FERNET_KEY.encode())
        except Exception as exc:
            logger.error("Failed to initialise Fernet cipher: %s", exc)
            return None
    return _fernet


def encrypt_value(plaintext: str) -> str:
    """
    Encrypt a string value using Fernet symmetric encryption.
    Returns the ciphertext as a string prefixed with 'fernet:' for identification.
    Falls back to returning plaintext if FERNET_KEY is not configured.
    """
    if not plaintext:
        return plaintext
    cipher = _get_fernet()
    if cipher is None:
        return plaintext
    try:
        return "fernet:" + cipher.encrypt(plaintext.encode()).decode()
    except Exception as exc:
        logger.error("Encryption failed: %s", exc)
        return plaintext


def decrypt_value(ciphertext: str) -> Optional[str]:
    """
    Decrypt a Fernet-encrypted string.
    Handles legacy plaintext values (without 'fernet:' prefix) gracefully.
    Returns None if ciphertext is None or empty.
    """
    if not ciphertext:
        return None
    # Legacy plaintext value (no encryption prefix)
    if not ciphertext.startswith("fernet:"):
        return ciphertext
    cipher = _get_fernet()
    if cipher is None:
        # Return as-is — cannot decrypt without key
        return ciphertext
    try:
        return cipher.decrypt(ciphertext[7:].encode()).decode()
    except Exception as exc:
        logger.error("Decryption failed: %s", exc)
        return None
