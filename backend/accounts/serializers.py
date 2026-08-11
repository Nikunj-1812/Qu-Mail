from rest_framework import serializers
from django.contrib.auth import get_user_model
from crypto_core import kyber, dilithium, key_storage
from .models import UserKeypair

User = get_user_model()

class UserKeypairSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserKeypair
        fields = ["kyber_public_key", "dilithium_public_key", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    kyber_public_key = serializers.SerializerMethodField()
    dilithium_public_key = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "kyber_public_key", "dilithium_public_key"]

    def get_kyber_public_key(self, obj):
        if hasattr(obj, "keypair"):
            return obj.keypair.kyber_public_key
        return ""

    def get_dilithium_public_key(self, obj):
        if hasattr(obj, "keypair"):
            return obj.keypair.dilithium_public_key
        return ""


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)

        # Generate Kyber KEM and Dilithium Signature keypairs
        kyber_pair = kyber.keygen()
        dilithium_pair = dilithium.keygen()

        private_keys_data = {
            "kyber_private_key": kyber_pair["private_key"],
            "dilithium_private_key": dilithium_pair["private_key"]
        }

        # Encrypt private keys at rest using Fernet key derived from password
        encrypted_sk_b64, salt_hex = key_storage.encrypt_key_data(private_keys_data, password)

        UserKeypair.objects.create(
            user=user,
            kyber_public_key=kyber_pair["public_key"],
            dilithium_public_key=dilithium_pair["public_key"],
            encrypted_private_keys=encrypted_sk_b64,
            salt=salt_hex
        )

        return user
