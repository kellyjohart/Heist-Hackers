// src/services/gameService.js
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
                },
                body: JSON.stringify({ difficulty: newDifficulty })
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