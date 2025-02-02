export const initialState = {
    currentQuestion: {
        text: "",
        answers: [],
        correctAnswer: ""
    },
    score: 0,
    correctAnswers: 0,
    totalQuestions: 10,
    difficulty: 'easy',
    timeLeft: 30,
    isLoading: false,
    connectionError: '',
    roomCode: '',
    players: [],
    gameState: 'WAITING',
    isHost: false,
    playerName: ''
};
