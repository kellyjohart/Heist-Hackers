import React, { useEffect, useReducer } from 'react';
import { useWebSocket } from '../WebSocket/useWebSocket';
import { WS_CONFIG } from '../WebSocket/webSocketConfig';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import PlayerList from '../PlayerList/PlayerList';
import Question from '../Question/Question'; // Changed from QuestionDisplay to Question
import { gameReducer, initialState } from './gameState';
import './Game.css';


function Game() {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { connected, subscribe, sendMessage } = useWebSocket();

    useEffect(() => {
        if (connected) {
            const gameSubscription = subscribe(WS_CONFIG.TOPICS.GAME, (data) => {
                console.log('Game update received:', data);
                // Handle different types of game updates
                switch (data.type) {
                    case 'GAME_CREATED':
                        dispatch({ type: 'SET_ROOM_CODE', payload: data.roomCode });
                        dispatch({ type: 'SET_PLAYER_LIST', payload: data.players });
                        break;
                    case 'PLAYER_JOINED':
                        dispatch({ type: 'SET_PLAYER_LIST', payload: data.players });
                        break;
                    case 'GAME_STARTED':
                        dispatch({ type: 'SET_GAME_STATE', payload: 'PLAYING' });
                        dispatch({ type: 'SET_CURRENT_QUESTION', payload: data.question });
                        break;
                    // Add more cases as needed
                }
            });

            return () => {
                gameSubscription?.unsubscribe();
            };
        }
    }, [connected, subscribe]);

    const createGame = () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        sendMessage(WS_CONFIG.DESTINATIONS.CREATE, {
            playerName: state.playerName
        });
    };

    const joinGame = (roomCode) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        sendMessage(WS_CONFIG.DESTINATIONS.JOIN, {
            roomCode,
            playerName: state.playerName
        });
    };

    const startGame = () => {
        sendMessage(WS_CONFIG.DESTINATIONS.START, {
            roomCode: state.roomCode
        });
    };

    const submitAnswer = (answer) => {
        sendMessage(WS_CONFIG.DESTINATIONS.ANSWER, {
            roomCode: state.roomCode,
            playerName: state.playerName,
            answer
        });
    };

    const handleTimeUp = () => {
        sendMessage(WS_CONFIG.DESTINATIONS.TIMEUP, {
            roomCode: state.roomCode,
            playerName: state.playerName
        });
    };

    return (
        <div className="game-container">
            {state.isLoading ? (
                <LoadingSpinner />
            ) : (
                <div>
                    {state.gameState === 'WAITING' ? (
                        <div className="lobby">
                            {!state.roomCode ? (
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
                                <div className="waiting-room">
                                    <h2>Room Code: {state.roomCode}</h2>
                                    <PlayerList players={state.players} />
                                    {state.isHost && (
                                        <button
                                            onClick={startGame}
                                            disabled={state.players.length < 2}
                                        >
                                            Start Game
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="game-play">
                            <Question
                                question={state.currentQuestion}
                                onAnswer={submitAnswer}
                                timeLeft={state.timeLeft} // Make sure this is managed in your state
                            />
                            <PlayerList players={state.players} />
                        </div>

                    )}
                </div>
            )}
        </div>
    );
}

export default Game;
