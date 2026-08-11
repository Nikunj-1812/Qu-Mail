import secrets

try:
    from . import kyber, dilithium, aes_cipher
except ImportError:
    from crypto_core import kyber, dilithium, aes_cipher

def create_envelope(
    sender_sk: str,
    sender_pk: str,
    recipient_kyber_pk: str,
    body: str,
    security_level: int
) -> dict:
    """
    Constructs an encrypted email payload envelope for Security Levels 1, 2, or 3.
    """
    if security_level == 1:
        # Level 1: Plaintext, no encryption
        envelope = {
            "security_level": 1,
            "body": body,
            "sender_pk": sender_pk,
        }
        sig_message = f"1:{body}"
        envelope["signature"] = dilithium.sign(sender_sk, sig_message)
        return envelope

    elif security_level == 2:
        # Level 2: Kyber KEM + AES-256 GCM
        kyber_ct, shared_secret = kyber.encapsulate(recipient_kyber_pk)
        aes_key = aes_cipher.derive_aes_key(shared_secret)
        aes_res = aes_cipher.encrypt_body(aes_key, body)
        
        envelope = {
            "security_level": 2,
            "kyber_ciphertext": kyber_ct,
            "aes_ciphertext": aes_res["ciphertext"],
            "nonce": aes_res["nonce"],
            "sender_pk": sender_pk,
        }
        sig_message = f"2:{kyber_ct}:{aes_res['ciphertext']}"
        envelope["signature"] = dilithium.sign(sender_sk, sig_message)
        return envelope

    elif security_level == 3:
        # Level 3: One-Time Pad (XOR) using a single-use key
        body_bytes = body.encode("utf-8")
        otp_key_bytes = secrets.token_bytes(len(body_bytes))
        otp_ciphertext_bytes = bytes([b ^ k for b, k in zip(body_bytes, otp_key_bytes)])
        
        envelope = {
            "security_level": 3,
            "otp_ciphertext": otp_ciphertext_bytes.hex(),
            "otp_key_hex": otp_key_bytes.hex(),
            "sender_pk": sender_pk,
        }
        sig_message = f"3:{otp_ciphertext_bytes.hex()}"
        envelope["signature"] = dilithium.sign(sender_sk, sig_message)
        return envelope

    else:
        raise ValueError(f"Invalid security level: {security_level}")


def decrypt_envelope(envelope: dict, recipient_kyber_sk: str | None = None) -> str:
    """
    Parses and decrypts an envelope payload back to plaintext.
    """
    sec_level = envelope.get("security_level", 1)

    if sec_level == 1:
        return envelope.get("body", "")

    elif sec_level == 2:
        kyber_ct = envelope.get("kyber_ciphertext")
        aes_ct = envelope.get("aes_ciphertext")
        nonce = envelope.get("nonce")
        
        if not recipient_kyber_sk or not kyber_ct or not aes_ct or not nonce:
            raise ValueError("Missing required keys or ciphertexts for Level 2 decryption.")

        shared_secret = kyber.decapsulate(recipient_kyber_sk, kyber_ct)
        aes_key = aes_cipher.derive_aes_key(shared_secret)
        plaintext = aes_cipher.decrypt_body(aes_key, aes_ct, nonce)
        return plaintext


    elif sec_level == 3:
        otp_ct_bytes = bytes.fromhex(envelope.get("otp_ciphertext", ""))
        otp_key_bytes = bytes.fromhex(envelope.get("otp_key_hex", ""))
        plaintext_bytes = bytes([c ^ k for c, k in zip(otp_ct_bytes, otp_key_bytes)])
        return plaintext_bytes.decode("utf-8")

    else:
        raise ValueError(f"Unsupported security level: {sec_level}")
