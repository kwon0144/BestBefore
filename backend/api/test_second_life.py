from django.test import SimpleTestCase, Client
from django.urls import reverse
from rest_framework import status
from unittest.mock import patch, MagicMock
from .models import SecondLife
import json

class SecondLifeAPITests(SimpleTestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create mock objects instead of dictionaries
        self.mock_item1 = MagicMock()
        self.mock_item1.method_id = 1
        self.mock_item1.method_name = "Test Method 1"
        self.mock_item1.is_combo = "No"
        self.mock_item1.method_category = "craft"
        self.mock_item1.ingredient = "apple"
        self.mock_item1.description = "Test description 1"
        self.mock_item1.picture = "test1.jpg"

        self.mock_item2 = MagicMock()
        self.mock_item2.method_id = 2
        self.mock_item2.method_name = "Test Method 2"
        self.mock_item2.is_combo = "Yes"
        self.mock_item2.method_category = "food"
        self.mock_item2.ingredient = "banana"
        self.mock_item2.description = "Test description 2"
        self.mock_item2.picture = "test2.jpg"

        self.mock_items = [self.mock_item1, self.mock_item2]

    @patch('api.views.SecondLife.objects.all')
    def test_get_all_second_life_items(self, mock_all):
        """Test getting all second life items"""
        mock_all.return_value = self.mock_items
        url = reverse('get_second_life_items')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['method_id'], 1)
        self.assertEqual(response.data[0]['method_name'], "Test Method 1")

    @patch('api.views.SecondLife.objects.filter')
    def test_search_second_life_items(self, mock_filter):
        """Test searching second life items"""
        mock_filter.return_value = [self.mock_item1]
        url = reverse('get_second_life_items')
        response = self.client.get(url, {'search': 'apple'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['ingredient'], "apple")

    @patch('api.views.SecondLife.objects.get')
    def test_get_second_life_item_detail(self, mock_get):
        """Test getting a specific second life item detail"""
        mock_get.return_value = self.mock_item1
        url = reverse('get_second_life_item_detail', args=[1])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['method_id'], 1)
        self.assertEqual(response.data['method_name'], "Test Method 1")
        self.assertEqual(response.data['ingredient'], "apple")

    @patch('api.views.SecondLife.objects.get')
    def test_get_nonexistent_second_life_item(self, mock_get):
        """Test getting a non-existent second life item"""
        mock_get.side_effect = SecondLife.DoesNotExist()
        url = reverse('get_second_life_item_detail', args=[999])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Item not found') 