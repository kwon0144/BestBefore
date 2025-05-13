"""
Game validation module for the Best Before food waste sorting game.
This module contains validation functions and helper functions for game mechanics.
"""

import math
from .game_state import games

# Game zone constants
PICKUP_RANGE = 100  # Increased from 50 to 100 for easier food pickup
FOOD_BANK_ZONE = {
    'x_min': 200,  
    'x_max': 450,  
    'y_min': 350,  
    'y_max': 600   
}
GREEN_BIN_ZONE = {
    'x_min': 450,
    'x_max': 600,
    'y_min': 400,
    'y_max': 550
}
EAT_ZONE = {
    'x_min': 650,
    'x_max': 750,
    'y_min': 250,
    'y_max': 350
}
DIY_ZONE = {
    'x_min': 650,
    'x_max': 800,
    'y_min': 300,
    'y_max': 450
}

def validate_pickup(character_position, foods):
    """
    Validate if a player can pick up food based on their position and available foods.
    
    Args:
        character_position (dict): The position of the character {'x': float, 'y': float}
        foods (list): List of food items on the conveyor belt
        
    Returns:
        dict: Result of the validation including success status and the food item if successful
    """
    if not character_position or not foods:
        return {'success': False, 'message': 'Invalid input data'}
    
    # Find the closest food
    closest_food = None
    min_distance = float('inf')
    
    for food in foods:
        # Calculate food center position (assuming food size is 40x40)
        food_center_x = food['x'] + 20
        food_center_y = food['y'] + 20
        
        # Calculate distance between character and food
        distance = math.sqrt(
            (character_position['x'] - food_center_x) ** 2 +
            (character_position['y'] - food_center_y) ** 2
        )
        
        if distance < min_distance:
            min_distance = distance
            closest_food = food
    
    # Check if the closest food is within pickup range
    if closest_food and min_distance < PICKUP_RANGE:
        return {
            'success': True,
            'picked_food': closest_food
        }
    else:
        return {
            'success': False,
            'message': 'No food in range'
        }

def validate_action(character_position, food, action_type):
    """
    Validate if a player can perform an action (donate, compost, eat, diy) based on their position.
    
    Args:
        character_position (dict): The position of the character {'x': float, 'y': float}
        food (dict): The food item being used
        action_type (str): The type of action ('donate', 'compost', 'eat', 'diy')
        
    Returns:
        dict: Result of the validation including success status, zone, and correctness
    """
    if not character_position or not food or not action_type:
        return {'success': False, 'message': 'Invalid input data'}
    
    # Check if character is in the food bank zone
    in_food_bank = (
        FOOD_BANK_ZONE['x_min'] < character_position['x'] < FOOD_BANK_ZONE['x_max'] and
        FOOD_BANK_ZONE['y_min'] < character_position['y'] < FOOD_BANK_ZONE['y_max']
    )
    
    # Check if character is in the green bin zone
    in_green_bin = (
        GREEN_BIN_ZONE['x_min'] < character_position['x'] < GREEN_BIN_ZONE['x_max'] and
        GREEN_BIN_ZONE['y_min'] < character_position['y'] < GREEN_BIN_ZONE['y_max']
    )
    
    # Check if character is in the eat zone
    in_eat_zone = (
        EAT_ZONE['x_min'] < character_position['x'] < EAT_ZONE['x_max'] and
        EAT_ZONE['y_min'] < character_position['y'] < EAT_ZONE['y_max']
    )
    
    # Check if character is in the DIY zone
    in_diy_zone = (
        DIY_ZONE['x_min'] < character_position['x'] < DIY_ZONE['x_max'] and
        DIY_ZONE['y_min'] < character_position['y'] < DIY_ZONE['y_max']
    )
    
    # Determine if the action is correct based on the zone and food type
    if action_type == 'donate' and in_food_bank:
        return {
            'success': True,
            'zone': 'food_bank',
            'correct': food['type'] == 'donate',
            'message': 'Correct! Food donated. +10 points' if food['type'] == 'donate' else 'Wrong! This food should not be donated. -5 points'
        }
    elif action_type == 'compost' and in_green_bin:
        return {
            'success': True,
            'zone': 'green_bin',
            'correct': food['type'] == 'compost',
            'message': 'Correct! Food composted. +10 points' if food['type'] == 'compost' else 'Wrong! This food should not be composted. -5 points'
        }
    elif action_type == 'eat' and in_eat_zone:
        if food['type'] == 'trash':
            return {
                'success': True,
                'zone': 'eat',
                'correct': False,
                'message': 'This is trash! Don\'t eat it! -15 points'
            }
        else:
            return {
                'success': True,
                'zone': 'eat',
                'correct': food['type'] == 'eat',
                'message': 'Yum! Perfect food to eat. +15 points' if food['type'] == 'eat' else 'Yuck! This food is not edible! -10 points'
            }
    elif action_type == 'diy' and in_diy_zone:
        # Check if the food can be DIYed (has diy_option=1)
        has_diy_option = food.get('diy_option') == '1' or food.get('diy_option') == 1 or food.get('diy_option') is True
        
        return {
            'success': True,
            'zone': 'diy',
            'correct': has_diy_option and food['type'] == 'green waste bin',
            'message': 'Amazing! Great DIY creation! +15 points' if has_diy_option and food['type'] == 'green waste bin' else 'Wrong! This food cannot be used for DIY. -5 points'
        }
    else:
        return {
            'success': False,
            'message': 'Not in a valid zone for this action'
        }

def get_top_scores(limit=10):
    """
    Get the top scores from completed games.
    
    Args:
        limit (int): The number of top scores to return
        
    Returns:
        list: List of dictionaries containing player_id, score, and date
    """
    completed_games = [game for game in games.values() if not game['is_active']]
    top_scores = sorted(completed_games, key=lambda x: x['score'], reverse=True)[:limit]
    
    return [{
        'player_id': game['player_id'],
        'score': game['score'],
        'date': game['created_at']
    } for game in top_scores] 