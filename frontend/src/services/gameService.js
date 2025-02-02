// frontend/src/services/gameService.js
const API_BASE_URL = 'http://localhost:8080/api';

export const gameService = {
    startGame: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/game/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error starting game:', error);
            throw error;
        }
    },

    updateDifficulty: async (newDifficulty) => {
        try {
            const response = await fetch(`${API_BASE_URL}/game/difficulty`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating difficulty:', error);
            throw error;
        }
    }
};
