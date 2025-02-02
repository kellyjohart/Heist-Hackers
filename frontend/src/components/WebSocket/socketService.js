

let wsInstance = null;

export const setWebSocketInstance = (instance) => {
    wsInstance = instance;
};

export const subscribe = (topic, callback) => {
    if (!wsInstance) {
        console.warn('WebSocket instance not set');
        return {
            unsubscribe: () => {}
        };
    }

    // Add message listener
    const messageHandler = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.topic === topic) {
                callback(data.payload);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };

    wsInstance.addEventListener('message', messageHandler);

    // Return unsubscribe function
    return {
        unsubscribe: () => {
            wsInstance.removeEventListener('message', messageHandler);
        }
    };
};

export const sendMessage = (message) => {
    if (!wsInstance) {
        console.warn('WebSocket instance not set');
        return;
    }
    wsInstance.send(JSON.stringify(message));
};

export const connected = () => {
    return wsInstance?.readyState === WebSocket.OPEN;
};
