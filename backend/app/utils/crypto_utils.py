# backend/app/utils/crypto_utils.py
"""
Cryptographic utilities for the Zambian Farmer System.

SECURITY NOTES:
- For passwords: Always use bcrypt (see security.py)
- For searchable fields: Use HMAC hashing (not encryption)
- For PII: Use proper AES-GCM with random nonces
- For farmer IDs: Use cryptographically secure random generation
"""

import base64
import hashlib
import hmac
import secrets
import string
from typing import Tuple, Optional
from datetime import datetime
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from app.config import settings


# ============================================
# Key Derivation
# ============================================
def _derive_key(purpose: str = "encryption") -> bytes:
    """
    Derive AES-256 key from JWT secret using HKDF-like approach.
    
    Args:
        purpose: Purpose of the key (used as salt)
    
    Returns:
        bytes: 32-byte AES-256 key
    """
    # Use HMAC-SHA256 for key derivation
    return hashlib.pbkdf2_hmac(
        'sha256',
        settings.JWT_SECRET.encode(),
        purpose.encode(),
        iterations=100000,
        dklen=32
    )


# ============================================
# Secure AES-GCM Encryption (Non-Deterministic)
# ============================================
def encrypt_aes_gcm(plaintext: str) -> str:
    """
    Encrypt data using AES-256-GCM with random nonce.
    Returns: base64(nonce + tag + ciphertext)
    
    SECURITY: Each encryption produces different output (non-deterministic).
    Use this for sensitive PII that doesn't need to be searchable.
    
    Args:
        plaintext: Data to encrypt
    
    Returns:
        str: Base64-encoded (nonce|tag|ciphertext)
    
    Example:
        >>> encrypted = encrypt_aes_gcm("sensitive data")
        >>> decrypted = decrypt_aes_gcm(encrypted)
    """
    key = _derive_key("encryption")
    
    # Generate random 12-byte nonce (96 bits - recommended for GCM)
    nonce = get_random_bytes(12)
    
    # Create AES-GCM cipher
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    
    # Encrypt and get authentication tag
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode())
    
    # Combine: nonce (12) + tag (16) + ciphertext
    combined = nonce + tag + ciphertext
    
    return base64.urlsafe_b64encode(combined).decode()


def decrypt_aes_gcm(encrypted_b64: str) -> str:
    """
    Decrypt AES-256-GCM encrypted data.
    
    Args:
        encrypted_b64: Base64-encoded (nonce|tag|ciphertext)
    
    Returns:
        str: Decrypted plaintext
    
    Raises:
        ValueError: If decryption or authentication fails
    """
    try:
        key = _derive_key("encryption")
        
        # Decode from base64
        combined = base64.urlsafe_b64decode(encrypted_b64.encode())
        
        # Extract components
        nonce = combined[:12]
        tag = combined[12:28]
        ciphertext = combined[28:]
        
        # Create cipher and decrypt
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        
        # Decrypt and verify tag
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        
        return plaintext.decode()
        
    except (ValueError, KeyError) as e:
        raise ValueError(f"Decryption failed: {str(e)}")


# ============================================
# HMAC-based Indexing (for searchable fields)
# ============================================
def hmac_hash(value: str, salt: Optional[str] = None) -> str:
    """
    Compute HMAC-SHA256 hash for searchable field indexing.
    
    USE CASE: Hash email/NRC for database lookups while protecting raw values.
    WARNING: This is NOT encryption - it's one-way hashing.
    
    Args:
        value: Value to hash (e.g., email, NRC)
        salt: Optional salt (defaults to field-specific salt)
    
    Returns:
        str: Hex-encoded HMAC hash
    
    Example:
        >>> nrc_hash = hmac_hash("123456/12/1", salt="nrc")
        >>> # Store nrc_hash in DB for lookups
    """
    if salt is None:
        salt = "default"
    
    key = settings.SECRET_KEY.encode()
    message = f"{salt}:{value}".encode()
    
    return hmac.new(key, message, hashlib.sha256).hexdigest()


def verify_hmac_hash(value: str, expected_hash: str, salt: Optional[str] = None) -> bool:
    """
    Verify if a value matches the expected HMAC hash.
    
    Args:
        value: Plain value to check
        expected_hash: Expected hash value
        salt: Salt used during hashing
    
    Returns:
        bool: True if hash matches
    """
    computed_hash = hmac_hash(value, salt)
    return hmac.compare_digest(computed_hash, expected_hash)


# ============================================
# Farmer ID Generation
# ============================================
def generate_farmer_id() -> str:
    """
    Generate cryptographically secure farmer ID.
    Format: ZM + 8 hex characters (uppercase)
    Example: ZM1A2B3C4D
    
    Returns:
        str: Unique farmer ID
    
    Note: Collision probability is ~1 in 4 billion (2^32)
    """
    # Generate 4 random bytes (8 hex chars)
    random_bytes = secrets.token_bytes(4)
    hex_id = random_bytes.hex().upper()
    
    return f"ZM{hex_id}"


def generate_operator_id() -> str:
    """
    Generate cryptographically secure operator ID.
    Format: OP + 6 hex characters (uppercase)
    Example: OP1A2B3C
    
    Returns:
        str: Unique operator ID
    """
    random_bytes = secrets.token_bytes(3)
    hex_id = random_bytes.hex().upper()
    
    return f"OP{hex_id}"


def generate_secure_token(length: int = 32) -> str:
    """
    Generate cryptographically secure random token.
    
    Args:
        length: Token length in characters (default 32)
    
    Returns:
        str: URL-safe random token
    
    Example:
        >>> reset_token = generate_secure_token(64)
    """
    return secrets.token_urlsafe(length)


# ============================================
# Data Obfuscation (for non-sensitive display)
# ============================================
def obfuscate_email(email: str) -> str:
    """
    Obfuscate email for display purposes.
    Example: john.doe@example.com -> j***e@e***e.com
    
    Args:
        email: Email address to obfuscate
    
    Returns:
        str: Obfuscated email
    """
    try:
        local, domain = email.split('@')
        domain_parts = domain.split('.')
        
        # Obfuscate local part
        if len(local) <= 2:
            local_obf = local[0] + '*'
        else:
            local_obf = local[0] + '***' + local[-1]
        
        # Obfuscate domain
        domain_name = domain_parts[0]
        if len(domain_name) <= 2:
            domain_obf = domain_name[0] + '*'
        else:
            domain_obf = domain_name[0] + '***' + domain_name[-1]
        
        return f"{local_obf}@{domain_obf}.{'.'.join(domain_parts[1:])}"
    except:
        return "***@***.***"


def obfuscate_phone(phone: str) -> str:
    """
    Obfuscate phone number for display.
    Example: +260977123456 -> +260***3456
    
    Args:
        phone: Phone number to obfuscate
    
    Returns:
        str: Obfuscated phone number
    """
    if len(phone) <= 4:
        return '***'
    return phone[:4] + '***' + phone[-4:]


def obfuscate_nrc(nrc: str) -> str:
    """
    Obfuscate NRC number for display.
    Example: 123456/12/1 -> ******/12/1
    
    Args:
        nrc: NRC number to obfuscate
    
    Returns:
        str: Obfuscated NRC
    """
    parts = nrc.split('/')
    if len(parts) >= 3:
        return f"******/{parts[1]}/{parts[2]}"
    return "******"


# ============================================
# Checksum Validation
# ============================================
def generate_checksum(data: str) -> str:
    """
    Generate SHA-256 checksum for data integrity verification.
    
    Args:
        data: Data to checksum
    
    Returns:
        str: Hex-encoded SHA-256 hash
    """
    return hashlib.sha256(data.encode()).hexdigest()


def verify_checksum(data: str, expected_checksum: str) -> bool:
    """
    Verify data against expected checksum.
    
    Args:
        data: Data to verify
        expected_checksum: Expected checksum value
    
    Returns:
        bool: True if checksum matches
    """
    computed = generate_checksum(data)
    return hmac.compare_digest(computed, expected_checksum)


# ============================================
# Legacy Support (if needed)
# ============================================
# DEPRECATED: Use hmac_hash() instead
def encrypt_deterministic(value: str) -> str:
    """
    DEPRECATED: Use hmac_hash() for searchable fields instead.
    
    This function is kept for backward compatibility only.
    Deterministic encryption with GCM is cryptographically unsafe.
    """
    import warnings
    warnings.warn(
        "encrypt_deterministic is deprecated and unsafe. Use hmac_hash() instead.",
        DeprecationWarning,
        stacklevel=2
    )
    return hmac_hash(value)
