import React, { useContext, useEffect, useReducer } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { WebSocketContext } from '../WebSocket/WebSocketProvider';
import { UserContext } from '../../context/UserContext';
import { gameReducer, initialGameState, gameActions } from './gameReducer';
import PlayerList from '../PlayerList/PlayerList';
import Timer from '../Timer/Timer';
import { WS_CONFIG } from '../WebSocket/webSocketConfig';
import './Game.css';

const Game = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const { username } = useContext(UserContext);
    const { connected, sendMessage, subscribe } = useContext(WebSocketContext);
    const isHost = location.state?.isHost || false;

    const [state, dispatch] = useReducer(gameReducer, {
        ...initialGameState,
        isHost,
        playerName: username,
        roomCode: roomId
    });

    // Handle game-related WebSocket messages
    const handleGameMessage = (message) => {
        switch (message.type) {
            case WS_CONFIG.MESSAGE_TYPES.PLAYER_JOINED:
                dispatch(gameActions.updatePlayers(message.players));
                break;
            case WS_CONFIG.MESSAGE_TYPES.GAME_STARTED:
                dispatch(gameActions.setGameState(WS_CONFIG.GAME_STATES.PLAYING));
                break;
            case WS_CONFIG.MESSAGE_TYPES.NEW_QUESTION:
                dispatch(gameActions.setQuestion(message.question));
                dispatch(gameActions.updateTime(WS_CONFIG.TIMEOUTS.QUESTION / 1000)); // Convert to seconds
                break;
            case WS_CONFIG.MESSAGE_TYPES.ANSWER_SUBMITTED:
                dispatch(gameActions.updatePlayerAnswer({
                    playerId: message.playerId,
                    answer: message.answer
                }));
                break;
            case WS_CONFIG.MESSAGE_TYPES.TIME_UP:
                dispatch(gameActions.setGameState(WS_CONFIG.GAME_STATES.ANSWER_REVIEW));
                break;
            case WS_CONFIG.MESSAGE_TYPES.SCORE_UPDATE:
                dispatch(gameActions.updateScores(message.scores));
                break;
            case WS_CONFIG.MESSAGE_TYPES.GAME_OVER:
                dispatch(gameActions.setGameState(WS_CONFIG.GAME_STATES.FINISHED));
                dispatch(gameActions.setFinalScores(message.finalScores));
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    };

    // Subscribe to WebSocket topics when connected
    useEffect(() => {
        if (connected) {
            // Subscribe to room events
            const roomSubscription = subscribe(
                WS_CONFIG.TOPICS.ROOM(roomId),
                handleGameMessage
            );

            // Subscribe to player-specific events
            const playerSubscription = subscribe(
                WS_CONFIG.TOPICS.PLAYER,
                (message) => {
                    if (message.type === WS_CONFIG.MESSAGE_TYPES.SCORE_UPDATE) {
                        dispatch(gameActions.updatePlayerScore({
                            playerId: username,
                            score: message.score
                        }));
                    }
                }
            );

            // Join room
            sendMessage(WS_CONFIG.DESTINATIONS.JOIN, {
                roomId,
                username,
                isHost
            });

            return () => {
                roomSubscription?.unsubscribe();
                playerSubscription?.unsubscribe();
                // Send leave message when component unmounts
                sendMessage(WS_CONFIG.DESTINATIONS.LEAVE, {
                    roomId,
                    username
                });
            };
        }
    }, [connected, roomId, username, isHost]);

    // Handle game start
    const handleStartGame = () => {
        if (connected && state.isHost) {
            sendMessage(WS_CONFIG.DESTINATIONS.START, {
                roomId
            });
        }
    };

    // Handle answer submission
    const handleAnswer = (answer) => {
        if (connected && state.gameState === WS_CONFIG.GAME_STATES.PLAYING) {
            sendMessage(WS_CONFIG.DESTINATIONS.ANSWER, {
                roomId,
                username,
                answer,
                timeLeft: state.timeLeft
            });
        }
    };

    // Handle timer completion
    const handleTimeUp = () => {
        if (connected && state.isHost) {
            sendMessage(WS_CONFIG.DESTINATIONS.TIMEUP, {
                roomId
            });
        }
    };

    return (
        <div className="game-container">
            <div className="game-header">
                <div className="room-info">
                    <h2>Room: {state.roomCode}</h2>
                    <p className="player-info">
                        Player: {state.playerName} {state.isHost && '(Host)'}
                    </p>
                    <p className="score">Score: {state.score}</p>
                </div>

                <PlayerList players={state.players} currentPlayer={state.playerName} />
            </div>

            <div className="game-content">
                {!connected && (
                    <div className="connection-warning">
                        Connecting to server...
                    </div>
                )}

                {connected && state.gameState === WS_CONFIG.GAME_STATES.WAITING && (
                    <div className="waiting-room">
                        {state.isHost ? (
                            <button
                                className="start-button"
                                onClick={handleStartGame}
                                disabled={state.players.length < 2}
                            >
                                Start Game
                            </button>
                        ) : (
                            <div className="waiting-message">
                                <p>Waiting for host to start the game...</p>
                                <p>Players needed: {Math.max(0, 2 - state.players.length)}</p>
                            </div>
                        )}
                    </div>
                )}

                {connected && state.gameState === WS_CONFIG.GAME_STATES.PLAYING && state.currentQuestion && (
                    <div className="question-container">
                        <Timer
                            duration={WS_CONFIG.TIMEOUTS.QUESTION / 1000}
                            timeRemaining={state.timeLeft}
                            onTimeUp={handleTimeUp}
                            setTimeRemaining={(time) => dispatch(gameActions.updateTime(time))}
                        />
                        <h3 className="question-text">{state.currentQuestion.text}</h3>
                        <div className="answers-grid">
                            {state.currentQuestion.answers.map((answer, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(answer)}
                                    className="answer-button"
                                    disabled={state.timeLeft === 0}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {state.gameState === WS_CONFIG.GAME_STATES.FINISHED && (
                    <div className="game-over">
                        <h2>Game Over!</h2>
                        <div className="final-scores">
                            {state.players
                                .sort((a, b) => b.score - a.score)
                                .map((player, index) => (
                                    <div key={index} className="score-entry">
                                        {index + 1}. {player.username}: {player.score}
                                    </div>
                                ))}
                        </div>
                        {state.isHost && (
                            <button
                                onClick={handleStartGame}
                                className="start-button"
                            >
                                Play Again
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Game;
