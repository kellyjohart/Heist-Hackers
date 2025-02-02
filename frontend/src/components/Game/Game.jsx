import React, { useEffect, useReducer, useCallback } from 'react';
import { initialState } from './gameState';
import { gameReducer } from './gameReducer';
import { useWebSocket } from '../WebSocket/useWebSocket';
import { setWebSocketInstance, subscribe, sendMessage, connected } from '../WebSocket/socketService';
import  LoadingSpinner  from '../LoadingSpinner/LoadingSpinner';
import  DifficultyIndicator  from '../DifficultyIndicator/DifficultyIndicator';
import  Question  from '../Question/Question';
import './Game.css';

export const Game = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const ws = useWebSocket();

    // Set WebSocket instance when available
    useEffect(() => {
        if (ws) {
            setWebSocketInstance(ws);
        }
    }, [ws]);

    // Handle game updates
    const handleGameUpdate = useCallback((message) => {
        dispatch({ type: 'UPDATE_GAME', payload: message });
    }, []);

    useEffect(() => {
        if (connected() && state.roomCode) {
            const subscription = subscribe(`game/${state.roomCode}`, handleGameUpdate);
            return () => subscription.unsubscribe();
        }
    }, [state.roomCode, handleGameUpdate]);

    useEffect(() => {
        if (state.connectionError) {
            alert('Connection error occurred. Please try again.');
        }
    }, [state.connectionError]);

    const handleAnswer = (answer) => {
        sendMessage({ type: 'ANSWER', payload: { answer, roomCode: state.roomCode } });
    };

    const createGame = () => {
        sendMessage({ type: 'CREATE_GAME' });
    };

    const joinGame = (roomCode) => {
        if (roomCode) {
            sendMessage({ type: 'JOIN_GAME', payload: { roomCode } });
        }
    };

    const startGame = () => {
        sendMessage({ type: 'START_GAME', payload: { roomCode: state.roomCode } });
    };

    const handleTimeUp = () => {
        sendMessage({ type: 'TIME_UP', payload: { roomCode: state.roomCode } });
    };

    return (
        <div className="game-container">
            {state.isLoading ? (
                <LoadingSpinner />
            ) : (
                <div>
                    {state.gameState === 'WAITING' ? (
                        // Lobby view
                        <div className="lobby">
                            {!state.roomCode ? (
                                // Initial join screen
                                <div className="join-screen">
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={state.playerName}
                                        onChange={(e) => dispatch({
                                            type: 'SET_PLAYER_NAME',
                                            payload: e.target.value
                                        })}
                                        disabled={state.isLoading}
                                    />
                                    <button
                                        onClick={createGame}
                                        disabled={!connected() || !state.playerName || state.isLoading}
                                        className={state.isLoading ? 'button-loading' : ''}
                                    >
                                        {state.isLoading ? 'Creating...' : 'Create Game'}
                                    </button>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Enter room code"
                                            onChange={(e) => dispatch({
                                                type: 'SET_ROOM_CODE',
                                                payload: e.target.value
                                            })}
                                            disabled={state.isLoading}
                                        />
                                        <button
                                            onClick={() => joinGame(state.roomCode)}
                                            disabled={!connected() || !state.playerName || !state.roomCode || state.isLoading}
                                            className={state.isLoading ? 'button-loading' : ''}
                                        >
                                            {state.isLoading ? 'Joining...' : 'Join Game'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Waiting room
                                <div className="waiting-room">
                                    <h2>Room Code: {state.roomCode}</h2>
                                    <div className="players-list">
                                        {state.players.map(player => (
                                            <div key={player.name}>{player.name}</div>
                                        ))}
                                    </div>
                                    {state.isHost && (
                                        <button
                                            onClick={startGame}
                                            disabled={!connected() || state.players.length < 1 || state.isLoading}
                                            className={state.isLoading ? 'button-loading' : ''}
                                        >
                                            {state.isLoading ? 'Starting...' : 'Start Game'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Game view
                        <>
                            <DifficultyIndicator difficulty={state.difficulty} />

                            <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <button onClick={() => {
                                    dispatch({
                                        type: 'SET_DIFFICULTY',
                                        payload: 'easy'
                                    });
                                }}>
                                    Set Easy
                                </button>
                                <button onClick={() => {
                                    dispatch({
                                        type: 'SET_DIFFICULTY',
                                        payload: 'medium'
                                    });
                                }}>
                                    Set Medium
                                </button>
                                <button onClick={() => {
                                    dispatch({
                                        type: 'SET_DIFFICULTY',
                                        payload: 'hard'
                                    });
                                }}>
                                    Set Hard
                                </button>
                            </div>

                            <div className="game-stats">
                                <p>Score: {state.score}</p>
                                <p>Correct Answers: {state.correctAnswers} / {state.totalQuestions}</p>
                            </div>
                            {state.currentQuestion && (
                                <Question
                                    question={state.currentQuestion}
                                    onAnswer={handleAnswer}
                                    timeLeft={state.timeLeft}
                                    onTimeUp={handleTimeUp}
                                />
                            )}
                        </>

                    )}
                </div>
            )}
        </div>
    );
};

export default Game;
