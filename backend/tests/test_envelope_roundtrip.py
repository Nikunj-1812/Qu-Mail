from django.test import TestCase
from crypto_core import kyber, dilithium, envelope

class EnvelopeRoundtripTestCase(TestCase):
    def setUp(self):
        self.sender_dilithium = dilithium.keygen()
        self.recipient_kyber = kyber.keygen()
        self.plaintext = "Quantum top secret document content."

    def test_level_1_roundtrip(self):
        env = envelope.create_envelope(
            sender_sk=self.sender_dilithium["private_key"],
            sender_pk=self.sender_dilithium["public_key"],
            recipient_kyber_pk=self.recipient_kyber["public_key"],
            body=self.plaintext,
            security_level=1,
        )
        self.assertEqual(env["security_level"], 1)
        self.assertEqual(env["body"], self.plaintext)

        decrypted = envelope.decrypt_envelope(env)
        self.assertEqual(decrypted, self.plaintext)

    def test_level_2_roundtrip(self):
        env = envelope.create_envelope(
            sender_sk=self.sender_dilithium["private_key"],
            sender_pk=self.sender_dilithium["public_key"],
            recipient_kyber_pk=self.recipient_kyber["public_key"],
            body=self.plaintext,
            security_level=2,
        )
        self.assertEqual(env["security_level"], 2)
        self.assertIn("kyber_ciphertext", env)
        self.assertIn("aes_ciphertext", env)

        decrypted = envelope.decrypt_envelope(
            env, recipient_kyber_sk=self.recipient_kyber["private_key"]
        )
        self.assertEqual(decrypted, self.plaintext)

    def test_level_3_roundtrip(self):
        env = envelope.create_envelope(
            sender_sk=self.sender_dilithium["private_key"],
            sender_pk=self.sender_dilithium["public_key"],
            recipient_kyber_pk=self.recipient_kyber["public_key"],
            body=self.plaintext,
            security_level=3,
        )
        self.assertEqual(env["security_level"], 3)
        self.assertIn("otp_ciphertext", env)
        self.assertIn("otp_key_hex", env)

        decrypted = envelope.decrypt_envelope(env)
        self.assertEqual(decrypted, self.plaintext)
