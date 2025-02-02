import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerList from '../PlayerList/PlayerList';
import Question from '../Question/Question';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { UserContext } from '../../contexts/UserContext';
import './Game.css';

const Game = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { username } = useContext(UserContext);

    const [gameState, setGameState] = useState({
        players: [],
        currentQuestion: null,
        isLoading: false,
        timeLeft: 0,
        isHost: false
    });

    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (!username) {
            navigate('/');
            return;
        }

        const socket = new WebSocket('ws://localhost:8080/game');
        setStompClient(socket);

        socket.onopen = () => {
            console.log('WebSocket Connected');
            // Send join room message
            socket.send(JSON.stringify({
                type: 'JOIN',
                roomId: roomId,
                username: username
            }));
        };

        socket.onmessage = (event) => {
            console.log('Message received:', event.data);
            try {
                const data = JSON.parse(event.data);
                setGameState(prevState => ({
                    ...prevState,
                    ...data
                }));
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [username, roomId, navigate]);

    const handleAnswer = (answer) => {
        if (stompClient && stompClient.readyState === WebSocket.OPEN) {
            stompClient.send(JSON.stringify({
                type: 'ANSWER',
                roomId: roomId,
                username: username,
                answer: answer
            }));
        }
    };

    const startGame = () => {
        if (stompClient && stompClient.readyState === WebSocket.OPEN) {
            stompClient.send(JSON.stringify({
                type: 'START_GAME',
                roomId: roomId
            }));
        }
    };

    return (
        <div className="game-container">
            <h1>Heist Hackers</h1>
            <PlayerList players={gameState.players} />
            {gameState.isLoading ? (
                <LoadingSpinner />
            ) : gameState.currentQuestion ? (
                <Question
                    question={gameState.currentQuestion}
                    onAnswer={handleAnswer}
                    timeLeft={gameState.timeLeft}
                />
            ) : (
                <div className="waiting-room">
                    <h2>Waiting for next question...</h2>
                </div>
            )}
            {gameState.isHost && !gameState.currentQuestion && (
                <button
                    className="start-button"
                    onClick={startGame}
                >
                    Start Game
                </button>
            )}
        </div>
    );
};

export default Game;
