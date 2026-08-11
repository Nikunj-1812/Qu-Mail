from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Extended User model for QuantumMail.
    """
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.username} <{self.email}>"


class UserKeypair(models.Model):
    """
    Stores public keys, and private keys encrypted at rest using a Fernet key
    derived from the user's login passphrase.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="keypair")
    kyber_public_key = models.TextField()
    dilithium_public_key = models.TextField()
    encrypted_private_keys = models.TextField()  # Encrypted JSON containing sks
    salt = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Keypair for {self.user.username}"
