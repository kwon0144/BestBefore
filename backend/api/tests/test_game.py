from django.test import SimpleTestCase, Client
from django.urls import reverse
from rest_framework import status
from unittest.mock import patch, MagicMock
import json
from api.game_state import games

class GameAPITests(SimpleTestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Mock game food resources
        self.mock_food_item1 = MagicMock()
        self.mock_food_item1.id = 1
        self.mock_food_item1.name = "Apple"
        self.mock_food_item1.type = "food bank"
        self.mock_food_item1.image = "apple.jpg"
        self.mock_food_item1.description = "A fresh apple"
        self.mock_food_item1.diy_option = "0"
        self.mock_food_item1.greengas_emession = "10"

        self.mock_food_item2 = MagicMock()
        self.mock_food_item2.id = 2
        self.mock_food_item2.name = "Banana Peel"
        self.mock_food_item2.type = "green waste bin"
        self.mock_food_item2.image = "banana_peel.jpg"
        self.mock_food_item2.description = "A banana peel"
        self.mock_food_item2.diy_option = "1"
        self.mock_food_item2.greengas_emession = "5"

        self.mock_food_item3 = MagicMock()
        self.mock_food_item3.id = 3
        self.mock_food_item3.name = "Plastic Wrapper"
        self.mock_food_item3.type = "trash"
        self.mock_food_item3.image = "plastic.jpg"
        self.mock_food_item3.description = "A plastic wrapper"
        self.mock_food_item3.diy_option = "0"
        self.mock_food_item3.greengas_emession = "20"

        self.mock_food_items = [self.mock_food_item1, self.mock_food_item2, self.mock_food_item3]
        
        # Mock game resources
        self.mock_resource1 = MagicMock()
        self.mock_resource1.id = 1
        self.mock_resource1.name = "Background"
        self.mock_resource1.type = "background"
        self.mock_resource1.description = "Game background image"
        self.mock_resource1.image = "background.jpg"

        self.mock_resource2 = MagicMock()
        self.mock_resource2.id = 2
        self.mock_resource2.name = "Character"
        self.mock_resource2.type = "character"
        self.mock_resource2.description = "Player character"
        self.mock_resource2.image = "character.jpg"

        self.mock_resources = [self.mock_resource1, self.mock_resource2]
        
        # Mock player and game data
        self.player_id = "test_player"
        self.mock_game_id = "test_game_id"
        self.mock_game = {
            'id': self.mock_game_id,
            'player_id': self.player_id,
            'score': 0,
            'time_remaining': 60,
            'is_active': True,
            'created_at': '2023-06-01T12:00:00Z'
        }
        
        # Clear the games dictionary before each test
        games.clear()

    @patch('api.views.start_new_game')
    def test_start_game(self, mock_start_new_game):
        """Test starting a new game"""
        mock_start_new_game.return_value = {
            'game_id': self.mock_game_id,
            'score': 0,
            'time_remaining': 60
        }
        
        url = reverse('start_game')
        data = {'player_id': self.player_id}
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['game_id'], self.mock_game_id)
        self.assertEqual(response.data['score'], 0)
        self.assertEqual(response.data['time_remaining'], 60)
        mock_start_new_game.assert_called_once_with(self.player_id)

    @patch('api.views.start_new_game')
    def test_start_game_missing_player_id(self, mock_start_new_game):
        """Test starting a game without player_id"""
        url = reverse('start_game')
        data = {}  # Missing player_id
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'player_id is required')
        mock_start_new_game.assert_not_called()

    @patch('api.views.update_game_state')
    def test_update_game(self, mock_update_game_state):
        """Test updating a game state"""
        mock_update_game_state.return_value = {
            'score': 10,
            'time_remaining': 55,
            'is_game_over': False
        }
        
        url = reverse('update_game')
        data = {
            'game_id': self.mock_game_id,
            'action': 'correct',
            'food_type': 'food bank',
            'diy_option': '0',
            'character_position': {'x': 100, 'y': 200},
            'food': {
                'id': 1, 
                'type': 'food bank', 
                'name': 'Apple', 
                'image': 'apple.jpg',
                'x': 90,
                'y': 190
            }
        }
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['score'], 10)
        self.assertEqual(response.data['time_remaining'], 55)
        self.assertEqual(response.data['is_game_over'], False)
        mock_update_game_state.assert_called_once_with(
            self.mock_game_id, 'correct', 'food bank', '0',
            {'x': 100, 'y': 200},
            {
                'id': 1, 
                'type': 'food bank', 
                'name': 'Apple', 
                'image': 'apple.jpg',
                'x': 90,
                'y': 190
            }
        )

    @patch('api.views.end_game_session')
    def test_end_game(self, mock_end_game_session):
        """Test ending a game"""
        mock_end_game_session.return_value = {
            'score': 50,
            'time_played': 45
        }
        
        url = reverse('end_game')
        data = {'game_id': self.mock_game_id}
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['score'], 50)
        self.assertEqual(response.data['time_played'], 45)
        mock_end_game_session.assert_called_once_with(self.mock_game_id)

    @patch('api.views.GameFoodResources.objects.all')
    @patch('api.views.prepare_game_food_items')
    def test_get_food_items(self, mock_prepare_items, mock_all):
        """Test getting food items for the game"""
        # Setup mock objects for both all() and prepare_game_food_items
        mock_all.return_value = self.mock_food_items
        
        mock_prepared_items = [
            {
                'id': 1,
                'name': 'Apple',
                'type': 'food bank',
                'image': 'apple.jpg',
                'description': 'A fresh apple',
                'diy_option': '0',
                'greengas_emession': '10'
            },
            {
                'id': 2,
                'name': 'Banana Peel',
                'type': 'green waste bin',
                'image': 'banana_peel.jpg',
                'description': 'A banana peel',
                'diy_option': '1',
                'greengas_emession': '5'
            }
        ]
        mock_prepare_items.return_value = mock_prepared_items
        
        url = reverse('get_food_items')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['food_items']), 2)
        self.assertEqual(response.data['food_items'][0]['name'], 'Apple')
        self.assertEqual(response.data['food_items'][1]['name'], 'Banana Peel')
        mock_all.assert_called_once()
        mock_prepare_items.assert_called_once()

    @patch('api.views.validate_pickup')
    def test_pickup_food(self, mock_validate_pickup):
        """Test validating food pickup"""
        # Set up games dict
        games[self.mock_game_id] = self.mock_game
        
        # Set up mock result
        mock_validate_pickup.return_value = {
            'success': True,
            'picked_food': {
                'id': 1,
                'name': 'Apple',
                'type': 'food bank',
                'image': 'apple.jpg',
                'x': 100,
                'y': 120
            }
        }
        
        url = reverse('pickup_food')
        data = {
            'game_id': self.mock_game_id,
            'character_position': {'x': 110, 'y': 130},
            'foods': [
                {
                    'id': 1,
                    'name': 'Apple',
                    'type': 'food bank',
                    'image': 'apple.jpg',
                    'x': 100,
                    'y': 120
                }
            ]
        }
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['picked_food']['id'], 1)
        self.assertEqual(response.data['picked_food']['name'], 'Apple')
        mock_validate_pickup.assert_called_once_with(
            {'x': 110, 'y': 130},
            [{'id': 1, 'name': 'Apple', 'type': 'food bank', 'image': 'apple.jpg', 'x': 100, 'y': 120}]
        )

    @patch('api.views.validate_action')
    def test_perform_action(self, mock_validate_action):
        """Test validating an action (donate, compost, eat, diy)"""
        # Set up games dict
        games[self.mock_game_id] = self.mock_game
        
        # Set up mock result
        mock_validate_action.return_value = {
            'success': True,
            'zone': 'food_bank',
            'correct': True,
            'message': 'Correct! Food donated. +10 points'
        }
        
        url = reverse('perform_action')
        data = {
            'game_id': self.mock_game_id,
            'character_position': {'x': 300, 'y': 400},
            'food': {
                'id': 1,
                'name': 'Apple',
                'type': 'food bank',
                'image': 'apple.jpg'
            },
            'action_type': 'donate'
        }
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['zone'], 'food_bank')
        self.assertTrue(response.data['correct'])
        self.assertEqual(response.data['message'], 'Correct! Food donated. +10 points')
        mock_validate_action.assert_called_once_with(
            {'x': 300, 'y': 400},
            {'id': 1, 'name': 'Apple', 'type': 'food bank', 'image': 'apple.jpg'},
            'donate'
        )

    @patch('api.views.GameResources.objects.all')
    def test_get_game_resources(self, mock_all):
        """Test getting game resources"""
        # Set up a MagicMock for the queryset with values method
        mock_queryset = MagicMock()
        mock_all.return_value = mock_queryset
        
        # Mock the values() method and its return value
        mock_queryset.values.return_value = [
            {
                'id': 1,
                'name': 'Background',
                'type': 'background',
                'description': 'Game background image',
                'image': 'background.jpg'
            },
            {
                'id': 2,
                'name': 'Character',
                'type': 'character',
                'description': 'Player character',
                'image': 'character.jpg'
            }
        ]
        
        url = reverse('get_game_resources')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['resources']), 2)
        self.assertEqual(response.data['resources'][0]['name'], 'Background')
        self.assertEqual(response.data['resources'][1]['name'], 'Character')
        mock_all.assert_called_once() 