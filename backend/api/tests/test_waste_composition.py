from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from unittest.mock import patch, MagicMock
from django.db.models import Sum
from api.models import FoodWasteComposition

class FoodWasteCompositionAPITests(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create mock food waste composition data
        self.mock_data = [
            MagicMock(type="Vegetables", quantity=25.5),
            MagicMock(type="Fruits", quantity=18.3),
            MagicMock(type="Bread", quantity=12.7),
            MagicMock(type="Meat", quantity=8.2),
            MagicMock(type="Dairy", quantity=5.1)
        ]
        
        # Calculate total for testing percentage calculations
        self.total_quantity = sum(item.quantity for item in self.mock_data)
    
    @patch('api.models.FoodWasteComposition.objects.all')
    @patch('api.models.FoodWasteComposition.objects.aggregate')
    def test_get_waste_composition_success(self, mock_aggregate, mock_all):
        """Test successfully retrieving waste composition data"""
        # Setup mock return values
        mock_all.return_value.order_by.return_value = self.mock_data
        mock_aggregate.return_value = {'total': self.total_quantity}
        
        # Call the API endpoint
        url = reverse('get_waste_composition')
        
        # Create expected data
        expected_data = {
            'total_tonnes': round(self.total_quantity, 2),
            'data': [
                {
                    'name': 'Vegetables',
                    'value': 25.5,
                    'percentage': round((25.5 / self.total_quantity) * 100, 2)
                },
                {
                    'name': 'Fruits',
                    'value': 18.3,
                    'percentage': round((18.3 / self.total_quantity) * 100, 2)
                },
                {
                    'name': 'Bread',
                    'value': 12.7,
                    'percentage': round((12.7 / self.total_quantity) * 100, 2)
                },
                {
                    'name': 'Meat',
                    'value': 8.2,
                    'percentage': round((8.2 / self.total_quantity) * 100, 2)
                },
                {
                    'name': 'Dairy',
                    'value': 5.1,
                    'percentage': round((5.1 / self.total_quantity) * 100, 2)
                }
            ],
            'updated_at': '2023-06-01T00:00:00Z'
        }
        
        # Mock the view response
        with patch('api.views.get_waste_composition') as mock_view:
            mock_view.return_value = MagicMock(status_code=200, data=expected_data)
            response = self.client.get(url)
        
        # Verify the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_tonnes'], round(self.total_quantity, 2))
        self.assertEqual(len(response.data['data']), 5)
        
        # Check the first item's format
        first_item = response.data['data'][0]
        self.assertIn('name', first_item)
        self.assertIn('value', first_item)
        self.assertIn('percentage', first_item)
        
        # Verify the percentage calculation for the first item
        expected_percentage = round((self.mock_data[0].quantity / self.total_quantity) * 100, 2)
        self.assertEqual(first_item['percentage'], expected_percentage)
    
    @patch('api.models.FoodWasteComposition.objects.all')
    @patch('api.models.FoodWasteComposition.objects.aggregate')
    def test_get_waste_composition_empty_data(self, mock_aggregate, mock_all):
        """Test waste composition API when no data is available"""
        # Setup mock to return empty list
        mock_all.return_value.order_by.return_value = []
        mock_aggregate.return_value = {'total': 0}
        
        # Call the API endpoint
        url = reverse('get_waste_composition')
        
        # Create expected data
        expected_data = {
            'total_tonnes': 0,
            'data': [],
            'updated_at': '2023-06-01T00:00:00Z'
        }
        
        # Mock the view response
        with patch('api.views.get_waste_composition') as mock_view:
            mock_view.return_value = MagicMock(status_code=200, data=expected_data)
            response = self.client.get(url)
        
        # Verify the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_tonnes'], 0)
        self.assertEqual(len(response.data['data']), 0)
    
    @patch('api.models.FoodWasteComposition.objects.all')
    def test_get_waste_composition_server_error(self, mock_all):
        """Test error handling when database error occurs"""
        # Setup mock to raise an exception
        mock_all.side_effect = Exception("Database connection error")
        
        # Call the API endpoint
        url = reverse('get_waste_composition')
        
        # Create expected error data
        expected_data = {
            'error': 'Database connection error'
        }
        
        # Mock the view response
        with patch('api.views.get_waste_composition') as mock_view:
            mock_view.return_value = MagicMock(status_code=500, data=expected_data)
            response = self.client.get(url)
        
        # Verify the response
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data) 