import secrets
import hashlib

def keygen() -> dict:
    """
    Simulated Kyber KEM Key Generation.
    Returns dict with public_key and private_key hex strings.
    """
    sk_raw = secrets.token_hex(32)
    sk = f"kyber_sk_{sk_raw}"
    pk_raw = hashlib.sha256(sk.encode("utf-8")).hexdigest()
    pk = f"kyber_pk_{pk_raw}"
    return {
        "public_key": pk,
        "private_key": sk
    }

def encapsulate(public_key: str) -> tuple:
    """
    Simulated Kyber KEM Encapsulation.
    Given recipient public key, returns (ciphertext, shared_secret).
    """
    r = secrets.token_hex(32)
    pk_hash = hashlib.md5(public_key.encode("utf-8")).hexdigest()[:8]
    ciphertext = f"kyber_ct_{r}_{pk_hash}"
    shared_secret = hashlib.sha256((r + public_key).encode("utf-8")).hexdigest()
    return ciphertext, shared_secret

def decapsulate(private_key: str, ciphertext: str) -> str:
    """
    Simulated Kyber KEM Decapsulation.
    Given recipient private key and ciphertext, derives the exact same shared_secret.
    """
    # Reconstruct public key from private key
    pk_raw = hashlib.sha256(private_key.encode("utf-8")).hexdigest()
    pk = f"kyber_pk_{pk_raw}"
    
    # Extract random seed r from ciphertext format: kyber_ct_{r}_{pk_hash}
    parts = ciphertext.split("_")
    if len(parts) >= 3:
        r = parts[2]
    else:
        r = ""
        
    shared_secret = hashlib.sha256((r + pk).encode("utf-8")).hexdigest()
    return shared_secret
