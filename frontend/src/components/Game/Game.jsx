import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../WebSocket/useWebSocket';
import { WS_CONFIG } from '../WebSocket/webSocketConfig';
import Question from '../Question/Question';
import PlayerList from '../PlayerList/PlayerList';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './Game.css';

function Game() {
    const { connected, subscribe, sendMessage } = useWebSocket();
    const [gameState, setGameState] = useState({
        roomCode: null,
        players: [],
        currentQuestion: null,
        isHost: false,
        timeLeft: 30,
        isLoading: false,
        playerName: ''
    });

    useEffect(() => {
        if (connected) {
            // Subscribe to game updates
            const gameSubscription = subscribe(WS_CONFIG.TOPICS.GAME, (data) => {
                console.log('Game update received:', data);
                handleGameUpdate(data);
            });

            // Subscribe to player updates
            const playerSubscription = subscribe(WS_CONFIG.TOPICS.PLAYER, (data) => {
                console.log('Player update received:', data);
                handlePlayerUpdate(data);
            });

            return () => {
                gameSubscription?.unsubscribe();
                playerSubscription?.unsubscribe();
            };
        }
    }, [connected, subscribe]);

    const handleGameUpdate = (data) => {
        switch (data.type) {
            case 'GAME_CREATED':
                setGameState(prev => ({
                    ...prev,
                    roomCode: data.roomCode,
                    isHost: true,
                    isLoading: false
                }));
                break;
            case 'GAME_JOINED':
                setGameState(prev => ({
                    ...prev,
                    roomCode: data.roomCode,
                    players: data.players,
                    isLoading: false
                }));
                break;
            case 'GAME_STARTED':
                setGameState(prev => ({
                    ...prev,
                    currentQuestion: data.question,
                    timeLeft: 30
                }));
                break;
            case 'QUESTION_TIMEOUT':
                setGameState(prev => ({
                    ...prev,
                    timeLeft: 0
                }));
                break;
            default:
                console.log('Unknown game update type:', data.type);
        }
    };

    const handlePlayerUpdate = (data) => {
        setGameState(prev => ({
            ...prev,
            players: data.players
        }));
    };

    const createGame = () => {
        setGameState(prev => ({ ...prev, isLoading: true }));
        sendMessage(WS_CONFIG.DESTINATIONS.CREATE, {
            playerName: gameState.playerName
        });
    };

    const joinGame = () => {
        setGameState(prev => ({ ...prev, isLoading: true }));
        sendMessage(WS_CONFIG.DESTINATIONS.JOIN, {
            roomCode: gameState.roomCode,
            playerName: gameState.playerName
        });
    };

    const startGame = () => {
        sendMessage(WS_CONFIG.DESTINATIONS.START, {
            roomCode: gameState.roomCode
        });
    };

    const handleAnswer = (answer) => {
        sendMessage(WS_CONFIG.DESTINATIONS.ANSWER, {
            roomCode: gameState.roomCode,
            playerName: gameState.playerName,
            answer
        });
    };

    if (gameState.isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="game-container">
            {!gameState.roomCode ? (
                <div className="join-screen">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={gameState.playerName}
                        onChange={(e) => setGameState(prev => ({
                            ...prev,
                            playerName: e.target.value
                        }))}
                    />
                    <button
                        onClick={createGame}
                        disabled={!connected || !gameState.playerName}
                    >
                        Create Game
                    </button>
                    <div>
                        <input
                            type="text"
                            placeholder="Enter room code"
                            onChange={(e) => setGameState(prev => ({
                                ...prev,
                                roomCode: e.target.value
                            }))}
                        />
                        <button
                            onClick={joinGame}
                            disabled={!connected || !gameState.playerName || !gameState.roomCode}
                        >
                            Join Game
                        </button>
                    </div>
                </div>
            ) : !gameState.currentQuestion ? (
                <div className="waiting-room">
                    <h2>Room Code: {gameState.roomCode}</h2>
                    <PlayerList players={gameState.players} />
                    {gameState.isHost && (
                        <button
                            onClick={startGame}
                            disabled={gameState.players.length < 2}
                        >
                            Start Game
                        </button>
                    )}
                </div>
            ) : (
                <div className="game-play">
                    <Question
                        question={gameState.currentQuestion}
                        onAnswer={handleAnswer}
                        timeLeft={gameState.timeLeft}
                    />
                    <PlayerList players={gameState.players} />
                </div>
            )}
        </div>
    );
}

export default Game;
