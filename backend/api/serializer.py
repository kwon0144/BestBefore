from rest_framework import serializers
from .models import Geospatial, FoodIngredient, GlobalFoodWastageDataset

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


class GlobalFoodWastageSerializer(serializers.ModelSerializer):
    """
    Serializer for the GlobalFoodWastageDataset model.
    """
    class Meta:
        model = GlobalFoodWastageDataset
        fields = '__all__'

class CountryWastageSerializer(serializers.ModelSerializer):
    """
    Serializer for country-focused food wastage data.
    """
    total_economic_loss = serializers.FloatField(read_only=True)
    
    class Meta:
        model = GlobalFoodWastageDataset
        fields = ('country', 'year', 'total_waste_tons', 
                  'economic_loss_millions', 'avg_waste_per_capita', 
                  'population_millions', 'household_waste_percentage',
                  'total_economic_loss')

class FoodCategoryWastageSerializer(serializers.ModelSerializer):
    """
    Serializer for food category-focused wastage data.
    """
    percentage_of_total = serializers.FloatField(read_only=True)
    
    class Meta:
        model = GlobalFoodWastageDataset
        fields = ('food_category', 'total_waste_tons', 
                  'economic_loss_millions', 'percentage_of_total')

class EconomicImpactSerializer(serializers.ModelSerializer):
    """
    Serializer focused on economic impact data.
    """
    cost_per_ton = serializers.SerializerMethodField()
    
    class Meta:
        model = GlobalFoodWastageDataset
        fields = ('country', 'year', 'food_category', 'total_waste_tons',
                  'economic_loss_millions', 'cost_per_ton')
    
    def get_cost_per_ton(self, obj):
        """Calculate the cost per ton of food waste"""
        if obj.total_waste_tons > 0:
            # Convert millions to absolute value and divide by tons
            return (obj.economic_loss_millions * 1000000) / obj.total_waste_tons
        return 0