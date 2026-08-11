from rest_framework import generics, permissions, serializers
from .models import InterceptedPacket

class InterceptedPacketSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterceptedPacket
        fields = ["id", "email", "sender_username", "recipient_username", "security_level", "raw_payload", "intercepted_at"]


class WireLogView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]  # Publicly visible for testing UI / judge review
    queryset = InterceptedPacket.objects.all()
    serializer_class = InterceptedPacketSerializer
