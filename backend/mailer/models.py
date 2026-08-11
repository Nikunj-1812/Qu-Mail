
from django.db import models

from django.conf import settings

class EncryptedEmail(models.Model):
    """
    Stores encrypted mail metadata and cryptographic envelope payload.
    """
    SECURITY_LEVEL_CHOICES = (
        (1, "Level 1 - Plaintext"),
        (2, "Level 2 - AES + Kyber KEM"),
        (3, "Level 3 - One-Time Pad (XOR)"),
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_emails"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_emails"
    )
    security_level = models.IntegerField(choices=SECURITY_LEVEL_CHOICES, default=2)
    subject = models.CharField(max_length=255)
    encrypted_payload = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Email [{self.get_security_level_display()}] from {self.sender.username} to {self.recipient.username} ({self.subject})"
