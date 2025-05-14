from ..models import FoodStorage
from django.db import connection

def get_storage_recommendations(food_type):
    """
    Get food storage recommendations from database using raw SQL
    """
    print(f"\n=== Storage Recommendation Request ===")
    print(f"Requesting storage advice for: {food_type}")
    
    try:
        # Use raw SQL query directly
        with connection.cursor() as cursor:
            query = "SELECT Type, pantry, fridge, method FROM food_storage WHERE LOWER(Type) = LOWER(%s)"
            print(f"Executing SQL query: {query} with parameter: {food_type}")
            
            cursor.execute(query, [food_type])
            row = cursor.fetchone()
            
            if row:
                print(f"Found storage data: Type={row[0]}, pantry={row[1]}, fridge={row[2]}, method={row[3]}")
                return {
                    'Type': row[0],
                    'pantry': row[1],
                    'fridge': row[2],
                    'method': row[3]
                }
            
            print(f"No storage data found for {food_type}, using default values")
            # If no match found, return default values
            return {
                'Type': food_type,
                'pantry': 14,  # Default pantry time
                'fridge': 7,   # Default fridge time
                'method': 1    # Default to fridge
            }
    except Exception as e:
        print(f"=== Error in Storage Recommendation ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Returning default values")
        # Return default values on error
        return {
            'Type': food_type,
            'pantry': 14,  # Default pantry time
            'fridge': 7,   # Default fridge time
            'method': 1    # Default to fridge
        }

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