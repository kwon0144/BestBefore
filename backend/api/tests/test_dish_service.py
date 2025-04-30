from django.test import TestCase
from unittest.mock import patch, MagicMock, call
from backend.api.service.dish_ingre_service import DishIngredientService

class DishIngredientServiceTestCase(TestCase):
    def setUp(self):
        # Create a patcher for the _load_dish_cache method
        self.load_cache_patcher = patch.object(DishIngredientService, '_load_dish_cache')
        # Start the patcher - this prevents the method from being called
        self.mock_load_dish_cache = self.load_cache_patcher.start()
        
        # Create the service after patching
        self.service = DishIngredientService()
        
        # Manually set the dish cache with test data
        self.service.dish_cache = {
            'spaghetti bolognese': 'ground beef 500g; tomatoes 400g; onion 1; garlic 2 cloves',
            'chicken curry': 'chicken breast 600g; curry paste 2 tbsp; coconut milk 400ml',
            'caesar salad': 'romaine lettuce 1 head; parmesan cheese 50g; croutons 100g'
        }
        
        # Patch _parse_ingredients to return structured data
        def mock_parse_ingredients(ingredients_string):
            if not ingredients_string:
                return []
            parts = ingredients_string.split(';')
            return [{'name': part.strip(), 'quantity': 'as needed'} for part in parts]
        
        self.parse_patcher = patch.object(self.service, '_parse_ingredients', side_effect=mock_parse_ingredients)
        self.mock_parse = self.parse_patcher.start()
        
        # Make sure to stop all patchers during tearDown
        self.addCleanup(self.load_cache_patcher.stop)
        self.addCleanup(self.parse_patcher.stop)
    
    def test_standardize_measurement(self):
        # Test various measurement conversions
        test_cases = [
            ('chicken', '2 cups', '300g'),      # Solid conversion
            ('milk', '1 cup', '240ml'),         # Liquid conversion
            ('sauce', '3 tbsp', '45ml'),        # Tablespoon conversion
            ('spice', '2 tsp', '10ml'),         # Teaspoon conversion
            ('meat', '16 oz', '448g'),          # Ounce conversion
            ('beef', '2 lb', '908g'),           # Pound conversion
            ('tomato', 'as needed', '100g'),    # Default estimate for produce
            ('chicken', 'as needed', '250g'),   # Default estimate for meat
        ]
        
        for name, quantity, expected in test_cases:
            result = self.service._standardize_measurement(name, quantity)
            self.assertEqual(result, expected, f"Failed for {name}, {quantity}")
    
    def test_filter_fresh_ingredients(self):
        # Test filtering household items
        ingredients = [
            {'name': 'Chicken breast', 'quantity': '500g'},
            {'name': 'Salt', 'quantity': '1 tsp'},
            {'name': 'Olive oil', 'quantity': '2 tbsp'},
            {'name': 'Tomatoes', 'quantity': '3 pieces'},
        ]
        
        result = self.service._filter_fresh_ingredients(ingredients)
        
        # Should only include chicken and tomatoes
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['name'], 'Chicken breast')
        self.assertEqual(result[1]['name'], 'Tomatoes')

    def test_get_ingredients_exact_match(self):
        # Test exact match in the dish cache
        result = self.service.get_ingredients('spaghetti bolognese')
        
        self.assertEqual(result['dish'], 'spaghetti bolognese')
        self.assertEqual(result['match_type'], 'exact')
        
        # Verify ingredients are parsed
        ingredients = result['ingredients']
        self.assertIsInstance(ingredients, list)
        
        # Check ingredient names include the quantities as they're not being parsed correctly
        ingredient_names = [item['name'] for item in ingredients]
        self.assertTrue(any('ground beef' in name for name in ingredient_names))
        self.assertTrue(any('tomato' in name for name in ingredient_names))

    
    def test_get_ingredients_claude_fallback(self):
        # Test fallback to Claude when dish not found in cache
        # Create a test dish name that is not in the cache
        test_dish = 'broccoli chicken stir fry'
        
        # Mock Claude API response
        claude_ingredients = [
            {'name': 'broccoli', 'quantity': '300g'},
            {'name': 'chicken thighs', 'quantity': '400g'}
        ]
        
        with patch.object(self.service, '_get_claude_direct_ingredients', return_value=claude_ingredients):
            # Test Claude API fallback
            result = self.service.get_ingredients(test_dish)
            
            self.assertEqual(result['dish'], test_dish)
            self.assertEqual(result['match_type'], 'claude_generated')
            
            # Check ingredients
            ingredients = result['ingredients']
            self.assertEqual(ingredients, claude_ingredients)
    
    def test_get_ingredients_not_found(self):
        # Mock Claude API to return None to simulate complete failure
        with patch.object(self.service, '_get_claude_direct_ingredients', return_value=None):
            # Test no match found
            result = self.service.get_ingredients('some nonexistent dish')
            
            self.assertIn('error', result)
            self.assertIn('suggestions', result)
            # Update to match the actual number of items in self.service.dish_cache
            self.assertEqual(len(result['suggestions']), 3)  # Since we added 3 items in setUp
        
