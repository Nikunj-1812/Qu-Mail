import json
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import UserKeypair
from mailer.models import EncryptedEmail
from network_sim.models import InterceptedPacket
from crypto_core import kyber, dilithium, key_storage, envelope

User = get_user_model()


DEMO_USERS = [
    {"username": "alice_demo", "email": "alice@qumail.test", "role": "Sender in demo"},
    {"username": "bob_demo", "email": "bob@qumail.test", "role": "Receiver in demo"},
    {"username": "judge_demo", "email": "judge@qumail.test", "role": "Neutral account for judges"},
]

DEFAULT_PASSWORD = "Demo@1234"

class Command(BaseCommand):
    help = "Seed demo accounts and pre-populated encrypted emails for testing"

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("=========================================="))
        self.stdout.write(self.style.MIGRATE_HEADING("      SEEDING QUANTUM MAIL DEMO DATA      "))
        self.stdout.write(self.style.MIGRATE_HEADING("=========================================="))

        user_instances = {}

        # 1. Create Users & Keypairs idempotently
        for user_data in DEMO_USERS:
            username = user_data["username"]
            email = user_data["email"]

            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email}
            )
            user.set_password(DEFAULT_PASSWORD)
            user.save()

            if not hasattr(user, "keypair"):
                kyber_pair = kyber.keygen()
                dilithium_pair = dilithium.keygen()
                sk_dict = {
                    "kyber_private_key": kyber_pair["private_key"],
                    "dilithium_private_key": dilithium_pair["private_key"]
                }
                encrypted_sk, salt = key_storage.encrypt_key_data(sk_dict, DEFAULT_PASSWORD)

                UserKeypair.objects.create(
                    user=user,
                    kyber_public_key=kyber_pair["public_key"],
                    dilithium_public_key=dilithium_pair["public_key"],
                    encrypted_private_keys=encrypted_sk,
                    salt=salt
                )
                self.stdout.write(self.style.SUCCESS(f"[CREATED] User: {username} | Email: {email}"))
            else:
                self.stdout.write(self.style.WARNING(f"[EXISTS] User: {username} | Email: {email}"))

            user_instances[username] = user

        alice = user_instances["alice_demo"]
        bob = user_instances["bob_demo"]

        # Retrieve Alice's private key and Bob's public key
        alice_sk_data = key_storage.decrypt_key_data(
            alice.keypair.encrypted_private_keys,
            DEFAULT_PASSWORD,
            alice.keypair.salt
        )
        if isinstance(alice_sk_data, str):
            alice_sk_data = json.loads(alice_sk_data)
        alice_dilithium_sk = alice_sk_data["dilithium_private_key"]

        alice_dilithium_pk = alice.keypair.dilithium_public_key
        bob_kyber_pk = bob.keypair.kyber_public_key


        sample_emails = [
            {
                "level": 1,
                "subject": "[Level 1] Unencrypted Standard Transmission",
                "body": "Hello Bob, this is a standard Level 1 unencrypted email from Alice. Notice that on the wire log, this text is visible in clear text."
            },
            {
                "level": 2,
                "subject": "[Level 2] Kyber KEM + AES-256 GCM Encrypted",
                "body": "Hello Bob, this is a Level 2 email secured with Kyber Post-Quantum KEM key exchange and AES-256 GCM symmetric payload encryption."
            },
            {
                "level": 3,
                "subject": "[Level 3] Quantum One-Time Pad (OTP) Encrypted",
                "body": "Hello Bob, this email is protected by Level 3 Quantum One-Time Pad (OTP) encryption. The payload on the wire is mathematically uncrackable."
            }
        ]

        # Clear previous sample emails between Alice and Bob to maintain cleanliness on re-runs
        EncryptedEmail.objects.filter(sender=alice, recipient=bob).delete()

        self.stdout.write("\nGenerating sample emails from Alice -> Bob...")

        for item in sample_emails:
            sec_level = item["level"]
            subj = item["subject"]
            content = item["body"]

            payload = envelope.create_envelope(
                sender_sk=alice_dilithium_sk,
                sender_pk=alice_dilithium_pk,
                recipient_kyber_pk=bob_kyber_pk,
                body=content,
                security_level=sec_level
            )

            email_obj = EncryptedEmail.objects.create(
                sender=alice,
                recipient=bob,
                security_level=sec_level,
                subject=subj,
                encrypted_payload=payload
            )

            InterceptedPacket.objects.create(
                email=email_obj,
                sender_username=alice.username,
                recipient_username=bob.username,
                security_level=sec_level,
                raw_payload=payload
            )

            self.stdout.write(self.style.SUCCESS(f"  -> Created Level {sec_level} email: '{subj}'"))

        self.stdout.write("\n" + self.style.MIGRATE_HEADING("=========================================="))
        self.stdout.write(self.style.MIGRATE_HEADING("         DEMO ACCOUNTS READY              "))
        self.stdout.write(self.style.MIGRATE_HEADING("=========================================="))
        for u in DEMO_USERS:
            self.stdout.write(f" Username: {u['username']:<12} | Password: {DEFAULT_PASSWORD:<10} | Role: {u['role']}")
        self.stdout.write(self.style.MIGRATE_HEADING("==========================================\n"))
