from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import User, Temperature, Geospatial
from .serializer import UserSerializer, TemperatureSerializer, FoodBankListSerializer, FoodBankDetailSerializer
from rest_framework import viewsets
from .db_service import get_storage_recommendations, get_all_food_types
import json
from datetime import datetime, timedelta, date
from django.utils import timezone
import uuid
from django.db import connection

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

 
# Data Wrangling for operating hours
def parse_operating_hours(hours_text):
    
    if not hours_text or not isinstance(hours_text, str):
        return {
            'is_24_hours': False,
            'days': [],
            'raw_text': str(hours_text) if hours_text else ""
        }
        
    if hours_text.strip().lower() == '24 hours':
        return {
            'is_24_hours': True,
            'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'hours': '00:00-24:00',
            'raw_text': hours_text
        }
    
    weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    weekend = ['Saturday', 'Sunday']
    all_days = weekdays + weekend
    
    # Initialize result
    result = {
        'is_24_hours': '24 hours' in hours_text.lower(),
        'days': [],
        'hours': None,
        'raw_text': hours_text
    }
    
    try:
        hours_text = hours_text.lower().strip()
        
        # Case 1: Weekday hours, closed on weekends
        if 'weekdays' in hours_text and ('close in weekends' in hours_text or 'closed in weekends' in hours_text):
            time_part = hours_text.split('in weekdays')[0].strip()
            result['days'] = weekdays
            result['hours'] = time_part
        
        # Case 2: Daily hours except certain days
        elif 'daily beside' in hours_text:
            excluded_day = hours_text.split('daily beside')[1].strip().split()[0].lower()
            excluded_day = excluded_day.rstrip(',.:;')
            
            time_part = hours_text.split('daily beside')[0].strip()
            result['hours'] = time_part
            
            # Add all days except the excluded one
            for day in all_days:
                if excluded_day not in day:  # Skip the excluded day
                    result['days'].append(day)
        
        # Case 3: Daily operations
        elif 'daily' in hours_text:
            time_part = hours_text.replace('daily', '').strip()
            result['days'] = all_days
            result['hours'] = time_part
            
        # Case 4: Specific days mentioned
        else:
            # Simplification for the API response
            # Check for weekdays
            if any(day in hours_text for day in weekdays):
                for day in weekdays:
                    if day in hours_text:
                        result['days'].append(day)
            
            # Check for weekend days
            if any(day in hours_text for day in weekend):
                for day in weekend:
                    if day in hours_text:
                        result['days'].append(day)
            
            # Extract hours if possible
            if '-' in hours_text:
                # Take the first time range found
                time_parts = hours_text.split(',')
                for part in time_parts:
                    if '-' in part:
                        # Try to extract just the time part
                        time_matches = re.findall(r'(\d{1,2}[:\.]\d{2})-(\d{1,2}[:\.]\d{2})', part)
                        if time_matches:
                            result['hours'] = f"{time_matches[0][0]}-{time_matches[0][1]}"
                        else:
                            # Just take what's before the first "in" or "on"
                            for separator in [' in ', ' on ']:
                                if separator in part:
                                    result['hours'] = part.split(separator)[0].strip()
                                    break
                            else:
                                # If no separator found, just take the whole part
                                result['hours'] = part.strip()
                        break
    
    except Exception as e:
        # Log the error but return the best effort parsing
        print(f"Error parsing hours: {e}")
    
    # If we couldn't parse days, return all days for 24 hours
    if result['is_24_hours'] and not result['days']:
        result['days'] = all_days
        result['hours'] = '00:00-24:00'
    
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
                    hours_of_operation
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