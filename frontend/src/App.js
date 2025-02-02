import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Game from './components/Game/Game';
import Home from './components/Home/Home';
import { WebSocketProvider } from './components/WebSocket/WebSocketProvider';
import { UserProvider } from './context/UserContext';
import './App.css';

function App() {
    return (
        <UserProvider>
            <WebSocketProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            <Route path="/" element={
                                <div className="App">
                                    <header className="App-header">
                                        <h1>Heist Hackers</h1>
                                    </header>
                                    <main>
                                        <Home />
                                    </main>
                                </div>
                            } />
                            <Route path="/game/:roomId" element={
                                <div className="App">
                                    <header className="App-header">
                                        <h1>Heist Hackers</h1>
                                    </header>
                                    <main>
                                        <Game />
                                    </main>
                                </div>
                            } />
                        </Routes>
                    </div>
                </Router>
            </WebSocketProvider>
        </UserProvider>
    );
}

export default App;
