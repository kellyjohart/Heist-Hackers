import React from 'react';
import Game from './components/Game/Game';
import { WebSocketProvider } from './websocket/WebSocketProvider';
import './App.css';

function App() {
    return (
        <WebSocketProvider>
            <div className="App">
                <header className="App-header">
                    <h1>Heist Hackers</h1>
                </header>
                <main>
                    <Game />
                </main>
            </div>
        </WebSocketProvider>
    );
}

export default App;
