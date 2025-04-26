import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true // This is important for CORS
});

export const startGame = async (playerId) => {
    try {
        const response = await api.post('/api/game/start/', { player_id: playerId });
        return response.data;
    } catch (error) {
        console.error('Error starting game:', error);
        throw error;
    }
};

export const updateGame = async (gameId, action, foodType) => {
    try {
        const response = await api.post('/api/game/update/', {
            game_id: gameId,
            action: action,
            food_type: foodType
        });
        return response.data;
    } catch (error) {
        console.error('Error updating game:', error);
        throw error;
    }
};

export const endGame = async (gameId) => {
    try {
        const response = await api.post('/api/game/end/', { game_id: gameId });
        return response.data;
    } catch (error) {
        // If the game end fails, just log the error and return a default response
        console.error('Error ending game:', error);
        return {
            score: 0,
            time_played: 0
        };
    }
};

export const getLeaderboard = async () => {
    try {
        const response = await api.get('/api/game/leaderboard/');
        return response.data;
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        throw error;
    }
};

export const getFoodItems = async () => {
    try {
        const response = await api.get('/api/game/food-items/');
        return response.data.food_items;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch food items');
    }
}; 