from django.test import TestCase
from crypto_core import aes_cipher

class AESCipherTestCase(TestCase):
    def test_aes_encrypt_decrypt_roundtrip(self):
        shared_secret = "test_shared_secret_string_123456"
        key_bytes = aes_cipher.derive_aes_key(shared_secret)

        plaintext = "Confidential quantum mail payload."
        res = aes_cipher.encrypt_body(key_bytes, plaintext)

        self.assertIn("ciphertext", res)
        self.assertIn("nonce", res)

        decrypted = aes_cipher.decrypt_body(key_bytes, res["ciphertext"], res["nonce"])
        self.assertEqual(decrypted, plaintext)
