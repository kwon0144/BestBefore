from django.urls import path, include
from .views import (
    get_users, create_user, get_temperature_data, get_storage_advice, 
    get_food_types, get_foodbanks, get_second_life_items, get_second_life_item_detail
)
from . import produce_detection
from .output_calender import generate_calendar, generate_ical
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path("users/", get_users, name="get_users"),
    path("users/create/", create_user, name="create_user"),
    path('detect-produce/', produce_detection.detect_produce, name='detect_produce'),
    path('generate_calendar/', generate_calendar, name='generate-calendar'),
    path('calendar/<uuid:calendar_id>.ics', generate_ical, name='generate-ical'),
    path('temperature/', get_temperature_data, name='temperature-data'),
    path('storage-advice/', get_storage_advice, name='get_storage_advice'),
    path('food-types/', get_food_types, name='get_food_types'),
    path('foodbanks/', get_foodbanks, name='get_foodbanks'),
    path('second-life/', get_second_life_items, name='get_second_life_items'),
    path('second-life/<int:item_id>/', get_second_life_item_detail, name='get_second_life_item_detail'),
]
