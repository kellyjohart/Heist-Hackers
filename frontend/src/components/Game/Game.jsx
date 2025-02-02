import React, { useContext, useEffect, useReducer } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { WebSocketContext } from '../WebSocket/WebSocketProvider';
import { UserContext } from '../../context/UserContext';
import { gameReducer, initialGameState, gameActions } from './gameReducer';
import PlayerList from '../PlayerList/PlayerList';
import Timer from '../Timer/Timer';
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

    useEffect(() => {
        if (connected) {
            // Subscribe to room events
            const roomSubscription = subscribe(`/topic/room/${roomId}`, (data) => {
                handleGameMessage(data);
            });

            // Subscribe to player-specific events
            const playerSubscription = subscribe(`/user/queue/player`, (data) => {
                handlePlayerMessage(data);
            });

            // Join room
            sendMessage('/app/join', {
                roomId,
                username,
                isHost
            });

            return () => {
                if (roomSubscription) roomSubscription.unsubscribe();
                if (playerSubscription) playerSubscription.unsubscribe();
            };
        }
    }, [connected, roomId, username, isHost]);

    const handleGameMessage = (message) => {
        switch (message.type) {
            case 'PLAYER_JOINED':
                dispatch(gameActions.updatePlayers(message.players));
                break;
            case 'GAME_STARTED':
                dispatch(gameActions.setGameState('PLAYING'));
                break;
            case 'NEW_QUESTION':
                dispatch(gameActions.setQuestion(message.question));
                dispatch(gameActions.updateTime(30)); // Reset timer for new question
                break;
            case 'GAME_ENDED':
                dispatch(gameActions.setGameState('FINISHED'));
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    };

    const handlePlayerMessage = (message) => {
        switch (message.type) {
            case 'SCORE_UPDATE':
                dispatch(gameActions.updateScore(message.score));
                break;
            case 'ANSWER_RESULT':
                dispatch(gameActions.submitAnswer(message.correct, state.timeLeft));
                break;
            default:
                console.log('Unknown player message:', message.type);
        }
    };

    const handleStartGame = () => {
        if (connected && state.isHost) {
            sendMessage('/app/start', {
                roomId
            });
            dispatch(gameActions.resetGame());
            dispatch(gameActions.setGameState('PLAYING'));
        }
    };

    const handleAnswer = (answer) => {
        if (connected && state.gameState === 'PLAYING') {
            sendMessage('/app/answer', {
                roomId,
                username,
                answer,
                timeLeft: state.timeLeft
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

                {connected && state.gameState === 'WAITING' && (
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

                {connected && state.gameState === 'PLAYING' && state.currentQuestion && (
                    <div className="question-container">
                        <Timer
                            duration={30}
                            timeRemaining={state.timeLeft}
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

                {state.gameState === 'FINISHED' && (
                    <div className="game-over">
                        <h2>Game Over!</h2>
                        <div className="final-scores">
                            <h3>Final Scores:</h3>
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
