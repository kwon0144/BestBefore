from rest_framework import serializers
from .models import Geospatial, FoodIngredient

class FoodBankListSerializer(serializers.ModelSerializer):
    key = serializers.SerializerMethodField()
    
    class Meta:
        model = Geospatial
        fields = ['key', 'name', 'latitude', 'longitude', 'type']
    
    def get_key(self, obj):
        return str(obj.id)

class FoodBankDetailSerializer(serializers.ModelSerializer):
    key = serializers.SerializerMethodField()
    opening_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = Geospatial
        fields = ['key', 'name', 'latitude', 'longitude', 'type', 'address', 'opening_hours']
    
    def get_key(self, obj):
        return str(obj.id)
    
    def get_opening_hours(self, obj):
        """Format hours of operation into a structured format for the frontend"""
        try:
            # Basic formatting - you can enhance this based on your data structure
            hours_text = obj.hours_of_operation
            
            # Sample parsing logic - adjust based on your actual data format
            days = {
                'Monday': '',
                'Tuesday': '',
                'Wednesday': '',
                'Thursday': '',
                'Friday': '',
                'Saturday': '',
                'Sunday': ''
            }
            
            # This is a simple example 
            if '09:00-17:00 daily' in hours_text:
                for day in days:
                    days[day] = '09:00 AM - 5:00 PM'
            elif 'weekdays' in hours_text and 'close in weekends' in hours_text:
                for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']:
                    if '09:30-15:00' in hours_text:
                        days[day] = '09:30 AM - 3:00 PM'
                    elif '08:30-16:30' in hours_text:
                        days[day] = '08:30 AM - 4:30 PM'
                    else:
                        # Extract time from the format like "08:00-16:00 in weekdays"
                        import re
                        match = re.search(r'(\d{2}:\d{2})-(\d{2}:\d{2})', hours_text)
                        if match:
                            start, end = match.groups()
                            days[day] = f"{start} AM - {end} PM"
                        else:
                            days[day] = 'Closed'
                
                for day in ['Saturday', 'Sunday']:
                    days[day] = 'Closed'
            elif '24 hours' in hours_text:
                for day in days:
                    days[day] = 'Open 24 hours'
                    
            return days
        except Exception as e:
            # Fallback for any parsing errors
            return {'error': str(e), 'raw_hours': obj.hours_of_operation}


class FoodIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodIngredient
        fields = ['id', 'dish', 'ingredient']