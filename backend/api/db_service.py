from .models import FoodStorage
from django.db import connection

def get_storage_recommendations(food_type):
    """
    Get food storage recommendations from database
    """
    try:
        # Try to get data from Django model
        food = FoodStorage.objects.filter(type__iexact=food_type).first()
        
        if food:
            return {
                'type': food.type,
                'storage_time': food.storage_time,
                'method': food.method
            }
        
        # If no data in Django model, use raw SQL query
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT type, storage_time, method FROM food_storage WHERE LOWER(type) = LOWER(%s)",
                [food_type]
            )
            row = cursor.fetchone()
            
            if row:
                return {
                    'type': row[0],
                    'storage_time': row[1],
                    'method': row[2]
                }
            
            return None
    except Exception as e:
        print(f"Error fetching storage recommendations: {str(e)}")
        return None

def get_all_food_types():
    """
    Get all food types
    """
    try:
        # Try to get data from Django model
        food_types = FoodStorage.objects.values_list('type', flat=True).distinct()
        
        if food_types:
            return list(food_types)
        
        # If no data in Django model, use raw SQL query
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT type FROM food_storage")
            rows = cursor.fetchall()
            return [row[0] for row in rows]
    except Exception as e:
        print(f"Error fetching food types: {str(e)}")
        return [] 