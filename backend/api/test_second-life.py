from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from .models import SecondLife
import json

class SecondLifeAPITests(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test items
        SecondLife.objects.create(
            method_id=1,
            method_name="Test Method 1",
            is_combo="No",
            method_category="craft",
            ingredient="apple",
            description="Test description 1",
            picture="test1.jpg"
        )
        
        SecondLife.objects.create(
            method_id=2,
            method_name="Test Method 2",
            is_combo="Yes",
            method_category="food",
            ingredient="banana",
            description="Test description 2",
            picture="test2.jpg"
        )

    def test_get_all_second_life_items(self):
        """Test getting all second life items"""
        url = reverse('get_second_life_items')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Check first item
        first_item = response.data[0]
        self.assertEqual(first_item['method_id'], 1)
        self.assertEqual(first_item['method_name'], "Test Method 1")
        self.assertEqual(first_item['ingredient'], "apple")
        
        # Check second item
        second_item = response.data[1]
        self.assertEqual(second_item['method_id'], 2)
        self.assertEqual(second_item['method_name'], "Test Method 2")
        self.assertEqual(second_item['ingredient'], "banana")

    def test_search_second_life_items(self):
        """Test searching second life items"""
        url = reverse('get_second_life_items')
        response = self.client.get(url, {'search': 'apple'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['ingredient'], "apple")

    def test_get_second_life_item_detail(self):
        """Test getting a specific second life item detail"""
        url = reverse('get_second_life_item_detail', args=[1])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['method_id'], 1)
        self.assertEqual(response.data['method_name'], "Test Method 1")
        self.assertEqual(response.data['ingredient'], "apple")

    def test_get_nonexistent_second_life_item(self):
        """Test getting a non-existent second life item"""
        url = reverse('get_second_life_item_detail', args=[999])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Item not found')
