// src/services/questionService.js

const API_BASE_URL = 'http://localhost:8080/api';

export const questionService = {
    getNextQuestion: async (difficulty) => {
        try {
            const response = await fetch(`${API_BASE_URL}/questions/next?difficulty=${difficulty}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching question:', error);
            throw error;
        }
    },

    checkAnswer: async (questionId, answer) => {
        try {
            const response = await fetch(`${API_BASE_URL}/questions/${questionId}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(answer)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error checking answer:', error);
            throw error;
        }
    }
};
