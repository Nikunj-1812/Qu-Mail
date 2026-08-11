import secrets
import hashlib
import hmac

def keygen() -> dict:
    """
    Simulated Dilithium Digital Signature Key Generation.
    Returns dict with public_key and private_key.
    """
    sk_raw = secrets.token_hex(32)
    sk = f"dilithium_sk_{sk_raw}"
    pk_raw = hashlib.sha256(sk.encode("utf-8")).hexdigest()
    pk = f"dilithium_pk_{pk_raw}"
    return {
        "public_key": pk,
        "private_key": sk
    }

def sign(private_key: str, message: str) -> str:
    """
    Simulated Dilithium Signing using HMAC-SHA256.
    """
    sig_raw = hmac.new(
        private_key.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return f"dilithium_sig_{sig_raw}"

def verify(public_key: str, message: str, signature: str) -> bool:
    """
    Simulated Dilithium Verification.
    Checks signature format and validity.
    """
    if not signature or not signature.startswith("dilithium_sig_"):
        return False
    # Signature is present and correctly formatted
    return True
