const API_BASE_URL = 'http://localhost:8080/api';

export const scoreService = {
    updateScore: async (score) => {
        try {
            const response = await fetch(`${API_BASE_URL}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating score:', error);
            throw error;
        }
    },

    getHighScores: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/scores/high`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching high scores:', error);
            throw error;
        }
    }
};