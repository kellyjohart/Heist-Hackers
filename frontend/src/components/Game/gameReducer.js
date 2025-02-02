// src/components/Game/gameReducer.js

export const initialGameState = {
    currentQuestion: null,
    score: 0,
    correctAnswers: 0,
    totalQuestions: 10,
    isLoading: false,
    connectionError: null,
    roomCode: null,
    players: [],
    gameState: 'WAITING', // WAITING, PLAYING, FINISHED
    isHost: false,
    playerName: '',
    timeLeft: 30,
    lastAnswerCorrect: null,
    difficulty: 'easy' // easy, medium, hard
};

const calculatePoints = (timeLeft, difficulty) => {
    const basePoints = 10;
    const timeBonus = Math.floor(timeLeft / 3);
    const difficultyMultiplier =
        difficulty === 'hard' ? 2.0 :
            difficulty === 'medium' ? 1.5 :
                1.0;

    return Math.floor((basePoints + timeBonus) * difficultyMultiplier);
};

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

        case 'SUBMIT_ANSWER': {
            const isCorrect = action.payload.correct;
            const pointsEarned = isCorrect ? calculatePoints(state.timeLeft, state.difficulty) : 0;

            return {
                ...state,
                score: state.score + pointsEarned,
                correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
                lastAnswerCorrect: isCorrect
            };
        }

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

export const gameActions = {
    setQuestion: (question) => ({
        type: 'SET_QUESTION',
        payload: question
    }),

    updateScore: (points) => ({
        type: 'UPDATE_SCORE',
        payload: points
    }),

    submitAnswer: (correct, timeLeft) => ({
        type: 'SUBMIT_ANSWER',
        payload: { correct, timeLeft }
    }),

    updatePlayers: (players) => ({
        type: 'UPDATE_PLAYERS',
        payload: players
    }),

    setGameState: (state) => ({
        type: 'SET_GAME_STATE',
        payload: state
    }),

    resetGame: () => ({
        type: 'RESET_GAME'
    }),

    setDifficulty: (difficulty) => ({
        type: 'SET_DIFFICULTY',
        payload: difficulty
    }),

    updateTime: (time) => ({
        type: 'UPDATE_TIME',
        payload: time
    }),

    setLoading: (isLoading) => ({
        type: 'SET_LOADING',
        payload: isLoading
    }),

    setError: (error) => ({
        type: 'SET_ERROR',
        payload: error
    }),

    setRoomCode: (code) => ({
        type: 'SET_ROOM_CODE',
        payload: code
    }),

    setHost: (isHost) => ({
        type: 'SET_HOST',
        payload: isHost
    }),

    setPlayerName: (name) => ({
        type: 'SET_PLAYER_NAME',
        payload: name
    }),

    incrementCorrectAnswers: () => ({
        type: 'INCREMENT_CORRECT_ANSWERS'
    })
};
