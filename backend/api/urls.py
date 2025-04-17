from django.urls import path, include
from .views import get_storage_advice, get_food_types, get_foodbanks
from . import produce_detection
from .output_calender import generate_calendar, generate_ical
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path('detect-produce/', produce_detection.detect_produce, name='detect_produce'),
    path('generate_calendar/', generate_calendar, name='generate-calendar'),
    path('calendar/<uuid:calendar_id>.ics', generate_ical, name='generate-ical'),
    path('storage-advice/', get_storage_advice, name='get_storage_advice'),
    path('food-types/', get_food_types, name='get_food_types'),
    path('foodbanks/', get_foodbanks, name='get_foodbanks'),
]
