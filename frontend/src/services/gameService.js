import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

export const updateGame = async (gameId, action, foodType, diy_option) => {
    try {
        const response = await api.post('/api/game/update/', {
            game_id: gameId,
            action: action,
            food_type: foodType,
            diy_option: diy_option
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

export const getGameResources = async () => {
    try {
        const response = await api.get('/api/game/resources/');
        
        // Process resources for easy access
        const processedResources = response.data;
        
        // Verify resources structure
        if (!processedResources.resources || !Array.isArray(processedResources.resources)) {
            console.warn('Invalid resources format from API:', processedResources);
            processedResources.resources = [];
        }
        
        // Create processed map with normalized resource names
        const resourcesMap = {};
        processedResources.resources.forEach(resource => {
            resourcesMap[resource.name] = resource;
            resourcesMap[resource.name.toLowerCase()] = resource;
        });
        
        const specificResources = {
            background: resourcesMap["background"], 
            map1: resourcesMap["map1"] || resourcesMap["Map1"] || resourcesMap["MAP1"],  // Try different cases for map1
            foodbank: resourcesMap["Food Bank"],
            greenbin: resourcesMap["Green waste bin"],
            diy: resourcesMap["DIY"],
            landfill: resourcesMap["Landfill"],
            bush: resourcesMap["Bush"],
            result_bg: resourcesMap["Result_BG"] || resourcesMap["result_bg"] || resourcesMap["Rusult_BG"], 
        };
        
        // Add the specific resources to the processed data
        processedResources.specificResources = specificResources;
        
        return processedResources;
    } catch (error) {
        console.error('Failed to fetch game resources:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch game resources');
    }
}; 