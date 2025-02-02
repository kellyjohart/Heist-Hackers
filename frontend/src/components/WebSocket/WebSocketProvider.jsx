import React, { createContext, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { WS_CONFIG } from './webSocketConfig';

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [reconnectAttempt, setReconnectAttempt] = useState(0);

    useEffect(() => {
        const setupWebSocket = () => {
            const socket = new SockJS(WS_CONFIG.ENDPOINT);
            const client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000, // Wait 5 seconds before attempting to reconnect
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    console.log('Connected to WebSocket!');
                    setConnected(true);
                    setReconnectAttempt(0); // Reset reconnect attempts on successful connection
                },
                onDisconnect: () => {
                    console.log('Disconnected from WebSocket!');
                    setConnected(false);

                    // Attempt to reconnect if disconnected
                    if (reconnectAttempt < 5) { // Limit reconnection attempts
                        setTimeout(() => {
                            setReconnectAttempt(prev => prev + 1);
                            setupWebSocket();
                        }, 5000);
                    }
                },
                onError: (error) => {
                    console.error('WebSocket Error:', error);
                    setConnected(false);
                },
                onStompError: (frame) => {
                    console.error('STOMP protocol error:', frame);
                }
            });

            try {
                client.activate();
                setStompClient(client);
            } catch (error) {
                console.error('Error activating WebSocket client:', error);
            }

            return client;
        };

        const client = setupWebSocket();

        return () => {
            if (client) {
                try {
                    client.deactivate();
                } catch (error) {
                    console.error('Error deactivating WebSocket client:', error);
                }
            }
        };
    }, [reconnectAttempt]);

    const sendMessage = (destination, message) => {
        if (!stompClient || !connected) {
            console.error('Cannot send message: WebSocket is not connected');
            return false;
        }

        try {
            stompClient.publish({
                destination,
                body: JSON.stringify(message)
            });
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    };

    const subscribe = (topic, callback) => {
        if (!stompClient || !connected) {
            console.error('Cannot subscribe: WebSocket is not connected');
            return null;
        }

        try {
            const subscription = stompClient.subscribe(topic, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    callback(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            return subscription;
        } catch (error) {
            console.error('Error subscribing to topic:', error);
            return null;
        }
    };

    const value = {
        stompClient,
        connected,
        sendMessage,
        subscribe,
        reconnectAttempt
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}
