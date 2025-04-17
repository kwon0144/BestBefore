from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import User, Temperature, Geospatial, Game
from .serializer import UserSerializer, TemperatureSerializer, FoodBankListSerializer, FoodBankDetailSerializer
from rest_framework import viewsets
from .db_service import get_storage_recommendations, get_all_food_types
from .game_logic import start_new_game, update_game_state, end_game_session, get_top_scores, generate_food_item
import json
from datetime import datetime, timedelta, date
from django.utils import timezone
import uuid
from django.db import connection
import re
import random
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_temperature_data(request):
    try:
        # Get all temperature records
        temperatures = Temperature.objects.all()
        # You can add filtering here if needed, for example:
        # temperatures = Temperature.objects.filter(timestamp__gte='2024-01-01')
        
        # Serialize the data
        serializer = TemperatureSerializer(temperatures, many=True)
        
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

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

class FoodBankViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Geospatial.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FoodBankDetailSerializer
        return FoodBankListSerializer


def parse_operating_hours(hours_text):
    """
    Parse operating hours text into structured data with frontend-ready daily schedules
    """
    if not hours_text or not isinstance(hours_text, str):
        return {
            'is_24_hours': False,
            'days': [],
            'hours': None,
            'raw_text': str(hours_text) if hours_text else "",
            'daily_schedule': {
                'monday': {'is_open': False, 'hours': None},
                'tuesday': {'is_open': False, 'hours': None},
                'wednesday': {'is_open': False, 'hours': None},
                'thursday': {'is_open': False, 'hours': None},
                'friday': {'is_open': False, 'hours': None},
                'saturday': {'is_open': False, 'hours': None},
                'sunday': {'is_open': False, 'hours': None}
            }
        }
        
    weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    weekend = ['saturday', 'sunday']
    all_days = weekdays + weekend
    
    # Initialize daily schedule with all days closed
    daily_schedule = {
        day: {'is_open': False, 'hours': None} for day in all_days
    }
    
    # Initialize result
    result = {
        'is_24_hours': '24 hours' in hours_text.lower(),
        'days': [],
        'hours': None,
        'raw_text': hours_text,
        'daily_schedule': daily_schedule
    }
    
    # If it's 24 hours, set all days to open
    if result['is_24_hours'] or hours_text.strip().lower() == '24 hours':
        result['is_24_hours'] = True
        result['days'] = [day.capitalize() for day in all_days]
        result['hours'] = '00:00-24:00'
        
        for day in all_days:
            result['daily_schedule'][day] = {
                'is_open': True,
                'hours': '00:00-24:00'
            }
            
        return result
    
    try:
        hours_text = hours_text.lower().strip()
        extracted_hours = None
        
        # Extract time pattern if available
        time_match = re.search(r'(\d{1,2}[:\.]\d{2})-(\d{1,2}[:\.]\d{2})', hours_text)
        if time_match:
            extracted_hours = time_match.group(0)
            # Standardize time format (replace dots with colons)
            if '.' in extracted_hours:
                extracted_hours = extracted_hours.replace('.', ':')
        
        # Case 1: Weekday hours, closed on weekends
        if ('weekday' in hours_text or 'weekdays' in hours_text) and ('close in weekend' in hours_text or 'closed in weekend' in hours_text):
            result['days'] = [day.capitalize() for day in weekdays]
            result['hours'] = extracted_hours
            
            for day in weekdays:
                result['daily_schedule'][day] = {
                    'is_open': True,
                    'hours': extracted_hours
                }
                
        # Case 2: Daily hours except certain days
        elif 'daily beside' in hours_text:
            excluded_days = []
            
            # Find excluded days
            after_beside = hours_text.split('daily beside')[1].strip()
            day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            
            for day in day_names:
                if day in after_beside:
                    excluded_days.append(day)
            
            # If no explicit excluded days were found, try to extract the first word
            if not excluded_days:
                first_word = after_beside.split()[0].rstrip(',.:;')
                if first_word in day_names:
                    excluded_days.append(first_word)
            
            # Add all days except the excluded ones
            for day in all_days:
                if day not in excluded_days:
                    result['days'].append(day.capitalize())
                    result['daily_schedule'][day] = {
                        'is_open': True,
                        'hours': extracted_hours
                    }
            
            result['hours'] = extracted_hours
            
        # Case 3: Daily operations
        elif 'daily' in hours_text:
            result['days'] = [day.capitalize() for day in all_days]
            result['hours'] = extracted_hours
            
            for day in all_days:
                result['daily_schedule'][day] = {
                    'is_open': True,
                    'hours': extracted_hours
                }
                
        # Case 4: Specific days mentioned
        else:
            # Check for each day mentioned
            for day in all_days:
                if day in hours_text:
                    result['days'].append(day.capitalize())
                    result['daily_schedule'][day] = {
                        'is_open': True,
                        'hours': extracted_hours
                    }
            
            result['hours'] = extracted_hours
    
    except Exception as e:
        print(f"Error parsing hours: {e}")
    
    # Format all days for consistent capitalization
    result['days'] = [day.capitalize() for day in result['days']]
    
    return result

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
    game_id = request.data.get('game_id')
    action = request.data.get('action')
    food_type = request.data.get('food_type')
    
    if not all([game_id, action, food_type]):
        return Response({'error': 'Missing required parameters'}, status=400)
    
    try:
        game_data = update_game_state(game_id, action, food_type)
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
    Get a list of food items for the game.
    """
    try:
        # Generate 5 random food items
        food_items = [generate_food_item() for _ in range(5)]
        return Response({'food_items': food_items})
    except Exception as e:
        return Response({'error': str(e)}, status=500)