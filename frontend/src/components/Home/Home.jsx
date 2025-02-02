import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { WebSocketContext } from '../../context/WebSocketContext';
import { UserContext } from '../../context/UserContext';
import './Game.css';

const Game = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const { username } = useContext(UserContext);
    const { stompClient } = useContext(WebSocketContext);
    const isHost = location.state?.isHost || false;

    const [players, setPlayers] = useState([]);
    const [gameStatus, setGameStatus] = useState('waiting'); // waiting, active, finished
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timer, setTimer] = useState(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (stompClient && stompClient.connected) {
            // Subscribe to room events
            const roomSubscription = stompClient.subscribe(
                `/topic/room/${roomId}`,
                (message) => {
                    const data = JSON.parse(message.body);
                    handleGameMessage(data);
                }
            );

            // Subscribe to player-specific events
            const playerSubscription = stompClient.subscribe(
                `/user/queue/player`,
                (message) => {
                    const data = JSON.parse(message.body);
                    handlePlayerMessage(data);
                }
            );

            // Join room
            stompClient.send("/app/join", {}, JSON.stringify({
                roomId,
                username,
                isHost
            }));

            return () => {
                roomSubscription.unsubscribe();
                playerSubscription.unsubscribe();
            };
        }
    }, [stompClient, roomId, username, isHost]);

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
                setTimer(30); // 30 seconds per question
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

    useEffect(() => {
        let interval;
        if (timer > 0 && gameStatus === 'active') {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            // Time's up - submit empty answer
            handleAnswer(null);
        }
        return () => clearInterval(interval);
    }, [timer, gameStatus]);

    const handleStartGame = () => {
        if (stompClient && isHost) {
            stompClient.send("/app/start", {}, JSON.stringify({
                roomId
            }));
        }
    };

    const handleAnswer = (answer) => {
        if (stompClient && gameStatus === 'active') {
            stompClient.send("/app/answer", {}, JSON.stringify({
                roomId,
                username,
                answer,
                timeRemaining: timer
            }));
        }
    };

    return (
        <div className="game-container">
            <div className="game-header">
                <div className="room-info">
                    <h2>Room: {roomId}</h2>
                    <p>Player: {username} {isHost && '(Host)'}</p>
                    <p>Score: {score}</p>
                </div>

                <div className="players-list">
                    <h3>Players:</h3>
                    <ul>
                        {players.map((player, index) => (
                            <li key={index} className={player.username === username ? 'current-player' : ''}>
                                {player.username} {player.isHost ? '(Host)' : ''}
                                {player.score !== undefined && ` - Score: ${player.score}`}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="game-content">
                {gameStatus === 'waiting' && (
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

                {gameStatus === 'active' && currentQuestion && (
                    <div className="question-container">
                        <div className="timer">Time remaining: {timer}s</div>
                        <h3 className="question-text">{currentQuestion.text}</h3>
                        <div className="answers-grid">
                            {currentQuestion.answers.map((answer, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(answer)}
                                    className="answer-button"
                                    disabled={timer === 0}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gameStatus === 'finished' && (
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
                            <button onClick={handleStartGame} className="start-button">
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
