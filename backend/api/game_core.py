"""
Core game logic module for the Best Before food waste sorting game.
This module contains the main game state management and core game functions.
"""

import uuid
import random
from datetime import datetime
from .game_validators import validate_pickup, validate_action
from .game_state import games

# Game constants
INITIAL_SCORE = 0
INITIAL_TIME = 60  # seconds
CORRECT_ACTION_POINTS = 10
INCORRECT_ACTION_POINTS = -5
EAT_CORRECT_POINTS = 15
EAT_INCORRECT_POINTS = -10
EAT_TRASH_POINTS = -15

def start_new_game(player_id):
    """
    Start a new game for a player.
    
    Args:
        player_id (str): The ID of the player starting the game
        
    Returns:
        dict: Game data including game_id, score, and time_remaining
        
    Raises:
        ValueError: If player_id is empty or invalid
        Exception: If there's an error creating the game
    """
    if not player_id or not isinstance(player_id, str):
        raise ValueError("Invalid player_id provided")
        
    try:
        game_id = str(uuid.uuid4())
        game_data = {
            'id': game_id,
            'player_id': player_id,
            'score': INITIAL_SCORE,
            'time_remaining': INITIAL_TIME,
            'is_active': True,
            'created_at': datetime.now()
        }
        games[game_id] = game_data
        
        return {
            'game_id': game_id,
            'score': game_data['score'],
            'time_remaining': game_data['time_remaining']
        }
    except Exception as e:
        raise Exception(f"Failed to create new game: {str(e)}")

def update_game_state(game_id, action, food_type, character_position=None, food=None):
    """
    Update the game state based on player action.
    
    Args:
        game_id (str): The ID of the game to update
        action (str): The action taken ('correct' or 'incorrect')
        food_type (str): The type of food ('donate', 'compost', 'eat', 'trash')
        character_position (dict, optional): The position of the character {'x': float, 'y': float}
        food (dict, optional): The food item being used
        
    Returns:
        dict: Updated game data including score and time_remaining
    """
    if game_id not in games:
        raise ValueError("Game not found or already ended")
        
    game = games[game_id]
    if not game['is_active']:
        raise ValueError("Game is not active")
    
    # If character position and food are provided, validate the action
    if character_position and food:
        # Determine the action type based on the food type
        action_type = None
        if food_type == 'donate':
            action_type = 'donate'
        elif food_type == 'compost':
            action_type = 'compost'
        elif food_type == 'eat':
            action_type = 'eat'
        
        if action_type:
            validation_result = validate_action(character_position, food, action_type)
            if not validation_result['success']:
                raise ValueError(validation_result['message'])
            
            # Use the validation result to determine if the action is correct
            action = 'correct' if validation_result['correct'] else 'incorrect'
    
    # Calculate score change based on action and food type
    score_change = 0
    
    # Score rules:
    # 1. Correct actions:
    #    - Donating food: +10 points
    #    - Composting food: +10 points
    #    - Eating food: +15 points
    # 2. Incorrect actions:
    #    - Wrong donation: -5 points
    #    - Wrong composting: -5 points
    #    - Wrong eating: -10 points
    #    - Eating trash: -15 points
    
    if action == 'correct':
        if food_type == 'eat':
            score_change = EAT_CORRECT_POINTS  # +15 points
        else:
            score_change = CORRECT_ACTION_POINTS  # +10 points
    elif action == 'incorrect':
        if food_type == 'trash' and action == 'eat':
            score_change = EAT_TRASH_POINTS  # -15 points
        elif food_type == 'eat':
            score_change = EAT_INCORRECT_POINTS  # -10 points
        else:
            score_change = INCORRECT_ACTION_POINTS  # -5 points
    
    # Update game score (ensure score doesn't go below 0)
    game['score'] = max(0, game['score'] + score_change)
    
    
    # Check if game should end (time ran out)
    if game['time_remaining'] <= 0:
        game['is_active'] = False
    
    return {
        'score': game['score'],
        'time_remaining': game['time_remaining'],
        'is_game_over': game['time_remaining'] <= 0
    }

def end_game_session(game_id):
    """
    End a game session and return final results.
    
    Args:
        game_id (str): The ID of the game to end
        
    Returns:
        dict: Final game data including score and time played
    """
    if game_id not in games:
        raise ValueError("Game not found or already ended")
        
    game = games[game_id]
    if not game['is_active']:
        raise ValueError("Game is not active")
    
    # Mark game as inactive
    game['is_active'] = False
    
    # Calculate time played
    time_played = INITIAL_TIME - game['time_remaining']
    
    # Return final game data
    return {
        'score': game['score'],
        'time_played': time_played
    }

def prepare_game_food_items(food_items_query):
    """
    Prepare a balanced set of food items for the game.
    Creates a set of 12 items: 5 food bank, 5 green waste bin, and 2 trash
    
    Args:
        food_items_query: Django QuerySet of GameFoodResources objects
        
    Returns:
        list: A list of 12 food items with balanced types
    """
    if not food_items_query or food_items_query.count() == 0:
        return []
    
    # Filter items by type
    food_bank_items = list(food_items_query.filter(type='food bank').values())
    green_waste_bin_items = list(food_items_query.filter(type='green waste bin').values())
    trash_items = list(food_items_query.filter(type='trash').values())
    
    # Function to get random items from a list
    def get_random_items(items, count):
        """Get a specified number of random items from a list, with repetition if needed"""
        result = []
        items_copy = items.copy()  # Work with a copy to avoid modifying the original
        
        # If we don't have enough items of this type, we'll need to repeat some
        while len(result) < count:
            if not items_copy:
                # Reset the available items if we've used them all
                items_copy = items.copy()
            
            # Select a random item
            if items_copy:
                random_index = random.randint(0, len(items_copy) - 1)
                result.append(items_copy.pop(random_index))
        
        return result
    
    # Get 5 food bank items, 5 green waste bin items, and 2 trash items
    selected_food_bank = get_random_items(food_bank_items, 5)
    selected_green_waste = get_random_items(green_waste_bin_items, 5)
    selected_trash = get_random_items(trash_items, 2)
    
    # Combine all selected items
    game_items = selected_food_bank + selected_green_waste + selected_trash
    
    # Shuffle the combined array to randomize the order
    random.shuffle(game_items)
    
    return game_items 