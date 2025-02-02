import React from 'react';
import Game from './components/Game/Game';
import { WebSocketProvider } from './components/WebSocket/WebSocketProvider';  // Update this path
import './App.css';

function App() {
    return (
        <WebSocketProvider>
            <div className="App">
                <header className="App-header">
                    <h1>Heist Hackers</h1>
                </header>
                <main>
                    <Game/>
                </main>
            </div>
        </WebSocketProvider>
    );
}
