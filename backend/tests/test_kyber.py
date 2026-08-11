from django.test import TestCase
from crypto_core import kyber

class KyberKEMTestCase(TestCase):
    def test_kyber_keygen_and_encapsulate_decapsulate(self):
        # Generate recipient keypair
        kp = kyber.keygen()
        pk = kp["public_key"]
        sk = kp["private_key"]

        self.assertTrue(pk.startswith("kyber_pk_"))
        self.assertTrue(sk.startswith("kyber_sk_"))

        # Sender encapsulates using recipient public key
        ciphertext, shared_secret_sender = kyber.encapsulate(pk)
        self.assertTrue(ciphertext.startswith("kyber_ct_"))

        # Recipient decapsulates using recipient private key
        shared_secret_recipient = kyber.decapsulate(sk, ciphertext)

        # Assert shared secrets match exactly
        self.assertEqual(shared_secret_sender, shared_secret_recipient)
