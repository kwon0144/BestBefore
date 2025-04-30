from django.test import TestCase
from api.views import categorize_ingredient, is_pantry_item

class UtilsTestCase(TestCase):
    def test_categorize_ingredient(self):
        # Test various ingredients get categorized correctly
        test_cases = [
            ('chicken breast', 'Meat'),
            ('ground beef', 'Meat'),
            ('salmon fillet', 'Fish'),
            ('canned tuna', 'Fish'),
            ('tomatoes', 'Produce'),
            ('lettuce', 'Produce'),
            ('cheddar cheese', 'Dairy'),
            ('milk', 'Dairy'),
            ('white rice', 'Grains'),
            ('pasta', 'Grains'),
            ('olive oil', 'Condiments'),
            ('soy sauce', 'Condiments'),
            ('something unknown', 'Other'),
        ]
        
        for ingredient, expected_category in test_cases:
            result = categorize_ingredient(ingredient)
            self.assertEqual(result, expected_category, f"Failed for {ingredient}")
    
    def test_is_pantry_item(self):
        # Test pantry item detection
        pantry_items = ['salt', 'black pepper', 'olive oil', 'rice', 
                      'pasta', 'canned tomatoes', 'flour', 'sugar']
        
        fresh_items = ['chicken', 'fresh tomatoes', 'lettuce', 
                     'milk', 'cheese', 'eggs', 'salmon']
        
        for item in pantry_items:
            self.assertTrue(is_pantry_item(item), f"{item} should be a pantry item")
        
        for item in fresh_items:
            self.assertFalse(is_pantry_item(item), f"{item} should not be a pantry item")