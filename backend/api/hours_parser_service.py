import re
from rest_framework import viewsets
from api.models import Geospatial
from .serializer import FoodBankDetailSerializer, FoodBankListSerializer

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