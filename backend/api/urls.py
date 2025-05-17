from django.urls import path, include
from .views import (
    get_storage_advice, 
    get_food_types, 
    get_foodbanks,
    get_second_life_items,
    get_second_life_item_detail,
    get_dish_ingredients,
    search_dishes,
    get_signature_dishes,
    login,
    start_game,
    update_game,
    end_game,
    get_leaderboard,
    get_food_items,
    pickup_food,
    perform_action,
    get_game_resources,
    get_waste_composition,
    get_food_waste_by_category,
    get_economic_impact,
    get_household_impact,
    get_food_emissions
)
from .service import produce_detection_service
from .service.produce_expiry_date_service import storage_assistant
from .service.output_calender_service import generate_calendar, generate_ical
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path('detect-produce/', produce_detection_service.detect_produce, name='detect_produce'),
    path('food-types/', get_food_types, name='get_food_types'),
    path('storage-advice/', get_storage_advice, name='get_storage_advice'),
    path('storage_assistant/', storage_assistant, name='storage_assistant'),
    path('generate_calendar/', generate_calendar, name='generate-calendar'),
    path('calendar/<uuid:calendar_id>.ics', generate_ical, name='generate-ical'),
    path('dish-ingredients/', get_dish_ingredients, name='get_dish_ingredients'),
    path('search-dishes/', search_dishes, name='search_dishes'),
    path('signature-dishes/', get_signature_dishes, name='get_signature_dishes'),
    path('foodbanks/', get_foodbanks, name='get_foodbanks'),
    path('game/start/', start_game, name='start_game'),
    path('game/update/', update_game, name='update_game'),
    path('game/end/', end_game, name='end_game'),
    path('game/leaderboard/', get_leaderboard, name='get_leaderboard'),
    path('game/food-items/', get_food_items, name='get_food_items'),
    path('game/pickup/', pickup_food, name='pickup_food'),
    path('game/action/', perform_action, name='perform_action'),
    path('game/resources/', get_game_resources, name='get_game_resources'),
    path('second-life/', get_second_life_items, name='get_second_life_items'),
    path('second-life/<int:item_id>/', get_second_life_item_detail, name='get_second_life_item_detail'),
    path('auth/login/', login, name='login'),
    path('waste-composition/', get_waste_composition, name='get_waste_composition'),
    path('food-waste-by-category/', get_food_waste_by_category, name='food_waste_by_category'),
    path('economic-impact/', get_economic_impact, name='economic_impact'),
    path('household-impact/', get_household_impact, name='household_impact'),
    path('food-emissions/', get_food_emissions, name='food_emissions'),
]

