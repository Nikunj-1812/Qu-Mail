from django.db import models

class InterceptedPacket(models.Model):
    """
    Stores raw intercepted network packets as they travel across the simulated wire.
    """
    email = models.ForeignKey(
        "mailer.EncryptedEmail",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="intercepted_packets"
    )
    sender_username = models.CharField(max_length=150)
    recipient_username = models.CharField(max_length=150)
    security_level = models.IntegerField()
    raw_payload = models.JSONField()
    intercepted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-intercepted_at"]

    def __str__(self):
        return f"Packet [L{self.security_level}] {self.sender_username} -> {self.recipient_username} at {self.intercepted_at}"
