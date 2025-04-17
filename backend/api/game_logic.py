"""
Game logic module for the Best Before food waste sorting game.
This module contains the core game logic functions that are used by the API views.
"""

import random
from datetime import datetime
import uuid

# In-memory storage
games = {}

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

def update_game_state(game_id, action, food_type):
    """
    Update the game state based on player action.
    
    Args:
        game_id (str): The ID of the game to update
        action (str): The action taken ('correct' or 'incorrect')
        food_type (str): The type of food ('donate', 'compost', 'eat', 'trash')
        
    Returns:
        dict: Updated game data including score and time_remaining
    """
    if game_id not in games:
        raise ValueError("Game not found or already ended")
        
    game = games[game_id]
    if not game['is_active']:
        raise ValueError("Game is not active")
    
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
    
    # Update time remaining (decrease by 1 second for each action)
    game['time_remaining'] = max(0, game['time_remaining'] - 1)
    
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
    
    return {
        'score': game['score'],
        'time_played': time_played
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

def generate_food_item():
    """
    Generate a random food item for the game.
    
    Returns:
        dict: Food item data including type, name, and image
    """
    food_types = [
        {
            'name': 'Plastic Wrapper',
            'type': 'trash',
            'image': 'https://readdy.ai/api/search-image?query=A%20crumpled%20plastic%20food%20wrapper%20or%20packaging%20on%20a%20clean%20white%20background%2C%20clearly%20showing%20it%20is%20waste%20material%2C%20high%20quality%20product%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20wrinkled%20and%20discarded%20appearance&width=200&height=200&seq=9&orientation=squarish'
        },
        {
            'name': 'Fresh Apple',
            'type': 'donate',
            'image': 'https://readdy.ai/api/search-image?query=A%20photorealistic%20fresh%20red%20apple%20on%20a%20clean%20white%20background%2C%20perfect%20condition%2C%20no%20blemishes%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20glossy%20skin%20and%20fresh%20appearance&width=200&height=200&seq=1&orientation=squarish'
        },
        {
            'name': 'Sealed Pasta',
            'type': 'donate',
            'image': 'https://readdy.ai/api/search-image?query=A%20sealed%20package%20of%20dry%20pasta%20on%20a%20clean%20white%20background%2C%20unopened%20pasta%20package%20in%20perfect%20condition%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20packaging%20details%20and%20product%20clearly&width=200&height=200&seq=2&orientation=squarish'
        },
        {
            'name': 'Canned Beans',
            'type': 'donate',
            'image': 'https://readdy.ai/api/search-image?query=A%20can%20of%20beans%20on%20a%20clean%20white%20background%2C%20unopened%20metal%20can%20in%20perfect%20condition%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20label%20details%20and%20product%20clearly&width=200&height=200&seq=3&orientation=squarish'
        },
        {
            'name': 'Banana',
            'type': 'eat',
            'image': 'https://readdy.ai/api/search-image?query=A%20ripe%20yellow%20banana%20on%20a%20clean%20white%20background%2C%20perfect%20condition%20with%20slight%20spotting%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20bright%20yellow%20peel%20and%20ready-to-eat%20appearance&width=200&height=200&seq=4&orientation=squarish'
        },
        {
            'name': 'Yogurt',
            'type': 'eat',
            'image': 'https://readdy.ai/api/search-image?query=An%20unopened%20container%20of%20yogurt%20on%20a%20clean%20white%20background%2C%20sealed%20yogurt%20cup%20in%20perfect%20condition%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20packaging%20details%20and%20creamy%20product%20clearly&width=200&height=200&seq=5&orientation=squarish'
        },
        {
            'name': 'Moldy Bread',
            'type': 'compost',
            'image': 'https://readdy.ai/api/search-image?query=A%20slice%20of%20bread%20with%20visible%20mold%20spots%20on%20a%20clean%20white%20background%2C%20clearly%20spoiled%20food%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20green%20and%20white%20mold%20growth%20on%20the%20bread%20surface&width=200&height=200&seq=6&orientation=squarish'
        },
        {
            'name': 'Vegetable Scraps',
            'type': 'compost',
            'image': 'https://readdy.ai/api/search-image?query=Vegetable%20peels%20and%20scraps%20on%20a%20clean%20white%20background%2C%20carrot%20tops%2C%20potato%20peels%2C%20and%20onion%20skins%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20organic%20kitchen%20waste%20suitable%20for%20composting&width=200&height=200&seq=7&orientation=squarish'
        },
        {
            'name': 'Coffee Grounds',
            'type': 'compost',
            'image': 'https://readdy.ai/api/search-image?query=Used%20coffee%20grounds%20on%20a%20clean%20white%20background%2C%20dark%20brown%20wet%20coffee%20grounds%20after%20brewing%2C%20high%20quality%20food%20photography%20with%20soft%20natural%20lighting%2C%20showing%20the%20texture%20and%20appearance%20of%20used%20coffee%20grounds&width=200&height=200&seq=8&orientation=squarish'
        }
    ]
    
    return random.choice(food_types) 