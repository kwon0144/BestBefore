# api/ingredient_combiner.py
import re
from django.conf import settings
from .dish_ingre_service import DishIngredientService

def combine_dish_ingredients(selected_dishes):
    """
    Combine ingredients from multiple dishes, adding quantities of duplicate ingredients.
    
    Args:
        selected_dishes: A list of dish objects, where each contains:
                        - name: The name of the dish
                        - quantity: How many servings (optional, defaults to 1)
    
    Returns:
        A dictionary with combined ingredients grouped by category and properly summed quantities
    """
    # Initialize the service
    dish_service = DishIngredientService()
    
    # Initialize result containers
    all_ingredients = []
    found_dishes = []
    missing_dishes = []
    
    # Process each dish
    for dish in selected_dishes:
        dish_name = dish.get('name')
        dish_quantity = dish.get('quantity', 1)
        
        if not dish_name:
            continue
        
        # Get ingredients for this dish
        result = dish_service.get_ingredients(dish_name)
        
        if 'error' in result:
            # Dish not found
            missing_dishes.append(dish_name)
            continue
        
        # Add to found dishes
        found_dishes.append(result.get('dish', dish_name))
        
        # Scale ingredients based on quantity
        ingredients = result.get('ingredients', [])
        scaled_ingredients = scale_ingredients(ingredients, dish_quantity)
        
        # Add to our collection
        all_ingredients.extend(scaled_ingredients)
    
    # Combine duplicate ingredients
    combined_ingredients = combine_ingredients(all_ingredients)
    
    # Categorize the combined ingredients
    categorized_ingredients = categorize_ingredients(combined_ingredients)
    
    return {
        'success': len(found_dishes) > 0,
        'dishes': found_dishes,
        'missing_dishes': missing_dishes,
        'items_by_category': categorized_ingredients
    }

def scale_ingredients(ingredients, quantity):
    """
    Scale ingredient quantities based on the number of servings requested.
    
    Args:
        ingredients: List of ingredient objects with name and quantity
        quantity: Number of servings
    
    Returns:
        List of ingredients with adjusted quantities
    """
    if quantity <= 1:
        return ingredients
    
    scaled_ingredients = []
    
    for ingredient in ingredients:
        name = ingredient.get('name')
        original_quantity = ingredient.get('quantity', 'as needed')
        
        # Skip if no name or quantity
        if not name:
            continue
        
        # Scale quantity if it's not just "as needed"
        if original_quantity != 'as needed':
            # Try to multiply numeric quantities
            try:
                # Extract numeric part and unit
                quantity_match = re.match(r'^(\d+(?:\.\d+)?)\s*(.*)$', original_quantity)
                
                if quantity_match:
                    amount = float(quantity_match.group(1))
                    unit = quantity_match.group(2)
                    
                    # Calculate new amount
                    new_amount = amount * quantity
                    
                    # Format with up to 2 decimal places, remove trailing zeros
                    formatted_amount = str(new_amount).rstrip('0').rstrip('.') if '.' in str(new_amount) else str(int(new_amount))
                    
                    # Construct new quantity string
                    scaled_quantity = f"{formatted_amount} {unit}".strip()
                else:
                    # For non-numeric quantities (like "2 pieces")
                    pieces_match = re.match(r'^(\d+)\s+(pieces?|large|medium|small)$', original_quantity)
                    if pieces_match:
                        count = int(pieces_match.group(1)) * quantity
                        unit = pieces_match.group(2)
                        # Make sure "piece" becomes "pieces" for counts > 1
                        if unit == "piece" and count > 1:
                            unit = "pieces"
                        scaled_quantity = f"{count} {unit}"
                    else:
                        # If we can't parse it, just prefix with the quantity
                        scaled_quantity = f"{quantity}x {original_quantity}"
            except:
                # If parsing fails, fall back to simple format
                scaled_quantity = f"{quantity}x {original_quantity}"
        else:
            scaled_quantity = original_quantity
        
        # Add the scaled ingredient
        scaled_ingredients.append({
            'name': name,
            'quantity': scaled_quantity
        })
    
    return scaled_ingredients

def combine_ingredients(ingredients_list):
    """
    Combine duplicate ingredients by adding their quantities.
    
    Args:
        ingredients_list: List of ingredient objects with name and quantity
    
    Returns:
        List of ingredients with duplicates combined
    """
    if not ingredients_list:
        return []
    
    # Use a dictionary to combine duplicates
    combined = {}
    
    for ingredient in ingredients_list:
        name = ingredient.get('name', '').lower()
        quantity = ingredient.get('quantity', 'as needed')
        
        if not name:
            continue
        
        if name in combined:
            # Combine quantities
            combined[name]['quantity'] = add_quantities(combined[name]['quantity'], quantity)
        else:
            # Add new ingredient
            combined[name] = {
                'name': ingredient.get('name'),  # Keep the original casing
                'quantity': quantity
            }
    
    # Convert back to list
    return list(combined.values())

def add_quantities(q1, q2):
    """
    Add two quantity strings together, handling different units.
    
    Args:
        q1: First quantity string (e.g., "100g")
        q2: Second quantity string (e.g., "200g")
    
    Returns:
        Combined quantity string (e.g., "300g")
    """
    # Handle "as needed" case
    if q1 == 'as needed':
        return q2
    if q2 == 'as needed':
        return q1
    
    # Extract numeric values and units
    q1_match = re.match(r'^(\d+(?:\.\d+)?)\s*(.*)$', q1)
    q2_match = re.match(r'^(\d+(?:\.\d+)?)\s*(.*)$', q2)
    
    if q1_match and q2_match:
        q1_num = float(q1_match.group(1))
        q2_num = float(q2_match.group(1))
        q1_unit = q1_match.group(2).strip()
        q2_unit = q2_match.group(2).strip()
        
        # If units match, add values
        if q1_unit == q2_unit:
            total = q1_num + q2_num
            # Format to integer if it's a whole number
            if total == int(total):
                total = int(total)
            return f"{total} {q1_unit}".strip()
        
        # If both are weight units, try to convert
        if is_weight_unit(q1_unit) and is_weight_unit(q2_unit):
            # Convert both to grams
            total_grams = convert_to_grams(q1_num, q1_unit) + convert_to_grams(q2_num, q2_unit)
            return format_weight(total_grams)
        
        # If both are volume units, try to convert
        if is_volume_unit(q1_unit) and is_volume_unit(q2_unit):
            # Convert both to milliliters
            total_ml = convert_to_ml(q1_num, q1_unit) + convert_to_ml(q2_num, q2_unit)
            return format_volume(total_ml)
    
    # Special case for counts (e.g., "2 pieces" + "3 pieces")
    pieces1_match = re.match(r'^(\d+)\s+(pieces?|large|medium|small)$', q1)
    pieces2_match = re.match(r'^(\d+)\s+(pieces?|large|medium|small)$', q2)
    
    if pieces1_match and pieces2_match and pieces1_match.group(2) == pieces2_match.group(2):
        count1 = int(pieces1_match.group(1))
        count2 = int(pieces2_match.group(2))
        unit = pieces1_match.group(2)
        # Make sure "piece" becomes "pieces" for counts > 1
        if unit == "piece" and count1 + count2 > 1:
            unit = "pieces"
        return f"{count1 + count2} {unit}"
    
    # Handle "Nx" format (e.g., "2x onion" + "3x onion")
    nx1_match = re.match(r'^(\d+)x\s+(.*)$', q1)
    nx2_match = re.match(r'^(\d+)x\s+(.*)$', q2)
    
    if nx1_match and nx2_match and nx1_match.group(2) == nx2_match.group(2):
        count1 = int(nx1_match.group(1))
        count2 = int(nx2_match.group(1))
        base_quantity = nx1_match.group(2)
        return f"{count1 + count2}x {base_quantity}"
    
    # If we can't combine directly, join with "+"
    return f"{q1} + {q2}"

def is_weight_unit(unit):
    """Check if the unit is a weight unit"""
    weight_units = ['g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms']
    return unit.lower() in weight_units

def is_volume_unit(unit):
    """Check if the unit is a volume unit"""
    volume_units = ['ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters']
    return unit.lower() in volume_units

def convert_to_grams(value, unit):
    """Convert a weight value to grams"""
    unit = unit.lower()
    if unit in ['kg', 'kilogram', 'kilograms']:
        return value * 1000
    # Assume it's already in grams
    return value

def convert_to_ml(value, unit):
    """Convert a volume value to milliliters"""
    unit = unit.lower()
    if unit in ['l', 'liter', 'liters']:
        return value * 1000
    # Assume it's already in milliliters
    return value

def format_weight(grams):
    """Format a weight value in the most appropriate unit"""
    if grams >= 1000:
        kg = grams / 1000
        # Format to one decimal place if not a whole number
        if kg == int(kg):
            return f"{int(kg)} kg"
        else:
            return f"{kg:.1f} kg"
    else:
        return f"{int(grams)} g"

def format_volume(ml):
    """Format a volume value in the most appropriate unit"""
    if ml >= 1000:
        l = ml / 1000
        # Format to one decimal place if not a whole number
        if l == int(l):
            return f"{int(l)} l"
        else:
            return f"{l:.1f} l"
    else:
        return f"{int(ml)} ml"

def categorize_ingredients(ingredients):
    """
    Categorize ingredients by type (Meat, Fish, Produce, etc.)
    
    Args:
        ingredients: List of ingredient objects
    
    Returns:
        Dictionary with categories as keys and ingredient lists as values
    """
    # Initialize categories
    categories = {
        'Meat': [],
        'Fish': [],
        'Produce': [],
        'Dairy': [],
        'Grains': [],
        'Condiments': [],
        'Other': []
    }
    
    for ingredient in ingredients:
        name = ingredient.get('name', '').lower()
        category = determine_category(name)
        categories[category].append(ingredient)
    
    # Remove empty categories
    return {k: v for k, v in categories.items() if v}

def determine_category(ingredient_name):
    """Determine the category of an ingredient based on its name"""
    ingredient = ingredient_name.lower()
    
    # Meat
    meat_keywords = ['beef', 'chicken', 'pork', 'turkey', 'veal', 'lamb', 'ground meat', 'steak', 'sausage']
    if any(keyword in ingredient for keyword in meat_keywords):
        return 'Meat'
    
    # Fish
    fish_keywords = ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'seafood', 'crab', 'lobster']
    if any(keyword in ingredient for keyword in fish_keywords):
        return 'Fish'
    
    # Produce
    produce_keywords = ['vegetable', 'fruit', 'tomato', 'lettuce', 'onion', 'garlic', 'pepper', 'carrot', 
                       'broccoli', 'cabbage', 'spinach', 'apple', 'orange', 'banana', 'herb', 'lemon']
    if any(keyword in ingredient for keyword in produce_keywords):
        return 'Produce'
    
    # Dairy
    dairy_keywords = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy', 'ice cream']
    if any(keyword in ingredient for keyword in dairy_keywords):
        return 'Dairy'
    
    # Grains
    grain_keywords = ['rice', 'pasta', 'bread', 'flour', 'cereal', 'oat', 'grain', 'wheat', 'barley']
    if any(keyword in ingredient for keyword in grain_keywords):
        return 'Grains'
    
    # Condiments
    condiment_keywords = ['sauce', 'oil', 'vinegar', 'ketchup', 'mustard', 'mayo', 'dressing', 'seasoning', 'spice']
    if any(keyword in ingredient for keyword in condiment_keywords):
        return 'Condiments'
    
    # Default to Other
    return 'Other'

def is_pantry_item(ingredient):
    """
    Determine if an ingredient is typically a pantry item
    This would be more sophisticated in a real system
    """
    ingredient = ingredient.lower()
    pantry_keywords = ['salt', 'pepper', 'sugar', 'flour', 'oil', 'vinegar', 'spice', 'herb', 'seasoning', 
                     'stock', 'pasta', 'rice', 'grain', 'canned', 'dried', 'baking', 'sauce']
    
    return any(keyword in ingredient for keyword in pantry_keywords)