import React, { useState } from 'react';
import './Question.css';

const Question = ({ question, onAnswer, timeLeft }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
        onAnswer(answer);
    };

    return (
        <div className="question-container">
            <div className="question-text">
                <h2>{question.text}</h2>
            </div>
            <div className="answers-grid">
                {question.answers.map((answer, index) => (
                    <button
                        key={index}
                        className={`answer-button ${selectedAnswer === answer ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(answer)}
                        disabled={timeLeft === 0 || selectedAnswer !== null}
                    >
                        {answer}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Question;
