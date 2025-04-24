from django.db import connection
import re
import json
import requests
from django.conf import settings
import os
from collections import Counter

class DishIngredientService:
    """
    A service class that first checks for exact dish matches in the database,
    then falls back to Claude API for direct ingredient generation.
    
    Focused on fresh ingredients with standardized measurements.
    """
    
    def __init__(self):
        self.claude_api_key = settings.CLAUDE_API_KEY or os.environ.get('CLAUDE_API_KEY')
        self.claude_api_url = "https://api.anthropic.com/v1/messages"
        self.dish_cache = {}  # Cache for dish-ingredient mappings
        self._load_dish_cache()
        
        # Ensure the dish_mappings table exists
        self._ensure_dish_mappings_table()
        
        # Common household items to exclude from results
        self.household_items = {
            'salt', 'pepper', 'olive oil', 'vegetable oil', 'canola oil', 'cooking oil',
            'sugar', 'flour', 'baking powder', 'baking soda', 'vanilla extract',
            'soy sauce', 'vinegar', 'oil', 'black pepper', 'white pepper', 'oregano',
            'basil', 'thyme', 'rosemary', 'paprika', 'cumin', 'cinnamon', 'nutmeg',
            'mayonnaise', 'ketchup', 'mustard', 'hot sauce', 'butter', 'margarine',
            'dried herbs', 'spices', 'seasoning'
        }
    
    def _load_dish_cache(self):
        """Load dish-ingredient mappings from database into cache"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT dish_name, ingredients FROM food_ingredients")
                rows = cursor.fetchall()
                
                for row in rows:
                    dish_name = row[0]
                    ingredients = row[1]
                    self.dish_cache[dish_name.lower()] = ingredients
                    
                print(f"Loaded {len(self.dish_cache)} dishes into cache")
        except Exception as e:
            print(f"Error loading dish cache: {str(e)}")
    
    def _ensure_dish_mappings_table(self):
        """Create the dish_mappings table if it doesn't exist"""
        try:
            with connection.cursor() as cursor:
                # Check which database engine is being used
                db_engine = connection.vendor
                
                if db_engine == 'sqlite':
                    # SQLite syntax
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS dish_mappings (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_term VARCHAR(255) NOT NULL UNIQUE,
                            dish_name VARCHAR(255) NOT NULL
                        )
                    """)
                else:
                    # MySQL/PostgreSQL syntax
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS dish_mappings (
                            id SERIAL PRIMARY KEY,
                            user_term VARCHAR(255) NOT NULL UNIQUE,
                            dish_name VARCHAR(255) NOT NULL
                        )
                    """)
                print("Ensured dish_mappings table exists")
        except Exception as e:
            print(f"Error ensuring dish_mappings table: {str(e)}")
    
    def get_ingredients(self, user_dish_input):
        """
        Two-step approach to find ingredients for a dish:
        1. Try exact match in database
        2. Fall back to Claude API for direct response
        """
        user_input = user_dish_input.lower().strip()
        
        # Step 1: Exact match
        if user_input in self.dish_cache:
            ingredients_data = self.dish_cache[user_input]
            parsed_ingredients = self._parse_ingredients(ingredients_data)
            filtered_ingredients = self._filter_fresh_ingredients(parsed_ingredients)
            return {
                'dish': user_input,
                'ingredients': filtered_ingredients,
                'match_type': 'exact'
            }
        
        # Step 2: Check for any direct mappings from the dish_mappings table
        mapped_dish = self._get_mapped_dish(user_input)
        if mapped_dish and mapped_dish.lower() in self.dish_cache:
            ingredients_data = self.dish_cache[mapped_dish.lower()]
            parsed_ingredients = self._parse_ingredients(ingredients_data)
            filtered_ingredients = self._filter_fresh_ingredients(parsed_ingredients)
            return {
                'dish': mapped_dish,
                'ingredients': filtered_ingredients,
                'match_type': 'mapped'
            }
        
        # Step 3: Direct Claude API response with improved guidelines
        claude_ingredients = self._get_claude_direct_ingredients(user_input)
        if claude_ingredients:
            return {
                'dish': user_dish_input,
                'ingredients': claude_ingredients,  # Already filtered in the Claude prompt
                'match_type': 'claude_generated',
                'note': 'Fresh ingredients generated by Claude AI'
            }
        
        # No match found
        return {
            'error': 'No matching dish found',
            'suggestions': self._get_popular_dishes(5)  # Return 5 popular dishes as suggestions
        }
    
    def _filter_fresh_ingredients(self, ingredients_list):
        """Filter out common household items and standardize measurements"""
        fresh_ingredients = []
        
        for ingredient in ingredients_list:
            name = ingredient['name'].lower()
            quantity = ingredient['quantity']
            
            # Skip common household items
            if any(item in name for item in self.household_items):
                continue
                
            # Try to standardize the measurement
            standardized_quantity = self._standardize_measurement(name, quantity)
            
            fresh_ingredients.append({
                'name': ingredient['name'],
                'quantity': standardized_quantity
            })
            
        return fresh_ingredients
        
    def _standardize_measurement(self, name, quantity):
        """Convert common measurements to grams, liters, or count"""
        if quantity == 'as needed':
            # Try to estimate a standard quantity
            if any(word in name for word in ['meat', 'chicken', 'beef', 'pork', 'steak']):
                return '250g'
            elif any(word in name for word in ['fish', 'salmon', 'tuna']):
                return '200g'
            elif any(word in name for word in ['vegetable', 'carrot', 'potato', 'tomato']):
                return '100g'
            else:
                return quantity
        
        # Try to convert cup, tbsp, tsp to metric
        cup_match = re.search(r'(\d+(?:\.\d+)?)\s*cups?', quantity)
        if cup_match:
            amount = float(cup_match.group(1))
            # Rough conversion: 1 cup ≈ 240ml for liquids, ≈ 150g for solids
            if any(word in name for word in ['milk', 'water', 'juice', 'broth', 'stock']):
                return f'{int(amount * 240)}ml'
            else:
                return f'{int(amount * 150)}g'
                
        tbsp_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:tbsp|tablespoons?)', quantity)
        if tbsp_match:
            amount = float(tbsp_match.group(1))
            # 1 tbsp ≈ 15ml
            return f'{int(amount * 15)}ml'
            
        tsp_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:tsp|teaspoons?)', quantity)
        if tsp_match:
            amount = float(tsp_match.group(1))
            # 1 tsp ≈ 5ml
            return f'{int(amount * 5)}ml'
            
        # Handle ounces and pounds
        oz_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:oz|ounces?)', quantity)
        if oz_match:
            amount = float(oz_match.group(1))
            # 1 oz ≈ 28g
            return f'{int(amount * 28)}g'
            
        lb_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lb|pounds?)', quantity)
        if lb_match:
            amount = float(lb_match.group(1))
            # 1 lb ≈ 454g
            return f'{int(amount * 454)}g'
            
        # If no conversion was possible, return the original
        return quantity
    
    def _get_mapped_dish(self, user_input):
        """Get any mapped dish from the dish_mappings table"""
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT dish_name FROM dish_mappings WHERE LOWER(user_term) = LOWER(%s)",
                    [user_input]
                )
                row = cursor.fetchone()
                if row:
                    return row[0]
                return None
        except Exception as e:
            print(f"Error getting mapped dish: {str(e)}")
            return None
    
    def _get_claude_direct_ingredients(self, dish_name):
        """Use Claude API to directly generate fresh ingredients with standardized measurements"""
        if not self.claude_api_key:
            return None
            
        try:
            # Prepare Claude API request
            headers = {
                "x-api-key": self.claude_api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            
            prompt = f"""
            I need a list of ONLY FRESH ingredients for the dish: "{dish_name}".
            
            IMPORTANT GUIDELINES:
            1. Include ONLY fresh produce like meats, fish, vegetables, fruits, and dairy
            2. EXCLUDE common household items like oil, salt, pepper, spices, flour, sugar, etc.
            3. Use METRIC measurements: grams (g) for solids and milliliters (ml) for liquids
            4. For meat and fish, specify quantity in grams (e.g., "250g")
            5. For produce, specify quantity in grams or by count (e.g., "2 large onions" or "150g onions")
            6. Do NOT use cups, tablespoons, or teaspoons as measurements
            
            Format your response as a valid JSON array of objects, where each object has "name" and "quantity" properties.
            For example:
            [
                {{"name": "chicken breast", "quantity": "500g"}},
                {{"name": "bell peppers", "quantity": "2 pieces"}},
                {{"name": "tomatoes", "quantity": "300g"}},
                {{"name": "onion", "quantity": "1 large"}}
            ]
            
            Provide only the JSON array, no additional text. If you're not familiar with the dish or it doesn't contain any fresh ingredients, respond with an empty array: []
            """
            
            # Create Claude API request body
            claude_request = {
                "model": "claude-3-haiku-20240307",
                "max_tokens": 1000,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            # Make request to Claude API
            response = requests.post(self.claude_api_url, headers=headers, json=claude_request)
            
            if response.status_code != 200:
                print(f"Claude API error: {response.status_code} - {response.text}")
                return None
                
            # Parse response
            claude_response = response.json()
            
            # Extract text from Claude's response
            content = claude_response.get('content', [])
            text_response = next((item['text'] for item in content if item['type'] == 'text'), '')
            
            # Extract JSON from the response
            json_match = re.search(r'\[.*\]', text_response, re.DOTALL)
            if json_match:
                try:
                    ingredients_list = json.loads(json_match.group(0))
                    
                    # Validate the structure
                    if ingredients_list and isinstance(ingredients_list, list):
                        valid_ingredients = []
                        for item in ingredients_list:
                            if isinstance(item, dict) and 'name' in item and 'quantity' in item:
                                valid_ingredients.append({
                                    'name': item['name'],
                                    'quantity': item['quantity']
                                })
                        
                        if valid_ingredients:
                            return valid_ingredients
                            
                except json.JSONDecodeError:
                    print("Failed to parse JSON from Claude response")
            
            return None
                
        except Exception as e:
            print(f"Error in Claude direct ingredients: {str(e)}")
            return None
    
    def _get_popular_dishes(self, count=5):
        """Return most common dishes from the database"""
        # Simplified implementation - in a real system, this would be based on usage analytics
        return list(self.dish_cache.keys())[:count]

    def add_dish_mapping(self, dish_name, common_terms):
        """
        Add mapping between common user terms and official dish names
        For example: {"spag bol": "Spaghetti Bolognese", "mac n cheese": "Macaroni and Cheese"}
        """
        if not isinstance(common_terms, list):
            common_terms = [common_terms]
            
        # Store mappings in database and update cache
        try:
            with connection.cursor() as cursor:
                db_engine = connection.vendor
                
                for term in common_terms:
                    if db_engine == 'sqlite':
                        # SQLite doesn't support ON DUPLICATE KEY UPDATE
                        cursor.execute("SELECT COUNT(*) FROM dish_mappings WHERE user_term = %s", [term.lower()])
                        if cursor.fetchone()[0] > 0:
                            cursor.execute(
                                "UPDATE dish_mappings SET dish_name = %s WHERE user_term = %s",
                                [dish_name, term.lower()]
                            )
                        else:
                            cursor.execute(
                                "INSERT INTO dish_mappings (user_term, dish_name) VALUES (%s, %s)",
                                [term.lower(), dish_name]
                            )
                    else:
                        # MySQL syntax
                        cursor.execute(
                            "INSERT INTO dish_mappings (user_term, dish_name) VALUES (%s, %s) "
                            "ON DUPLICATE KEY UPDATE dish_name = %s",
                            [term.lower(), dish_name, dish_name]
                        )
            return True
        except Exception as e:
            print(f"Error adding dish mapping: {str(e)}")
            return False

    def _parse_ingredients(self, ingredients_string):
        """
        Parse ingredients string into structured items with quantities
        """
        if not ingredients_string:
            return []
            
        # Split by semicolons and commas to separate ingredients
        separators = [';', ',']
        ingredients_list = []
        
        # Start with the whole string
        parts = [ingredients_string]
        
        # Split by each separator
        for separator in separators:
            new_parts = []
            for part in parts:
                new_parts.extend([p.strip() for p in part.split(separator) if p.strip()])
            parts = new_parts
        
        # Process each ingredient
        for ingredient in parts:
            # Try to separate quantity and ingredient name
            quantity_match = re.match(r'^(\d+(?:\.\d+)?(?:/\d+)?)\s*([a-zA-Z]+)?\s+(.+)$', ingredient)
            
            if quantity_match:
                amount = quantity_match.group(1)
                unit = quantity_match.group(2) or ""
                name = quantity_match.group(3)
                
                ingredients_list.append({
                    'name': name,
                    'quantity': f"{amount} {unit}".strip()
                })
            else:
                ingredients_list.append({
                    'name': ingredient,
                    'quantity': 'as needed'
                })
                
        return ingredients_list