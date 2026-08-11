import json
from crypto_core import key_storage

def get_user_private_keys(user, passphrase: str) -> dict:
    """
    Helper function to decrypt user's stored private keys using their passphrase.
    """
    if not hasattr(user, "keypair"):
        raise ValueError("User has no associated keypair.")

    data = key_storage.decrypt_key_data(
        user.keypair.encrypted_private_keys,
        passphrase,
        user.keypair.salt
    )
    if isinstance(data, str):
        return json.loads(data)
    return data

