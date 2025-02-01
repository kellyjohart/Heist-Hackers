// src/components/ConnectionStatus/ConnectionStatus.jsx
import React from 'react';
import { useWebSocket } from '../../websocket/useWebSocket';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
    const { connected } = useWebSocket();

    return (
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
    );
};

export default ConnectionStatus;
