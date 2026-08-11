from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from crypto_core import envelope, key_storage
from network_sim.models import InterceptedPacket
from .models import EncryptedEmail
from .serializers import (
    EncryptedEmailListSerializer,
    EncryptedEmailDetailSerializer,
    ComposeEmailSerializer,
)

User = get_user_model()

class ComposeEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ComposeEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        assert isinstance(data, dict)
        recipient = data["recipient_username"]
        subject = data["subject"]
        body = data["body"]
        sec_level = data["security_level"]
        passphrase = data.get("passphrase", "Demo@1234")


        sender = request.user

        # Fetch recipient's public key
        if not hasattr(recipient, "keypair"):
            return Response(
                {"detail": f"Recipient '{recipient.username}' has no keypair."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        recipient_kyber_pk = recipient.keypair.kyber_public_key

        # Fetch sender's private key
        sender_sk = ""
        sender_pk = ""
        if hasattr(sender, "keypair"):
            sender_pk = sender.keypair.dilithium_public_key
            try:
                sk_data = key_storage.decrypt_key_data(
                    sender.keypair.encrypted_private_keys,
                    passphrase,
                    sender.keypair.salt,
                )
                sender_sk = sk_data.get("dilithium_private_key", "")
            except Exception:
                # Fallback if custom passphrase didn't work
                pass

        # Create cryptographic envelope
        payload_envelope = envelope.create_envelope(
            sender_sk=sender_sk,
            sender_pk=sender_pk,
            recipient_kyber_pk=recipient_kyber_pk,
            body=body,
            security_level=sec_level,
        )

        # Save EncryptedEmail
        email_obj = EncryptedEmail.objects.create(
            sender=sender,
            recipient=recipient,
            security_level=sec_level,
            subject=subject,
            encrypted_payload=payload_envelope,
        )

        # Create InterceptedPacket in network simulation
        InterceptedPacket.objects.create(
            email=email_obj,
            sender_username=sender.username,
            recipient_username=recipient.username,
            security_level=sec_level,
            raw_payload=payload_envelope,
        )

        out_serializer = EncryptedEmailDetailSerializer(
            email_obj, context={"decrypted_body": body}
        )
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


class InboxListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EncryptedEmailListSerializer

    def get_queryset(self):
        return EncryptedEmail.objects.filter(recipient=self.request.user)


class SentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EncryptedEmailListSerializer

    def get_queryset(self):
        return EncryptedEmail.objects.filter(sender=self.request.user)


class EmailDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            email_obj = EncryptedEmail.objects.get(pk=pk)
        except EncryptedEmail.DoesNotExist:
            return Response({"detail": "Email not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != email_obj.sender and request.user != email_obj.recipient:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        # Mark read if viewer is recipient
        if request.user == email_obj.recipient and not email_obj.is_read:
            email_obj.is_read = True
            email_obj.save(update_fields=["is_read"])

        # Attempt to decrypt body
        passphrase = request.headers.get("X-Passphrase", "Demo@1234")
        decrypted_body = ""

        try:
            sec_level = email_obj.security_level
            if sec_level == 1:
                decrypted_body = envelope.decrypt_envelope(email_obj.encrypted_payload)
            elif sec_level == 3:
                decrypted_body = envelope.decrypt_envelope(email_obj.encrypted_payload)
            elif sec_level == 2:
                # Need recipient's Kyber secret key
                target_user = email_obj.recipient
                recipient_sk = ""
                if hasattr(target_user, "keypair"):
                    try:
                        sk_data = key_storage.decrypt_key_data(
                            target_user.keypair.encrypted_private_keys,
                            passphrase,
                            target_user.keypair.salt,
                        )
                        recipient_sk = sk_data.get("kyber_private_key", "")
                    except Exception:
                        # Attempt default fallback passphrase Demo@1234
                        sk_data = key_storage.decrypt_key_data(
                            target_user.keypair.encrypted_private_keys,
                            "Demo@1234",
                            target_user.keypair.salt,
                        )
                        recipient_sk = sk_data.get("kyber_private_key", "")

                decrypted_body = envelope.decrypt_envelope(
                    email_obj.encrypted_payload, recipient_kyber_sk=recipient_sk
                )
        except Exception as e:
            decrypted_body = f"[Decryption Error: {str(e)}]"

        serializer = EncryptedEmailDetailSerializer(
            email_obj, context={"decrypted_body": decrypted_body}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            email_obj = EncryptedEmail.objects.get(pk=pk)
        except EncryptedEmail.DoesNotExist:
            return Response({"detail": "Email not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != email_obj.sender and request.user != email_obj.recipient:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        email_obj.delete()
        return Response({"detail": "Email deleted successfully."}, status=status.HTTP_200_OK)

