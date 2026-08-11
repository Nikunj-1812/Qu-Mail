from django.urls import path
from .views import WireLogView

urlpatterns = [
    path("wire-log/", WireLogView.as_view(), name="wire-log"),
]
