from rest_framework import serializers
from django.contrib.auth import get_user_model
from accounts.serializers import UserSerializer
from .models import EncryptedEmail

User = get_user_model()

class EncryptedEmailListSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)

    class Meta:
        model = EncryptedEmail
        fields = [
            "id",
            "sender",
            "recipient",
            "security_level",
            "subject",
            "timestamp",
            "is_read",
        ]


class EncryptedEmailDetailSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    decrypted_body = serializers.SerializerMethodField()

    class Meta:
        model = EncryptedEmail
        fields = [
            "id",
            "sender",
            "recipient",
            "security_level",
            "subject",
            "encrypted_payload",
            "decrypted_body",
            "timestamp",
            "is_read",
        ]

    def get_decrypted_body(self, obj):
        return self.context.get("decrypted_body", "")


class ComposeEmailSerializer(serializers.Serializer):
    recipient_username = serializers.CharField(required=True)
    subject = serializers.CharField(max_length=255, required=True)
    body = serializers.CharField(required=True)
    security_level = serializers.IntegerField(default=2)
    passphrase = serializers.CharField(required=False, allow_blank=True, default="Demo@1234")

    def validate_security_level(self, value):
        if value not in [1, 2, 3]:
            raise serializers.ValidationError("Security level must be 1, 2, or 3.")
        return value

    def validate_recipient_username(self, value):
        try:
            user = User.objects.get(username=value)
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError(f"User with username '{value}' does not exist.")
