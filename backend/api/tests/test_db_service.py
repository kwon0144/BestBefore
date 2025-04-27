from django.test import TestCase
from unittest.mock import patch, MagicMock
from api.db_service import get_storage_recommendations, get_all_food_types

class DBServiceTestCase(TestCase):
    @patch('api.models.FoodStorage.objects.filter')
    def test_get_storage_recommendations_success(self, mock_filter):
        # Setup mock return value for the Django ORM
        mock_food_item = MagicMock()
        mock_food_item.type = 'apple'
        mock_food_item.storage_time = 14
        mock_food_item.method = 1
        mock_filter.return_value.first.return_value = mock_food_item
        
        # Call the function
        result = get_storage_recommendations('apple')
        
        # Assertions
        self.assertEqual(result['type'], 'apple')
        self.assertEqual(result['storage_time'], 14)
        self.assertEqual(result['method'], 1)
        mock_filter.assert_called_once()
    
    @patch('api.models.FoodStorage.objects.filter')
    def test_get_storage_recommendations_not_found(self, mock_filter):
        # Setup mock to return None
        mock_filter.return_value.first.return_value = None
        
        # Mock the cursor for raw SQL query
        with patch('django.db.connection.cursor') as mock_cursor:
            mock_cursor.return_value.__enter__.return_value.fetchone.return_value = None
            
            # Call the function
            result = get_storage_recommendations('nonexistent_food')
            
            # Assertions
            self.assertIsNone(result)
    
    @patch('api.models.FoodStorage.objects.values_list')
    def test_get_all_food_types_success(self, mock_values_list):
        # Setup mock return value
        mock_values_list.return_value.distinct.return_value = ['apple', 'banana', 'orange']
        
        # Call the function
        result = get_all_food_types()
        
        # Assertions
        self.assertEqual(result, ['apple', 'banana', 'orange'])
        mock_values_list.assert_called_once_with('type', flat=True)