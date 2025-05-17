# Django imports
from django.db import connection
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum
# Django REST framework imports
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

# Python standard library imports
import json
import re
import uuid
import random
import logging
from datetime import datetime, timedelta, date
import os

logger = logging.getLogger(__name__)

# Local application imports
from .service.db_service import get_storage_recommendations, get_all_food_types
from .service.dish_ingre_service import DishIngredientService
from .service.hours_parser_service import parse_operating_hours
from .models import Geospatial, SecondLife, Dish, Game, GameFoodResources, FoodWasteComposition, GlobalFoodWastageDataset, FoodEmissions
from .serializer import FoodBankListSerializer, FoodBankDetailSerializer, GlobalFoodWastageSerializer, CountryWastageSerializer, FoodCategoryWastageSerializer, EconomicImpactSerializer
from .game_core import start_new_game, update_game_state, end_game_session, prepare_game_food_items
from .game_validators import get_top_scores, validate_pickup, validate_action
from .game_state import games
from .service.produce_expiry_date_service import get_produce_expiry_info_from_claude
#-----------------------------------------------------------------------
# Food Storage & Information APIs
#-----------------------------------------------------------------------

@api_view(['POST'])
def get_storage_advice(request):
    """
    Get food storage advice based on food type.
    
    Request body:
    - food_type: String (required) - The type of food to get storage advice for
    
    Returns:
    - Storage recommendations for the specified food type
    """
    try:
        data = request.data
        food_type = data.get('food_type')
        
        if not food_type:
            return Response({'error': 'Food type is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get recommendation from database
        recommendation = get_storage_recommendations(food_type)
        
        # Check if it's a real database entry or just default values
        # The db_service returns the food_type as the Type, so if they match case-insensitive
        # and we have default values, we should try Claude instead
        is_default_value = (recommendation['Type'].lower() == food_type.lower() and 
                            recommendation['pantry'] == 14 and 
                            recommendation['fridge'] == 7 and
                            recommendation['method'] == 1)
        
        # If we have default values, try Claude API instead
        if is_default_value:
            claude_recommendation = get_produce_expiry_info_from_claude(food_type)
            if claude_recommendation:
                return Response(claude_recommendation)
            else:
                # Claude also failed, so return the default with database source
                recommendation['source'] = 'database_default'
                return Response(recommendation)
        else:
            # It's a real database entry
            recommendation['source'] = 'database'
            return Response(recommendation)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_food_types(request):
    """
    Get all available food types for storage recommendations.
    
    Returns:
    - List of all food types in the system
    """
    try:
        food_types = get_all_food_types()
        return Response({'food_types': food_types})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#-----------------------------------------------------------------------
# Calendar & Reminder APIs
#-----------------------------------------------------------------------

@api_view(['POST'])
def generate_calendar(request):
    """
    Generate calendar with food expiration reminders.
    
    Request body:
    - items: Array (required) - List of food items with expiration dates
    - reminder_days: Integer (optional, default=2) - Days before expiration to send reminder
    - reminder_time: String (optional, default='20:00') - Time for reminder in 24h format
    
    Returns:
    - Calendar URL and configuration details
    """
    try:
        data = request.data
        items = data.get('items', [])
        reminder_days = data.get('reminder_days', 2)
        reminder_time = data.get('reminder_time', '20:00')
        
        if not items:
            return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique calendar ID
        calendar_id = str(uuid.uuid4())
        
        # Here you can add logic to save calendar data to database
        
        # Return calendar URL
        calendar_url = f"/api/calendar/{calendar_id}.ics"
        
        return Response({
            'calendar_url': calendar_url,
            'items': items,
            'reminder_days': reminder_days,
            'reminder_time': reminder_time
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#-----------------------------------------------------------------------
# Food Bank & Location APIs
#-----------------------------------------------------------------------

@api_view(['GET'])
def get_foodbanks(request):
    """
    Get all food banks with location data and parsed operating hours.
    
    Returns:
    - List of food banks with their details and structured operation schedules
    """
    try:
        # Use raw SQL query to get foodbank data including hours_of_operation
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    id, 
                    name, 
                    latitude, 
                    longitude, 
                    type, 
                    hours_of_operation,
                    address
                FROM 
                    geospatial
                """
            )
            # Convert to list of dictionaries
            columns = [col[0] for col in cursor.description]
            foodbanks_data = [
                dict(zip(columns, row))
                for row in cursor.fetchall()
            ]
        
        # Process operating hours for each foodbank
        for foodbank in foodbanks_data:
            hours_text = foodbank.get('hours_of_operation', '')
            foodbank['operation_schedule'] = parse_operating_hours(hours_text)
        
        return Response({
            'status': 'success',
            'count': len(foodbanks_data),
            'data': foodbanks_data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#-----------------------------------------------------------------------
# Game APIs
#-----------------------------------------------------------------------

@api_view(['POST'])
def start_game(request):
    """
    Start a new game for a player.
    
    Expected request data:
    {
        "player_id": "string"
    }
    
    Returns:
        200 OK: Game started successfully
        400 Bad Request: Invalid player_id
        500 Internal Server Error: Server error
    """
    try:
        player_id = request.data.get('player_id')
        
        if not player_id:
            return Response(
                {'error': 'player_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        game_data = start_new_game(player_id)
        return Response(game_data, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error starting game: {str(e)}")
        return Response(
            {'error': 'Failed to start game'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def update_game(request):
    """
    Update the game state based on player action.
    
    Expected request data:
    {
        "game_id": "string",
        "action": "string",
        "food_type": "string",
        "diy_option": "string",
        "character_position": {"x": float, "y": float},
        "food": {"id": int, "type": string, "name": string, "image": string, "x": float, "y": float}
    }
    
    Returns:
        200 OK: Game updated successfully
        400 Bad Request: Missing required parameters
        404 Not Found: Game not found
        500 Internal Server Error: Server error
    """
    game_id = request.data.get('game_id')
    action = request.data.get('action')
    food_type = request.data.get('food_type')
    diy_option = request.data.get('diy_option')
    character_position = request.data.get('character_position')
    food = request.data.get('food')
    
    if not all([game_id, action, food_type]):
        return Response({'error': 'Missing required parameters'}, status=400)
    
    try:
        # If character position and food are provided, use them for validation
        if character_position and food:
            game_data = update_game_state(game_id, action, food_type, diy_option, character_position, food)
        else:
            game_data = update_game_state(game_id, action, food_type, diy_option)
            
        return Response(game_data)
    except ValueError as e:
        return Response({'error': str(e)}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def end_game(request):
    game_id = request.data.get('game_id')
    if not game_id:
        return Response({'error': 'Game ID is required'}, status=400)
    
    try:
        game_data = end_game_session(game_id)
        return Response(game_data)
    except ValueError as e:
        return Response({'error': str(e)}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_leaderboard(request):
    try:
        top_scores = get_top_scores()
        return Response(top_scores)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_food_items(request):
    """
    Get a balanced list of food items for the game from the database.
    Returns a consistent set of 12 items: 5 food bank, 5 green waste bin, and 2 trash.
    
    Optional query parameter: type (trash, food bank, green waste bin)
    """
    try:
        food_type = request.GET.get('type', None)
        
        # Get base queryset of all food items
        query = GameFoodResources.objects.all()
        
        # If a specific food type is requested, filter by that type
        if food_type:
            query = query.filter(type=food_type)
            food_items = list(query.values('id', 'name', 'type', 'image', 'description', 'diy_option'))
            
            # If we need exactly 5 items of a specific type and have more, randomly select 5
            if len(food_items) > 5:
                food_items = random.sample(food_items, 5)
        else:
            # Use our balanced food item generator to get 12 items (5-5-2 distribution)
            food_items = prepare_game_food_items(query)
            
            # If food_items doesn't include diy_option, we need to add it
            if food_items and 'diy_option' not in food_items[0]:
                # Get all food IDs
                food_ids = [item['id'] for item in food_items]
                # Query the database for diy_option values
                diy_options = {item.id: item.diy_option for item in GameFoodResources.objects.filter(id__in=food_ids)}
                # Add diy_option to each item
                for item in food_items:
                    item['diy_option'] = diy_options.get(item['id'])
        
        return Response({
            'food_items': food_items,
            'count': len(food_items)
        })
    except Exception as e:
        logger.error(f"Error fetching food items: {str(e)}")
        return Response(
            {'error': 'Failed to fetch food items'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def pickup_food(request):
    """
    Validate if a player can pick up food based on their position and available foods.
    
    Expected request data:
    {
        "game_id": "string",
        "character_position": {"x": float, "y": float},
        "foods": [{"id": int, "type": string, "name": string, "image": string, "x": float, "y": float}, ...]
    }
    
    Returns:
        200 OK: Pickup validation result
        400 Bad Request: Missing required parameters
        404 Not Found: Game not found
        500 Internal Server Error: Server error
    """
    game_id = request.data.get('game_id')
    character_position = request.data.get('character_position')
    foods = request.data.get('foods')
    
    if not all([game_id, character_position, foods]):
        return Response({'error': 'Missing required parameters'}, status=400)
    
    try:
        # Check if the game exists
        if game_id not in games:
            return Response({'error': 'Game not found'}, status=404)
            
        # Validate pickup
        result = validate_pickup(character_position, foods)
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def perform_action(request):
    """
    Validate if a player can perform an action (donate, compost, eat, diy) based on their position.
    
    Expected request data:
    {
        "game_id": "string",
        "character_position": {"x": float, "y": float},
        "food": {"id": int, "type": string, "name": string, "image": string, "x": float, "y": float},
        "action_type": "string"  # "donate", "compost", "eat", or "diy"
    }
    
    Returns:
        200 OK: Action validation result
        400 Bad Request: Missing required parameters
        404 Not Found: Game not found
        500 Internal Server Error: Server error
    """
    game_id = request.data.get('game_id')
    character_position = request.data.get('character_position')
    food = request.data.get('food')
    action_type = request.data.get('action_type')
    
    if not all([game_id, character_position, food, action_type]):
        return Response({'error': 'Missing required parameters'}, status=400)
    
    try:
        # Check if the game exists
        if game_id not in games:
            return Response({'error': 'Game not found'}, status=404)
            
        # Validate action
        result = validate_action(character_position, food, action_type)
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

#-----------------------------------------------------------------------
# Second Life Food Repurposing APIs
#-----------------------------------------------------------------------

@api_view(['GET'])
def get_second_life_items(request):
    """
    Get all second life items or filter by search query.
    Second life items are recipes or methods to repurpose food waste.
    
    Query parameters:
    - search: String (optional) - Filter items by ingredient name
    
    Returns:
    - List of second life methods/recipes
    """
    search_query = request.GET.get('search', '')
    
    if search_query:
        items = SecondLife.objects.filter(ingredient__icontains=search_query)
    else:
        items = SecondLife.objects.all()
    
    data = []
    for item in items:
        data.append({
            'method_id': item.method_id,
            'method_name': item.method_name,
            'is_combo': item.is_combo,
            'method_category': item.method_category,
            'ingredient': item.ingredient,
            'description': item.description,
            'picture': item.picture
        })
    
    return Response(data)

@api_view(['GET'])
def get_second_life_item_detail(request, item_id):
    """
    Get details for a specific second life item.
    
    Path parameters:
    - item_id: Integer - The ID of the second life method/recipe
    
    Returns:
    - Detailed information about the specified second life method
    """
    try:
        item = SecondLife.objects.get(method_id=item_id)
        data = {
            'method_id': item.method_id,
            'method_name': item.method_name,
            'is_combo': item.is_combo,
            'method_category': item.method_category,
            'ingredient': item.ingredient,
            'description': item.description,
            'picture': item.picture
        }
        return Response(data)
    except SecondLife.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    
#-----------------------------------------------------------------------
# Meal Planning & Grocery List APIs
#-----------------------------------------------------------------------

# Initialize dish ingredient service
dish_service = DishIngredientService()

@csrf_exempt
@api_view(['POST'])
def search_dishes(request):
    """
    API endpoint to generate grocery lists based on selected meals.
    
    Request body:
    - selected_meals: Array (required) - List of meal names to include in grocery list
    
    Returns:
    - Combined grocery list organized by food category
    - Pantry items separated from regular shopping items
    """
    try:
        data = request.data
        selected_meals = data.get('selected_meals', [])
        
        if not selected_meals:
            return Response({'success': False, 'error': 'No meals selected'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Use the new function to handle ingredient combining
        from .service.ingredient_combiner_service import combine_dish_ingredients
        
        result = combine_dish_ingredients(selected_meals)
        
        # Add pantry items processing
        pantry_items = []
        for category, ingredients in result.get('items_by_category', {}).items():
            for ingredient in ingredients:
                if is_pantry_item(ingredient.get('name', '')):
                    pantry_items.append(ingredient)
        
        # If we found pantry items, remove them from the categories and add as separate list
        if pantry_items:
            # Remove pantry items from categories
            for category in result.get('items_by_category', {}):
                result['items_by_category'][category] = [
                    ingredient for ingredient in result['items_by_category'][category]
                    if not is_pantry_item(ingredient.get('name', ''))
                ]
            
            # Add pantry items to the result
            result['pantry_items'] = pantry_items
            
            # Remove empty categories
            result['items_by_category'] = {
                k: v for k, v in result.get('items_by_category', {}).items() if v
            }
        
        return Response(result)
        
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def categorize_ingredient(ingredient):
    """
    Helper function to categorize ingredients into food groups.
    
    Parameters:
    - ingredient: String - Name of the ingredient to categorize
    
    Returns:
    - Category name as string
    """
    ingredient = ingredient.lower()
    
    # Meat
    meat_keywords = ['beef', 'chicken', 'pork', 'turkey', 'veal', 'lamb', 'ground meat', 'steak', 'sausage', 
                     'bacon', 'ham', 'salami', 'sausage', 'sausages', 'sausages']
    if any(keyword in ingredient for keyword in meat_keywords):
        return 'Meat'
    
    # Fish
    fish_keywords = ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'seafood', 'crab', 'lobster',
                     'clam', 'oyster', 'mussel', 'scallop', 'scallops', 'crab legs', 'crab claws', 'crab claws']
    if any(keyword in ingredient for keyword in fish_keywords):
        return 'Fish'
    
    # Produce
    produce_keywords = ['vegetable', 'fruit', 'tomato', 'lettuce', 'onion', 'garlic', 'pepper', 'carrot', 
                       'broccoli', 'cabbage', 'spinach', 'apple', 'orange', 'banana', 'herb', 'lemon']
    if any(keyword in ingredient for keyword in produce_keywords):
        return 'Produce'
    
    # Dairy
    dairy_keywords = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy', 'ice cream']
    if any(keyword in ingredient for keyword in dairy_keywords):
        return 'Dairy'
    
    # Grains
    grain_keywords = ['rice', 'pasta', 'bread', 'flour', 'cereal', 'oat', 'grain', 'wheat', 'barley']
    if any(keyword in ingredient for keyword in grain_keywords):
        return 'Grains'
    
    # Condiments
    condiment_keywords = ['sauce', 'oil', 'vinegar', 'ketchup', 'mustard', 'mayo', 'dressing', 'seasoning', 'spice']
    if any(keyword in ingredient for keyword in condiment_keywords):
        return 'Condiments'
    
    # Default to Other
    return 'Other'

def is_pantry_item(ingredient):
    """
    Helper function to determine if an ingredient is a pantry staple.
    
    Parameters:
    - ingredient: String - Name of the ingredient to check
    
    Returns:
    - Boolean indicating whether the item is a pantry staple
    """
    ingredient = ingredient.lower()
    pantry_keywords = ['salt', 'pepper', 'sugar', 'flour', 'oil', 'vinegar', 'spice', 'herb', 'seasoning', 
                     'stock', 'pasta', 'rice', 'grain', 'canned', 'dried', 'baking', 'sauce']
    
    return any(keyword in ingredient for keyword in pantry_keywords)

@csrf_exempt
@api_view(['POST'])
def get_dish_ingredients(request):
    """
    Get all ingredients needed for a specific dish.
    
    Request body:
    - dish_name: String (required) - Name of the dish to get ingredients for
    
    Returns:
    - List of ingredients required for the specified dish
    """
    try:
        data = request.data
        dish_name = data.get('dish_name')

        if not dish_name:
            return Response({'error': 'Dish name is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get ingredients using DishIngredientService
        result = dish_service.get_ingredients(dish_name)

        if 'error' in result:
            return Response({'error': result['error']}, status=status.HTTP_404_NOT_FOUND)

        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_signature_dishes(request):
    """
    Get signature dishes, optionally filtered by cuisine.
    
    Query parameters:
    - cuisine: String (optional) - Filter dishes by cuisine type
    
    Returns:
    - List of dishes with their details and images
    """
    cuisine_filter = request.GET.get('cuisine', '')
    
    # Start with all dishes
    dishes = Dish.objects.all()
    
    # Apply cuisine filter if provided
    if cuisine_filter:
        dishes = dishes.filter(cuisine__iexact=cuisine_filter)
    
    # Format the data for response
    data = []
    for dish in dishes:
        data.append({
            'id': dish.id,
            'name': dish.name,
            'description': dish.description,
            'cuisine': dish.cuisine,
            'imageUrl': dish.URL
        })
    
    return Response(data)

#-----------------------------------------------------------------------
# Authentication APIs (Login)
#-----------------------------------------------------------------------

@api_view(['POST'])
def login(request):
    """
    Simple password-based authentication endpoint.
    
    Request body:
    - password: String (required) - Site password for authentication
    
    Returns:
    - Success response with session cookie if authenticated
    - Error message if authentication fails
    """
    try:
        password = request.data.get('password')
        
        if not os.getenv('NEXT_PUBLIC_SITE_PASSWORD'):
            return Response(
                {'error': 'Server configuration error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if password == os.getenv('NEXT_PUBLIC_SITE_PASSWORD'):
            response = Response({'success': True})
            response.set_cookie(
                'session_token',
                'authenticated',
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=60 * 60 * 24 * 7  # 1 week
            )
            return response

        return Response(
            {'error': 'Invalid password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_game_resources(request):
    """
    Get game resources (maps, background, icons) from the database.
    This endpoint retrieves resources used in the game UI.
    """
    try:
        # Get resources from the database
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    id, 
                    name, 
                    type, 
                    description,
                    image
                FROM 
                    game_resources
                """
            )
            # Convert to list of dictionaries
            columns = [col[0] for col in cursor.description]
            resources_data = [
                dict(zip(columns, row))
                for row in cursor.fetchall()
            ]
            
        return Response({
            'status': 'success',
            'count': len(resources_data),
            'resources': resources_data
        })
    except Exception as e:
        logger.error(f"Error fetching game resources: {str(e)}")
        return Response(
            {'error': 'Failed to fetch game resources'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

#-----------------------------------------------------------------------
# Food Waste Composition APIs
#-----------------------------------------------------------------------

@api_view(['GET'])
def get_waste_composition(request):
    """
    Get food waste composition data with calculated percentages
    for visualization purposes using Django ORM.
    """
    try:
        # Query the data using ORM
        waste_data = FoodWasteComposition.objects.all().order_by('-quantity')
        
        # Calculate total quantity
        total_quantity = FoodWasteComposition.objects.aggregate(
            total=Sum('quantity')
        )['total'] or 0
        
        # Format the data with percentages - without colors
        formatted_data = []
        for item in waste_data:
            percentage = (item.quantity / total_quantity) * 100 if total_quantity > 0 else 0
            formatted_data.append({
                'name': item.type,
                'value': item.quantity,
                'percentage': round(percentage, 2)
            })
        
        return Response({
            'total_tonnes': round(total_quantity, 2),
            'data': formatted_data,
            'updated_at': timezone.now().isoformat()
        })
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#-----------------------------------------------------------------------
# Global Food Wastage APIs
#-----------------------------------------------------------------------

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, F, ExpressionWrapper, FloatField
from django.utils import timezone

from .models import GlobalFoodWastageDataset

@api_view(['GET'])
def get_food_waste_by_category(request):
    """
    API endpoint that provides food waste data grouped by food category.
    
    This endpoint aggregates data to show which food categories contribute most
    to overall waste, both in terms of quantity and economic impact.
    
    Query parameters:
    - year: Filter by specific year
    - country: Filter by specific country
    
    Returns:
    - A list of food categories with their total waste, economic loss, and percentage of total
    """
    try:
        # Get query parameters
        year = request.query_params.get('year')
        country = request.query_params.get('country')
        
        # Start with all data
        queryset = GlobalFoodWastageDataset.objects.all()
        
        # Apply filters if provided
        if year:
            queryset = queryset.filter(year=year)
        if country:
            queryset = queryset.filter(country__iexact=country)
        
        # Calculate total waste for percentage calculation
        total_waste = queryset.aggregate(Sum('total_waste'))['total_waste__sum'] or 0
        
        # Get unique food categories
        categories = queryset.values_list('food_category', flat=True).distinct()
        
        # Prepare result data
        result_data = []
        for category in categories:
            # Filter for this category
            category_queryset = queryset.filter(food_category=category)
            
            # Calculate aggregates for this category
            category_waste = category_queryset.aggregate(Sum('total_waste'))['total_waste__sum'] or 0
            category_loss = category_queryset.aggregate(Sum('economic_loss'))['economic_loss__sum'] or 0
            
            # Calculate percentage of total waste
            percentage = (category_waste / total_waste * 100) if total_waste > 0 else 0
            
            # Add to results
            result_data.append({
                'category': category,
                'total_waste': category_waste,
                'economic_loss': category_loss,
                'percentage': round(percentage, 2)
            })
        
        # Sort by waste amount (descending)
        result_data.sort(key=lambda x: x['total_waste'], reverse=True)
        
        return Response({
            'total_waste': total_waste,
            'categories': result_data,
            'filters': {
                'year': year or 'all',
                'country': country or 'all'
            },
            'updated_at': timezone.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_economic_impact(request):
    """
    API endpoint that focuses on the economic impact of food waste.
    
    This endpoint calculates economic metrics including per-household costs
    and analyzes how economic loss is distributed across different countries
    and food categories.
    
    Query parameters:
    - year: Filter by specific year
    - country: Filter by specific country
    
    Returns:
    - Economic impact summary and breakdowns by country/category
    """
    try:
        # Get query parameters
        year = request.query_params.get('year')
        country = request.query_params.get('country')
        
        # Start with all data
        queryset = GlobalFoodWastageDataset.objects.all()
        
        # Apply filters if provided
        if year:
            queryset = queryset.filter(year=year)
        if country:
            queryset = queryset.filter(country__iexact=country)
        
        # Calculate overall economic metrics
        total_economic_loss = queryset.aggregate(Sum('economic_loss'))['economic_loss__sum'] or 0
        total_waste = queryset.aggregate(Sum('total_waste'))['total_waste__sum'] or 0
        avg_household_waste = queryset.aggregate(Avg('household_waste'))['household_waste__avg'] or 0
        
        # Initialize lists for country and category breakdown
        countries_data = []
        
        # Get unique countries
        countries = queryset.values_list('country', flat=True).distinct()
        
        # Calculate per-country metrics
        for country_name in countries:
            country_queryset = queryset.filter(country=country_name)
            
            # Get the latest year for this country
            latest_year_item = country_queryset.order_by('-year').first()
            
            if latest_year_item:
                # Calculate country totals
                country_loss = country_queryset.aggregate(Sum('economic_loss'))['economic_loss__sum'] or 0
                country_waste = country_queryset.aggregate(Sum('total_waste'))['total_waste__sum'] or 0
                
                # Calculate household impact
                population_value = latest_year_item.population
                household_waste_pct = latest_year_item.household_waste
                
                # Assume average household size of 2.5 people
                households = (population_value * 1000000) / 2.5 if population_value > 0 else 0
                
                # Calculate economic loss attributable to households
                household_economic_loss = country_loss * (household_waste_pct / 100)
                
                # Calculate per-household cost
                cost_per_household = (household_economic_loss * 1000000) / households if households > 0 else 0
                
                countries_data.append({
                    'country': country_name,
                    'total_economic_loss': country_loss,
                    'population': population_value,
                    'household_waste_percentage': household_waste_pct,
                    'annual_cost_per_household': round(cost_per_household, 2),
                    'total_waste': country_waste
                })
        
        # Sort countries by economic loss
        countries_data.sort(key=lambda x: x['total_economic_loss'], reverse=True)
        
        
        # Return response
        return Response({
            'summary': {
                'total_economic_loss': total_economic_loss,
                'total_waste': total_waste,
                'economic_loss_per_ton': total_economic_loss / total_waste if total_waste > 0 else 0,
                'avg_household_waste_percentage': avg_household_waste
            },
            'countries': countries_data,
            'updated_at': timezone.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_household_impact(request):
    """
    API endpoint that specifically focuses on household-level food waste impact.
    
    This endpoint calculates metrics related to household food waste,
    including economic costs per household and waste per capita.
    
    Query parameters:
    - country: Filter by specific country (required)
    - year: Filter by specific year (optional)
    
    Returns:
    - Household impact metrics and visualizable data
    """
    try:
        # Get query parameters
        country = request.query_params.get('country')
        year = request.query_params.get('year')
        
        # Country is required for this endpoint
        if not country:
            return Response({
                'error': 'Country parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Filter by country
        queryset = GlobalFoodWastageDataset.objects.filter(country__iexact=country)
        
        # Apply year filter if provided
        if year:
            queryset = queryset.filter(year=year)
        
        # If no data found for this country
        if not queryset.exists():
            return Response({
                'error': f'No data found for country: {country}'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get available years
        years = queryset.values_list('year', flat=True).distinct().order_by('year')
        
        # Calculate yearly metrics
        yearly_data = []
        for year_value in years:
            year_queryset = queryset.filter(year=year_value)
            
            # Get a representative item for this year
            sample_item = year_queryset.first()
            
            if sample_item:
                # Calculate waste metrics for this year
                year_waste = year_queryset.aggregate(Sum('total_waste'))['total_waste__sum'] or 0
                year_loss = year_queryset.aggregate(Sum('economic_loss'))['economic_loss__sum'] or 0
                
                # Calculate household impact
                population_value = sample_item.population
                household_waste_pct = sample_item.household_waste
                waste_per_capita = sample_item.waste_capita
                
                # Assume average household size of 2.5 people
                households = (population_value * 1000000) / 2.5 if population_value > 0 else 0
                
                # Calculate economic loss attributable to households
                household_economic_loss = year_loss * (household_waste_pct / 100)
                
                # Calculate per-household cost
                cost_per_household = (household_economic_loss * 1000000) / households if households > 0 else 0
                
                yearly_data.append({
                    'year': year_value,
                    'waste_per_capita': waste_per_capita,
                    'total_waste': year_waste,
                    'economic_loss': year_loss,
                    'population': population_value,
                    'household_waste_percentage': household_waste_pct,
                    'annual_cost_per_household': round(cost_per_household, 2),
                    'household_waste_tons': year_waste * (household_waste_pct / 100)
                })
        
        # Get latest year data for overall metrics
        latest_year = max(years) if years else None
        
        # Calculate overall metrics
        if latest_year:
            latest_data = queryset.filter(year=latest_year)
            latest_item = latest_data.first()
            
            overall_metrics = {
                'latest_year': latest_year,
                'waste_per_capita': latest_item.waste_capita if latest_item else 0,
                'household_waste_percentage': latest_item.household_waste if latest_item else 0,
                'country': country,
                'population': latest_item.population if latest_item else 0,
            }
        else:
            overall_metrics = {
                'country': country,
                'error': 'No data available'
            }
        
        return Response({
            'overall': overall_metrics,
            'yearly_data': yearly_data,
            'potential_savings': {
                'reduction_50_percent': yearly_data[-1]['annual_cost_per_household'] * 0.5 if yearly_data else 0,
                'reduction_25_percent': yearly_data[-1]['annual_cost_per_household'] * 0.25 if yearly_data else 0
            },
            'updated_at': timezone.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

#-----------------------------------------------------------------------
# Food Emissions APIs
#-----------------------------------------------------------------------

@api_view(['GET'])
def get_food_emissions(request):
    """
    API endpoint that provides food emissions data grouped by food type.
    
    Query parameters:
    - food_type: Filter by specific food type (optional)
    
    Returns:
    - A list of food types with their greenhouse gas emissions
    """
    try: 
        # Get query parameters
        food_type = request.query_params.get('food_type')

        # Start with all data
        queryset = FoodEmissions.objects.all()
        
        # Apply filter if provided
        if food_type:
            queryset = queryset.filter(food_type__icontains=food_type)
        
        # Format the data for response
        emissions_data = []
        for item in queryset:
            emissions_data.append({
                'food_type': item.food_type,
                'ghg': item.ghg
            })
        
        return Response(emissions_data)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
