import base64
import secrets
import json
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.fernet import Fernet

def get_fernet(passphrase: str, salt_bytes: bytes) -> Fernet:
    """
    Derives a Fernet key from passphrase + salt using PBKDF2HMAC SHA256.
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt_bytes,
        iterations=100_000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(passphrase.encode("utf-8")))
    return Fernet(key)

def encrypt_key_data(key_data: dict | str, passphrase: str) -> tuple[str, str]:
    """
    Encrypts private key data at rest using user passphrase.
    Returns tuple: (encrypted_private_key_b64, salt_hex).
    """
    salt_bytes = secrets.token_bytes(16)
    fernet = get_fernet(passphrase, salt_bytes)
    
    if isinstance(key_data, dict):
        raw_bytes = json.dumps(key_data).encode("utf-8")
    else:
        raw_bytes = key_data.encode("utf-8")
        
    encrypted_bytes = fernet.encrypt(raw_bytes)
    return encrypted_bytes.decode("utf-8"), salt_bytes.hex()

def decrypt_key_data(encrypted_b64: str, passphrase: str, salt_hex: str) -> dict | str:
    """
    Decrypts private key data using passphrase + salt_hex.
    """
    salt_bytes = bytes.fromhex(salt_hex)
    fernet = get_fernet(passphrase, salt_bytes)
    decrypted_bytes = fernet.decrypt(encrypted_b64.encode("utf-8"))
    decoded_str = decrypted_bytes.decode("utf-8")
    
    try:
        return json.loads(decoded_str)
    except Exception:
        return decoded_str
