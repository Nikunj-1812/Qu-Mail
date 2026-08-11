from django.urls import path
from .views import ComposeEmailView, InboxListView, SentListView, EmailDetailView

urlpatterns = [
    path("compose/", ComposeEmailView.as_view(), name="mail-compose"),
    path("inbox/", InboxListView.as_view(), name="mail-inbox"),
    path("sent/", SentListView.as_view(), name="mail-sent"),
    path("<int:pk>/", EmailDetailView.as_view(), name="mail-detail"),
]
