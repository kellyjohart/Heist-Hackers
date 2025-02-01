// src/components/Game/Game.jsx
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../websocket/useWebSocket';
import { WS_CONFIG } from '../../websocket/webSocketConfig';
import DifficultyIndicator from '../DifficultyIndicator/DifficultyIndicator';
import Question from '../Question/Question';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import Timer from '../Timer/Timer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './Game.css';


const Game = () => {
    const { connected, sendMessage, subscribe } = useWebSocket();

    // Existing state
    const [currentQuestion, setCurrentQuestion] = useState({
        text: "What is the main purpose of the 'final' keyword in Java?",
        answers: [
            "To prevent inheritance",
            "To make a variable constant",
            "To improve performance",
            "To declare the end of a file"
        ]
    });
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [difficulty, setDifficulty] = useState('easy');
    const [timeLeft, setTimeLeft] = useState(30);

    const [isLoading, setIsLoading] = useState(false);
    const [connectionError, setConnectionError] = useState('');

    // Multiplayer state
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [gameState, setGameState] = useState('WAITING');
    const [isHost, setIsHost] = useState(false);
    const [playerName, setPlayerName] = useState('');

    // Subscribe to game updates
    // Keep your existing useEffect for WebSocket subscription
    useEffect(() => {
        if (connected && roomCode) {
            const subscription = subscribe(
                `${WS_CONFIG.TOPICS.GAME}/${roomCode}`,
                handleGameUpdate
            );
            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }
    }, [connected, roomCode]);

// Add this new useEffect for error handling
    useEffect(() => {
        if (connectionError) {
            const timer = setTimeout(() => {
                setConnectionError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [connectionError]);


    // Handle game updates from server
    const handleGameUpdate = (update) => {
        if (update.question) {
            setCurrentQuestion(update.question);
        }
        if (update.players) {
            setPlayers(update.players);
        }
        if (update.gameState) {
            setGameState(update.gameState);
        }
    };

    // Handle answer submission
    const handleAnswer = (answer) => {
        sendMessage(WS_CONFIG.DESTINATIONS.ANSWER, {
            roomCode,
            playerName,
            answer
        });

        // Keep existing logic
        setScore(prevScore => prevScore + 100);
        setCorrectAnswers(prev => prev + 1);

        if (correctAnswers > totalQuestions / 2) {
            setDifficulty('medium');
        }
        if (correctAnswers > (totalQuestions * 0.8)) {
            setDifficulty('hard');
        }
    };

    // Game management methods
    const createGame = async () => {
        setIsLoading(true); // Start loading
        try {
            const newRoomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            setRoomCode(newRoomCode);
            setIsHost(true);

            await sendMessage(WS_CONFIG.DESTINATIONS.CREATE, {
                roomCode: newRoomCode,
                playerName
            });
        } catch (error) {
            setConnectionError('Failed to create game. Please try again.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

const joinGame = async (code) => {
    setIsLoading(true); // Start loading
    try {
        setRoomCode(code);
        await sendMessage(WS_CONFIG.DESTINATIONS.JOIN, {
            roomCode: code,
            playerName
        });
    } catch (error) {
        setConnectionError('Failed to join game. Please check the room code and try again.');
    } finally {
        setIsLoading(false); // Stop loading
    }
};

const startGame = async () => {
    if (isHost) {
        setIsLoading(true); // Start loading
        try {
            await sendMessage(WS_CONFIG.DESTINATIONS.START, {
                roomCode
            });
        } catch (error) {
            setConnectionError('Failed to start game. Please try again.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    }
};

    const handleTimeUp = () => {
        sendMessage(WS_CONFIG.DESTINATIONS.TIMEUP, {
            roomCode,
            playerName
        });
    };

return (
    <div className="game-container">
        {connectionError && (
            <div className="error-message">
                {connectionError}
            </div>
        )}
        {isLoading ? (
            <LoadingSpinner />
        ) : (
            <div>
                {gameState === 'WAITING' ? (
                    // Lobby view
                    <div className="lobby">
                        {!roomCode ? (
                            // Initial join screen
                            <div className="join-screen">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={createGame}
                                    disabled={!connected || !playerName || isLoading}
                                    className={isLoading ? 'button-loading' : ''}
                                >
                                    {isLoading ? 'Creating...' : 'Create Game'}
                                </button>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter room code"
                                        onChange={(e) => setRoomCode(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={() => joinGame(roomCode)}
                                        disabled={!connected || !playerName || !roomCode || isLoading}
                                        className={isLoading ? 'button-loading' : ''}
                                    >
                                        {isLoading ? 'Joining...' : 'Join Game'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Waiting room
                            <div className="waiting-room">
                                <h2>Room Code: {roomCode}</h2>
                                <div className="players-list">
                                    {players.map(player => (
                                        <div key={player.name}>{player.name}</div>
                                    ))}
                                </div>
                                {isHost && (
                                    <button
                                        onClick={startGame}
                                        disabled={!connected || players.length < 1 || isLoading}
                                        className={isLoading ? 'button-loading' : ''}
                                    >
                                        {isLoading ? 'Starting...' : 'Start Game'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // Game view
                    <>
                        <DifficultyIndicator difficulty={difficulty} />
                        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                            <button onClick={() => setDifficulty('easy')}>Set Easy</button>
                            <button onClick={() => setDifficulty('medium')}>Set Medium</button>
                            <button onClick={() => setDifficulty('hard')}>Set Hard</button>
                        </div>
                        <ScoreBoard
                            score={score}
                            correctAnswers={correctAnswers}
                            totalQuestions={totalQuestions}
                        />
                        <Timer
                            initialTime={30}
                            onTimeUp={handleTimeUp}
                        />
                        {currentQuestion && (
                            <Question
                                question={currentQuestion}
                                onAnswer={handleAnswer}
                                timeLeft={timeLeft}
                            />
                        )}
                    </>
                )}
            </div>
        )}
    </div>
);
