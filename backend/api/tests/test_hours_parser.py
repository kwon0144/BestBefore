from django.test import TestCase
from backend.api.hours_parser_service import parse_operating_hours

class HoursParserTestCase(TestCase):
    def test_parse_24_hours(self):
        result = parse_operating_hours('24 hours')
        
        self.assertTrue(result['is_24_hours'])
        # Check that all days are open 24 hours
        for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
            self.assertTrue(result['daily_schedule'][day]['is_open'])
            self.assertEqual(result['daily_schedule'][day]['hours'], '00:00-24:00')
    
    def test_parse_weekday_hours(self):
        result = parse_operating_hours('09:00-17:00 in weekdays, close in weekends')
        
        # Check weekdays are open
        for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']:
            self.assertTrue(result['daily_schedule'][day]['is_open'])
            self.assertEqual(result['daily_schedule'][day]['hours'], '09:00-17:00')
        
        # Check weekends are closed
        for day in ['saturday', 'sunday']:
            self.assertFalse(result['daily_schedule'][day]['is_open'])
    
    def test_parse_daily_except_one_day(self):
        result = parse_operating_hours('08:30-16:30 daily beside monday')
        
        # Check all days except Monday are open
        for day in ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
            self.assertTrue(result['daily_schedule'][day]['is_open'])
            self.assertEqual(result['daily_schedule'][day]['hours'], '08:30-16:30')
        
        # Check Monday is closed
        self.assertFalse(result['daily_schedule']['monday']['is_open'])