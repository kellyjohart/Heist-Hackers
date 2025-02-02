export const WS_CONFIG = {
    ENDPOINT: 'http://localhost:8080/ws',
    TOPICS: {
        GAME: '/topic/game',
        PLAYER: '/topic/player',
        playerJoin() {

        }
    },
    DESTINATIONS: {
        CREATE: '/app/create',
        JOIN: '/app/join',
        START: '/app/start',
        ANSWER: '/app/answer',
        TIMEUP: '/app/timeup'
    }
};
