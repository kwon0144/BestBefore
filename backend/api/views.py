from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Geospatial, SecondLife
from .serializer import FoodBankListSerializer, FoodBankDetailSerializer
from rest_framework import viewsets
from .db_service import get_storage_recommendations, get_all_food_types
import json
from datetime import datetime, timedelta, date
from django.utils import timezone
import uuid
from django.db import connection
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .dish_ingre_service import DishIngredientService
from .hours_parser import parse_operating_hours

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
    


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json

# Import the DishIngredientService
from .dish_ingre_service import DishIngredientService

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
        
        # Extract meal names and quantities
        meal_names = [meal.get('name') for meal in selected_meals if meal.get('name')]
        meal_quantities = {meal.get('name'): meal.get('quantity', 1) for meal in selected_meals if meal.get('name')}
        
        if not meal_names:
            return Response({'success': False, 'error': 'Invalid meal data provided'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Process each meal to get ingredients
        groceries_by_category = {
            'Meat': [],
            'Fish': [],
            'Produce': [],
            'Dairy': [],
            'Grains': [],
            'Condiments': [],
            'Other': []
        }
        
        pantry_items = []
        found_dishes = []
        missing_dishes = []
        
        # Process each meal
        for meal_name in meal_names:
            quantity = meal_quantities.get(meal_name, 1)
            
            # Get ingredients using our hybrid matching service
            result = dish_service.get_ingredients(meal_name)
            
            if 'error' in result:
                # Dish not found
                missing_dishes.append(meal_name)
                continue
            
            # Add to found dishes
            found_dishes.append(result.get('dish', meal_name))
            
            # Process ingredients
            ingredients_data = result.get('ingredients', [])
            if not ingredients_data:
                continue
                
            # Parse ingredients - now structured as a list of objects with 'name' and 'quantity'
            for ingredient_obj in ingredients_data:
                ingredient = ingredient_obj.get('name', '').strip()
                ingredient_quantity = ingredient_obj.get('quantity', 'as needed')
                
                if not ingredient:
                    continue
                
                # Scale quantity if necessary
                if quantity > 1 and ingredient_quantity != 'as needed':
                    # Try to multiply numeric quantities
                    try:
                        qty_parts = ingredient_quantity.split()
                        if len(qty_parts) > 0 and qty_parts[0].replace('.', '', 1).isdigit():
                            amount = float(qty_parts[0]) * quantity
                            # Format with up to 2 decimal places, remove trailing zeros
                            formatted_amount = str(amount).rstrip('0').rstrip('.') if '.' in str(amount) else str(int(amount))
                            ingredient_quantity = f"{formatted_amount} {' '.join(qty_parts[1:])}"
                    except:
                        # If parsing fails, fall back to simple format
                        ingredient_quantity = f"{quantity}x {ingredient_quantity}"
                
                # Determine if it's a pantry item
                if is_pantry_item(ingredient):
                    pantry_items.append({
                        'name': ingredient,
                        'quantity': ingredient_quantity
                    })
                else:
                    # Add to appropriate category
                    category = categorize_ingredient(ingredient)
                    groceries_by_category[category].append({
                        'name': ingredient,
                        'quantity': ingredient_quantity
                    })
        
        # Filter out empty categories
        groceries_by_category = {k: v for k, v in groceries_by_category.items() if v}
        
        # Return the response
        return Response({
            'success': True,
            'dishes': found_dishes,
            'missing_dishes': missing_dishes,
            'items_by_category': groceries_by_category,
            'pantry_items': pantry_items
        })
        
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def categorize_ingredient(ingredient):
    """
    Simple categorization of ingredients
    This would be more sophisticated in a real system
    """
    ingredient = ingredient.lower()
    
    # Meat
    meat_keywords = ['beef', 'chicken', 'pork', 'turkey', 'veal', 'lamb', 'ground meat', 'steak', 'sausage']
    if any(keyword in ingredient for keyword in meat_keywords):
        return 'Meat'
    
    # Fish
    fish_keywords = ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'seafood', 'crab', 'lobster']
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
    Determine if an ingredient is typically a pantry item
    This would be more sophisticated in a real system
    """
    ingredient = ingredient.lower()
    pantry_keywords = ['salt', 'pepper', 'sugar', 'flour', 'oil', 'vinegar', 'spice', 'herb', 'seasoning', 
                     'stock', 'pasta', 'rice', 'grain', 'canned', 'dried', 'baking', 'sauce']
    
    return any(keyword in ingredient for keyword in pantry_keywords)

@csrf_exempt
@api_view(['POST'])
def get_dish_ingredients(request):
    """
    API endpoint to get ingredients for a specific dish
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

@csrf_exempt
@api_view(['POST'])
def add_dish_mapping(request):
    """
    API endpoint to add mapping between common user terms and official dish names
    """
    try:
        data = request.data
        dish_name = data.get('dish_name')
        common_terms = data.get('common_terms')
        
        if not dish_name or not common_terms:
            return Response({'error': 'Both dish_name and common_terms are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        success = dish_service.add_dish_mapping(dish_name, common_terms)
        
        if success:
            return Response({'success': True, 'message': f'Mapping added for {dish_name}'})
        else:
            return Response({'success': False, 'error': 'Failed to add mapping'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)