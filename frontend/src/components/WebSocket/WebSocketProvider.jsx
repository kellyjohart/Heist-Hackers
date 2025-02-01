import React, { createContext, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { WS_CONFIG } from './webSocketConfig';

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = new SockJS(WS_CONFIG.ENDPOINT);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket!');
                setConnected(true);
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket!');
                setConnected(false);
            },
            onError: (error) => {
                console.error('WebSocket Error:', error);
                setConnected(false);
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);

    const sendMessage = (destination, message) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination,
                body: JSON.stringify(message)
            });
        }
    };

    const subscribe = (topic, callback) => {
        if (stompClient && stompClient.connected) {
            return stompClient.subscribe(topic, (message) => {
                const data = JSON.parse(message.body);
                callback(data);
            });
        }
        return null;
    };

    return (
        <WebSocketContext.Provider value={{ stompClient, connected, sendMessage, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}
