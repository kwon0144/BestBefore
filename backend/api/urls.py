from django.urls import path
from .views import get_users, create_user
from . import produce_detection

urlpatterns = [
    path("users/", get_users, name="get_users"),
    path("users/create/", create_user, name="create_user"),
    path('detect-produce/', produce_detection.detect_produce, name='detect_produce')
]