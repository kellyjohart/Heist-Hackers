import { WS_CONFIG } from './webSocketConfig';

let stompClient = null;

export const setWebSocketInstance = (client) => {
    stompClient = client;
};

export const subscribe = (topic, callback) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP client not connected');
        return {
            unsubscribe: () => {}
        };
    }

    if (!Object.values(WS_CONFIG.TOPICS).includes(topic)) {
        console.warn(`Invalid topic: ${topic}`);
        return {
            unsubscribe: () => {}
        };
    }

    return stompClient.subscribe(topic, (message) => {
        try {
            const data = JSON.parse(message.body);
            callback(data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
};

export const sendMessage = (destination, message) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP client not connected');
        return;
    }

    if (!Object.values(WS_CONFIG.DESTINATIONS).includes(destination)) {
        console.warn(`Invalid destination: ${destination}`);
        return;
    }

    stompClient.publish({
        destination,
        body: JSON.stringify(message)
    });
};

export const connected = () => {
    return stompClient?.connected || false;
};

// Helper functions for specific game actions
export const createGame = (payload) => {
    sendMessage(WS_CONFIG.DESTINATIONS.CREATE, payload);
};

export const joinGame = (payload) => {
    sendMessage(WS_CONFIG.DESTINATIONS.JOIN, payload);
};

export const startGame = (payload) => {
    sendMessage(WS_CONFIG.DESTINATIONS.START, payload);
};

export const submitAnswer = (payload) => {
    sendMessage(WS_CONFIG.DESTINATIONS.ANSWER, payload);
};

export const timeUp = (payload) => {
    sendMessage(WS_CONFIG.DESTINATIONS.TIMEUP, payload);
};
