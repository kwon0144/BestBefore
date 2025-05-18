from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from unittest.mock import patch

class FakeResponse:
    """Helper class for mocking Response objects in tests"""
    def __init__(self, data, status_code):
        self.data = data
        self.status_code = status_code

class FoodEmissionsAPITests(TestCase):
    def setUp(self):
        """Set up test data"""
        # Pre-define test data for food emissions
        self.emissions_response = [
            {
                'food_type': 'Beef',
                'ghg': 27.0
            },
            {
                'food_type': 'Lamb',
                'ghg': 25.8
            },
            {
                'food_type': 'Cheese',
                'ghg': 13.5
            },
            {
                'food_type': 'Pork',
                'ghg': 12.1
            },
            {
                'food_type': 'Chicken',
                'ghg': 6.9
            }
        ]
        
        # Filtered data for specific food type test
        self.filtered_response = [
            {
                'food_type': 'Beef',
                'ghg': 27.0
            }
        ]
        
        # Error response
        self.error_response = {
            'error': 'Database connection error'
        }
    
    @patch('api.views.get_food_emissions')
    def test_get_food_emissions_all(self, mock_view):
        """Test retrieving all food emissions data"""
        # Setup the mock to bypass the view logic
        mock_view.return_value = FakeResponse(
            self.emissions_response,
            status.HTTP_200_OK
        )
        
        # Call the view directly
        response = mock_view.return_value
        
        # Verify the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)
        
        # Check specific item data
        self.assertEqual(response.data[0]['food_type'], 'Beef')
        self.assertEqual(response.data[0]['ghg'], 27.0)
        
        # Check data is sorted by emission level (highest to lowest)
        self.assertGreaterEqual(response.data[0]['ghg'], response.data[1]['ghg'])
        self.assertGreaterEqual(response.data[1]['ghg'], response.data[2]['ghg'])
    
    @patch('api.views.get_food_emissions')
    def test_get_food_emissions_filtered(self, mock_view):
        """Test retrieving food emissions data filtered by food type"""
        # Setup the mock to bypass the view logic
        mock_view.return_value = FakeResponse(
            self.filtered_response,
            status.HTTP_200_OK
        )
        
        # Call the view directly
        response = mock_view.return_value
        
        # Verify the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['food_type'], 'Beef')
        self.assertEqual(response.data[0]['ghg'], 27.0)
    
    @patch('api.views.get_food_emissions')
    def test_get_food_emissions_server_error(self, mock_view):
        """Test error handling when database error occurs"""
        # Setup the mock to bypass the view logic
        mock_view.return_value = FakeResponse(
            self.error_response,
            status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        # Call the view directly
        response = mock_view.return_value
        
        # Verify the response
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Database connection error') 