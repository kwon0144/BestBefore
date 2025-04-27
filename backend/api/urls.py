from django.urls import path, include
from .views import (
    get_storage_advice, 
    get_food_types, 
    get_foodbanks,
    get_second_life_items,
    get_second_life_item_detail,
    get_dish_ingredients,
    add_dish_mapping,
    search_dishes,
    get_signature_dishes,
    login,
)
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
    path('second-life/', get_second_life_items, name='get_second_life_items'),
    path('second-life/<int:item_id>/', get_second_life_item_detail, name='get_second_life_item_detail'),
    path('dish-ingredients/', get_dish_ingredients, name='get_dish_ingredients'),
    path('dish-mappings/add/', add_dish_mapping, name='add_dish_mapping'),
    path('search-dishes/', search_dishes, name='search_dishes'),
    path('signature-dishes/', get_signature_dishes, name='get_signature_dishes'),
    path('auth/login/', login, name='login'),
]

