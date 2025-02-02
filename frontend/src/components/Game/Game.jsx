import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { WebSocketContext } from '../WebSocket/WebSocketProvider';
import { UserContext } from '../../context/UserContext';
import PlayerList from '../PlayerList/PlayerList';
import Timer from '../Timer/Timer';
import './Game.css';

const Game = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const { username } = useContext(UserContext);
    const { connected, sendMessage, subscribe } = useContext(WebSocketContext);
    const isHost = location.state?.isHost || false;

    const [players, setPlayers] = useState([]);
    const [gameStatus, setGameStatus] = useState('waiting');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(30);

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
                setPlayers(message.players);
                break;
            case 'GAME_STARTED':
                setGameStatus('active');
                break;
            case 'NEW_QUESTION':
                setCurrentQuestion(message.question);
                setTimeRemaining(30); // Reset timer for new question
                break;
            case 'GAME_ENDED':
                setGameStatus('finished');
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    };

    const handlePlayerMessage = (message) => {
        switch (message.type) {
            case 'SCORE_UPDATE':
                setScore(message.score);
                break;
            default:
                console.log('Unknown player message:', message.type);
        }
    };

    const handleStartGame = () => {
        if (connected && isHost) {
            sendMessage('/app/start', {
                roomId
            });
        }
    };

    const handleAnswer = (answer) => {
        if (connected && gameStatus === 'active') {
            sendMessage('/app/answer', {
                roomId,
                username,
                answer,
                timeRemaining
            });
        }
    };

    return (
        <div className="game-container">
            <div className="game-header">
                <div className="room-info">
                    <h2>Room: {roomId}</h2>
                    <p className="player-info">
                        Player: {username} {isHost && '(Host)'}
                    </p>
                    <p className="score">Score: {score}</p>
                </div>

                <PlayerList players={players} currentPlayer={username} />
            </div>

            <div className="game-content">
                {!connected && (
                    <div className="connection-warning">
                        Connecting to server...
                    </div>
                )}

                {connected && gameStatus === 'waiting' && (
                    <div className="waiting-room">
                        {isHost ? (
                            <button
                                className="start-button"
                                onClick={handleStartGame}
                                disabled={players.length < 2}
                            >
                                Start Game
                            </button>
                        ) : (
                            <div className="waiting-message">
                                <p>Waiting for host to start the game...</p>
                                <p>Players needed: {Math.max(0, 2 - players.length)}</p>
                            </div>
                        )}
                    </div>
                )}

                {connected && gameStatus === 'active' && currentQuestion && (
                    <div className="question-container">
                        <Timer
                            duration={30}
                            timeRemaining={timeRemaining}
                            setTimeRemaining={setTimeRemaining}
                        />
                        <h3 className="question-text">{currentQuestion.text}</h3>
                        <div className="answers-grid">
                            {currentQuestion.answers.map((answer, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(answer)}
                                    className="answer-button"
                                    disabled={timeRemaining === 0}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {connected && gameStatus === 'finished' && (
                    <div className="game-over">
                        <h2>Game Over!</h2>
                        <div className="final-scores">
                            <h3>Final Scores:</h3>
                            {players
                                .sort((a, b) => b.score - a.score)
                                .map((player, index) => (
                                    <div key={index} className="score-entry">
                                        {index + 1}. {player.username}: {player.score}
                                    </div>
                                ))
                            }
                        </div>
                        {isHost && (
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
