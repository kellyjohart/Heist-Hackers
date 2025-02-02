import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../WebSocket/useWebSocket';
import { WS_CONFIG } from '../WebSocket/webSocketConfig';
import Question from '../Question/Question';
import PlayerList from '../PlayerList/PlayerList';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { questionService } from '../../services/questionService';
import { gameService } from '../../services/gameService';
import { scoreService } from '../../services/scoreService';
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
            const handleGameState = (message) => {
                console.log('Received game state:', message);
                setGameState(prevState => ({
                    ...prevState,
                    ...message
                }));
            };

            const handlePlayerJoin = (message) => {
                console.log('Player joined:', message);
                setGameState(prevState => ({
                    ...prevState,
                    players: [...prevState.players, message]
                }));
            };

            const handlePlayerLeave = (message) => {
                console.log('Player left:', message);
                setGameState(prevState => ({
                    ...prevState,
                    players: prevState.players.filter(player => player !== message)
                }));
            };

            const handleQuestionUpdate = async (message) => {
                console.log('Question update:', message);
                try {
                    const question = await questionService.getNextQuestion(message.difficulty);
                    setGameState(prevState => ({
                        ...prevState,
                        currentQuestion: question,
                        timeLeft: 30
                    }));
                } catch (error) {
                    console.error('Error fetching question:', error);
                }
            };

            const handleAnswerResult = async (message) => {
                console.log('Answer result:', message);
                if (message.correct) {
                    await scoreService.updateScore(gameState.playerName, message.points);
                }
            };

            const subscriptions = [
                subscribe(WS_CONFIG.TOPICS.gameState, handleGameState),
                subscribe(WS_CONFIG.TOPICS.playerJoin, handlePlayerJoin),
                subscribe(WS_CONFIG.TOPICS.playerLeave, handlePlayerLeave),
                subscribe(WS_CONFIG.TOPICS.questionUpdate, handleQuestionUpdate),
                subscribe(WS_CONFIG.TOPICS.answerResult, handleAnswerResult)
            ];

            return () => {
                subscriptions.forEach(subscription => subscription.unsubscribe());
            };
        }
    }, [connected]);

    const initializeGame = async (roomCode) => {
        try {
            const gameData = await gameService.initializeGame(roomCode);
            sendMessage(WS_CONFIG.destinations.initGame, {
                roomCode: roomCode,
                isHost: true
            });
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    };

    const joinGame = (roomCode, playerName) => {
        sendMessage(WS_CONFIG.destinations.joinGame, {
            roomCode: roomCode,
            playerName: playerName
        });
    };

    const handleAnswer = async (answer) => {
        try {
            if (gameState.currentQuestion) {
                const isCorrect = await questionService.checkAnswer(
                    gameState.currentQuestion.id,
                    answer
                );

                sendMessage(WS_CONFIG.destinations.submitAnswer, {
                    questionId: gameState.currentQuestion.id,
                    answer: answer,
                    playerName: gameState.playerName
                });

                if (gameState.isHost) {
                    const nextQuestion = await questionService.getNextQuestion(
                        gameState.currentDifficulty || 1
                    );
                    sendMessage(WS_CONFIG.destinations.updateQuestion, nextQuestion);
                }
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const startGame = async () => {
        if (gameState.isHost) {
            try {
                const initialQuestion = await questionService.getNextQuestion(1);
                sendMessage(WS_CONFIG.destinations.startGame, {
                    roomCode: gameState.roomCode,
                    question: initialQuestion
                });
            } catch (error) {
                console.error('Error starting game:', error);
            }
        }
    };

    if (!connected) {
        return <LoadingSpinner />;
    }

    return (
        <div className="game-container">
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
                <div>Waiting for next question...</div>
            )}
            {gameState.isHost && !gameState.currentQuestion && (
                <button onClick={startGame}>Start Game</button>
            )}
        </div>
    );
}

export default Game;
