# Django imports
from django.db import connection
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

# Django REST framework imports
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

# Python standard library imports
import json
import re
import uuid
from datetime import datetime, timedelta, date
import os

# Local application imports
from .db_service import get_storage_recommendations, get_all_food_types
from .dish_ingre_service import DishIngredientService
from .hours_parser_service import parse_operating_hours
from .models import Geospatial, SecondLife, Dish
from .serializer import FoodBankListSerializer, FoodBankDetailSerializer


@api_view(['POST'])
def get_storage_advice(request):
    """
    Get food storage advice
    """
    try:
        data = request.data
        food_type = data.get('food_type')
        
        if not food_type:
            return Response({'error': 'Food type is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        recommendation = get_storage_recommendations(food_type)
        
        if not recommendation:
            return Response({'error': f'No storage recommendation found for {food_type}'}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        return Response(recommendation)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_food_types(request):
    """
    Get all food types
    """
    try:
        food_types = get_all_food_types()
        return Response({'food_types': food_types})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def generate_calendar(request):
    """
    Generate calendar
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


@api_view(['GET'])
def get_foodbanks(request):
    """
    Get foodbanks with parsed operating hours
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

@api_view(['GET'])
def get_second_life_items(request):
    """
    Get all second life items or filter by search query
    """
    search_query = request.GET.get('search', '')
    
    if search_query:
        items = SecondLife.objects.filter(items__icontains=search_query)
    else:
        items = SecondLife.objects.all()
    
    data = []
    for item in items:
        data.append({
            'id': item.id,
            'items': item.items,
            'type': item.type,
            'method': item.method,
            'label': item.label,
            'description': item.description,
            'picture': item.picture,
            'inside_picture': item.inside_picture
        })
    
    return Response(data)

@api_view(['GET'])
def get_second_life_item_detail(request, item_id):
    """
    Get details for a specific second life item
    """
    try:
        item = SecondLife.objects.get(id=item_id)
        data = {
            'id': item.id,
            'items': item.items,
            'type': item.type,
            'method': item.method,
            'label': item.label,
            'description': item.description,
            'picture': item.picture,
            'inside_picture': item.inside_picture
        }
        return Response(data)
    except SecondLife.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    

# Initialize service
dish_service = DishIngredientService()

@csrf_exempt
@api_view(['POST'])
def search_dishes(request):
    """
    API endpoint to generate grocery lists based on selected meals
    """
    try:
        data = request.data
        selected_meals = data.get('selected_meals', [])
        
        if not selected_meals:
            return Response({'success': False, 'error': 'No meals selected'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Use the new function to handle ingredient combining
        from .ingredient_combiner_service import combine_dish_ingredients
        
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

    ingredient = ingredient.lower()
    pantry_keywords = ['salt', 'pepper', 'sugar', 'flour', 'oil', 'vinegar', 'spice', 'herb', 'seasoning', 
                     'stock', 'pasta', 'rice', 'grain', 'canned', 'dried', 'baking', 'sauce']
    
    return any(keyword in ingredient for keyword in pantry_keywords)

@csrf_exempt
@api_view(['POST'])
def get_dish_ingredients(request):

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
    Get dishes, optionally filtered by cuisine
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

@api_view(['POST'])
def login(request):
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