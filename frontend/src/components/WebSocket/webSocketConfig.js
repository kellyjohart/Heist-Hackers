// src/components/WebSocket/webSocketConfig.js
export const WS_CONFIG = {
    ENDPOINT: 'http://localhost:8080/ws',
    TOPICS: {
        GAME: '/topic/game',
        PLAYER: '/topic/player',
        ROOM: (roomId) => `/topic/room/${roomId}`,
        SCORE: '/topic/score',
        playerJoin(roomId) {
            return `/topic/room/${roomId}/players`;
        }
    },
    DESTINATIONS: {
        CREATE: '/app/create',
        JOIN: '/app/join',
        START: '/app/start',
        ANSWER: '/app/answer',
        TIMEUP: '/app/timeup',
        LEAVE: '/app/leave'
    },
    MESSAGE_TYPES: {
        // Game state messages
        GAME_CREATED: 'GAME_CREATED',
        PLAYER_JOINED: 'PLAYER_JOINED',
        GAME_STARTED: 'GAME_STARTED',
        NEW_QUESTION: 'NEW_QUESTION',
        ANSWER_SUBMITTED: 'ANSWER_SUBMITTED',
        TIME_UP: 'TIME_UP',
        GAME_OVER: 'GAME_OVER',

        // Player-specific messages
        SCORE_UPDATE: 'SCORE_UPDATE',
        PLAYER_LEFT: 'PLAYER_LEFT',

        // Error messages
        ERROR: 'ERROR',
        ROOM_FULL: 'ROOM_FULL',
        INVALID_ROOM: 'INVALID_ROOM'
    },
    GAME_STATES: {
        WAITING: 'WAITING',
        PLAYING: 'PLAYING',
        QUESTION: 'QUESTION',
        ANSWER_REVIEW: 'ANSWER_REVIEW',
        FINISHED: 'FINISHED'
    },
    TIMEOUTS: {
        QUESTION: 30000, // 30 seconds for each question
        ANSWER_REVIEW: 5000, // 5 seconds to show correct answer
        RECONNECT: 5000 // 5 seconds between reconnection attempts
    }
};
