import secrets
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def derive_aes_key(shared_secret: str) -> bytes:
    """
    Derives a 256-bit AES key from shared secret string using SHA-256.
    """
    return hashlib.sha256(shared_secret.encode("utf-8")).digest()

def encrypt_body(key_bytes: bytes, plaintext: str) -> dict:
    """
    Encrypts plaintext using AES-256-GCM.
    Returns dict with ciphertext (hex) and nonce (hex).
    """
    nonce = secrets.token_bytes(12)
    aesgcm = AESGCM(key_bytes)
    ciphertext_bytes = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
    return {
        "ciphertext": ciphertext_bytes.hex(),
        "nonce": nonce.hex()
    }

def decrypt_body(key_bytes: bytes, ciphertext_hex: str, nonce_hex: str) -> str:
    """
    Decrypts AES-256-GCM ciphertext hex with nonce hex and key_bytes.
    Returns plaintext string.
    """
    nonce = bytes.fromhex(nonce_hex)
    ciphertext_bytes = bytes.fromhex(ciphertext_hex)
    aesgcm = AESGCM(key_bytes)
    plaintext_bytes = aesgcm.decrypt(nonce, ciphertext_bytes, None)
    return plaintext_bytes.decode("utf-8")
