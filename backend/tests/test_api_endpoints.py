from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.management import call_command

User = get_user_model()

class APIEndpointsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Seed demo data
        call_command("seed_demo")

    def test_login_success(self):
        url = reverse("auth-login")
        data = {"username": "alice_demo", "password": "Demo@1234"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("user", response.data)

    def test_signup_success(self):
        url = reverse("auth-signup")
        data = {
            "username": "charlie_test",
            "email": "charlie@qumail.test",
            "password": "Password@123",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)

    def test_compose_and_inbox(self):
        # Login as Alice
        login_res = self.client.post(
            reverse("auth-login"),
            {"username": "alice_demo", "password": "Demo@1234"},
            format="json",
        )
        access_token = login_res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Compose mail to Bob
        compose_url = reverse("mail-compose")
        data = {
            "recipient_username": "bob_demo",
            "subject": "Test Message",
            "body": "Hello Bob from automated test!",
            "security_level": 2,
            "passphrase": "Demo@1234",
        }
        compose_res = self.client.post(compose_url, data, format="json")
        self.assertEqual(compose_res.status_code, status.HTTP_201_CREATED)

        # Login as Bob to check inbox
        bob_login = self.client.post(
            reverse("auth-login"),
            {"username": "bob_demo", "password": "Demo@1234"},
            format="json",
        )
        bob_token = bob_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {bob_token}")

        inbox_res = self.client.get(reverse("mail-inbox"))
        self.assertEqual(inbox_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(inbox_res.data), 1)

    def test_wire_log_endpoint(self):
        url = reverse("wire-log")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should have packets from seed_demo
        self.assertGreaterEqual(len(res.data), 3)
