export const gameReducer = (state, action) => {
    switch (action.type) {
        case 'SET_QUESTION':
            return {
                ...state,
                currentQuestion: action.payload
            };

        case 'UPDATE_SCORE':
            return {
                ...state,
                score: state.score + action.payload
            };

        case 'INCREMENT_CORRECT_ANSWERS':
            return {
                ...state,
                correctAnswers: state.correctAnswers + 1,
                difficulty: state.correctAnswers + 1 > state.totalQuestions * 0.8
                    ? 'hard'
                    : state.correctAnswers + 1 > state.totalQuestions / 2
                        ? 'medium'
                        : state.difficulty
            };

        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload
            };

        case 'SET_ERROR':
            return {
                ...state,
                connectionError: action.payload
            };

        case 'SET_ROOM_CODE':
            return {
                ...state,
                roomCode: action.payload
            };

        case 'UPDATE_PLAYERS':
            return {
                ...state,
                players: action.payload
            };

        case 'SET_GAME_STATE':
            return {
                ...state,
                gameState: action.payload
            };

        case 'SET_HOST':
            return {
                ...state,
                isHost: action.payload
            };

        case 'SET_PLAYER_NAME':
            return {
                ...state,
                playerName: action.payload
            };

        case 'UPDATE_TIME':
            return {
                ...state,
                timeLeft: action.payload
            };

        case 'SUBMIT_ANSWER':
            return {
                ...state,
                score: state.score + (action.payload.correct ? 10 : 0),
                correctAnswers: state.correctAnswers + (action.payload.correct ? 1 : 0),
                lastAnswerCorrect: action.payload.correct
            };

        case 'RESET_GAME':
            return {
                ...state,
                score: 0,
                correctAnswers: 0,
                timeLeft: 30,
                currentQuestion: null,
                gameState: 'WAITING'
            };

        case 'SET_DIFFICULTY':
            return {
                ...state,
                difficulty: action.payload
            };

        default:
            return state;
    }
};
