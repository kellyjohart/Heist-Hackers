import React, {useReducer, useEffect, useCallback} from 'react';
import { useWebSocket } from '../WebSocket/useWebSocket';
import  DifficultyIndicator  from '../DifficultyIndicator/DifficultyIndicator';
import  Question  from '../Question/Question';
import { gameReducer } from './gameReducer';
import {initialState as state, initialState} from './gameState';
import { WS_CONFIG } from '../WebSocket/webSocketConfig';
import './Game.css';
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

export const Game = () => {
    const { connected, sendMessage, subscribe } = useWebSocket();
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Error handling useEffect
    useEffect(() => {
        if (state.connectionError) {
            const timer = setTimeout(() => {
                dispatch({ type: 'SET_ERROR', payload: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [state.connectionError, dispatch]); // Add dispatch to dependency array

// Game updates useEffect
    useEffect(() => {
        if (connected && state.roomCode) {
            const subscription = subscribe(
                `${WS_CONFIG.TOPICS.GAME}/${state.roomCode}`,
                handleGameUpdate
            );
            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }
    }, [connected, state.roomCode, subscribe, handleGameUpdate]); // Add all dependencies


    // Handle game updates from server
    const handleGameUpdate = useCallback((update) => {
        if (update.question) {
            dispatch({ type: 'SET_QUESTION', payload: update.question });
        }
        if (update.players) {
            dispatch({ type: 'UPDATE_PLAYERS', payload: update.players });
        }
        if (update.gameState) {
            dispatch({ type: 'SET_GAME_STATE', payload: update.gameState });
        }
    }, [dispatch]);

};

    // Handle answer submission
    const handleAnswer = (answer) => {
        sendMessage(WS_CONFIG.DESTINATIONS.ANSWER, {
            roomCode: state.roomCode,
            playerName: state.playerName,
            answer
        });

        dispatch({ type: 'SUBMIT_ANSWER', payload: { correct: true } });
    };

    // Game management methods
    const createGame = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const newRoomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            dispatch({ type: 'SET_ROOM_CODE', payload: newRoomCode });
            dispatch({ type: 'SET_HOST', payload: true });

            await sendMessage(WS_CONFIG.DESTINATIONS.CREATE, {
                roomCode: newRoomCode,
                playerName: state.playerName
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to create game. Please try again.' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const joinGame = async (code) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            dispatch({ type: 'SET_ROOM_CODE', payload: code });
            await sendMessage(WS_CONFIG.DESTINATIONS.JOIN, {
                roomCode: code,
                playerName: state.playerName
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to join game. Please check the room code and try again.' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const startGame = async () => {
        if (state.isHost) {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                await sendMessage(WS_CONFIG.DESTINATIONS.START, {
                    roomCode: state.roomCode
                });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: 'Failed to start game. Please try again.' });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }
    };

    const handleTimeUp = () => {
        sendMessage(WS_CONFIG.DESTINATIONS.TIMEUP, {
            roomCode: state.roomCode,
            playerName: state.playerName
        });
    };

    return (
        <div className="game-container">
            {/* Connection Status */}
            <div className="connection-status">
                Status: {connected ? 'Connected' : 'Disconnected'}
            </div>

            {/* Error Messages */}
            {state.connectionError && (
                <div className="error-message">
                    {state.connectionError}
                </div>
            )}

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
                                        disabled={!connected || !state.playerName || state.isLoading}
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
                                            disabled={!connected || !state.playerName || !state.roomCode || state.isLoading}
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
                                            disabled={!connected || state.players.length < 1 || state.isLoading}
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
                                <button onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: 'easy' })}>
                                    Set Easy
                                </button>
                                <button onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: 'medium' })}>
                                    Set Medium
                                </button>
                                <button onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: 'hard' })}>
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
}

export default Game;
