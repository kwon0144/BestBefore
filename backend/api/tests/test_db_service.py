from django.test import TestCase
from unittest.mock import patch, MagicMock
from api.service.db_service import get_storage_recommendations, get_all_food_types

class DBServiceTestCase(TestCase):
    def test_get_storage_recommendations_success(self):
        # Mock the cursor for raw SQL query
        with patch('django.db.connection.cursor') as mock_cursor:
            # Setup mock to return a successful result
            mock_execute = MagicMock()
            mock_cursor.return_value.__enter__.return_value.execute = mock_execute
            mock_cursor.return_value.__enter__.return_value.fetchone.return_value = ('apple', 14, 7, 1)
            
            # Call the function
            result = get_storage_recommendations('apple')
            
            # Assertions
            self.assertEqual(result['Type'], 'apple')
            self.assertEqual(result['pantry'], 14)
            self.assertEqual(result['fridge'], 7)
            self.assertEqual(result['method'], 1)
            # Verify the cursor was called with the right query
            mock_execute.assert_called_once()
    
    def test_get_storage_recommendations_not_found(self):
        # Mock the cursor for raw SQL query
        with patch('django.db.connection.cursor') as mock_cursor:
            mock_execute = MagicMock()
            mock_cursor.return_value.__enter__.return_value.execute = mock_execute
            mock_cursor.return_value.__enter__.return_value.fetchone.return_value = None
            
            # Call the function
            result = get_storage_recommendations('nonexistent_food')
            
            # Assertions - function now returns default values instead of None
            self.assertEqual(result['Type'], 'nonexistent_food')
            self.assertEqual(result['pantry'], 14)
            self.assertEqual(result['fridge'], 7)
            self.assertEqual(result['method'], 1)
    
    def test_get_all_food_types_success(self):
        # Mock the cursor for raw SQL query
        with patch('django.db.connection.cursor') as mock_cursor:
            # Mock the cursor to return food types
            mock_execute = MagicMock()
            mock_cursor.return_value.__enter__.return_value.execute = mock_execute
            mock_cursor.return_value.__enter__.return_value.fetchall.return_value = [
                ('apple',), ('banana',), ('orange',)
            ]
            
            result = get_all_food_types()
            
            # Assertions
            self.assertEqual(result, ['apple', 'banana', 'orange'])