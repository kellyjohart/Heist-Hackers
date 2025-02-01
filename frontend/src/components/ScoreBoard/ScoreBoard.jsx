import React from 'react';
import './ScoreBoard.css';

const ScoreBoard = ({ score, correctAnswers, totalQuestions }) => {
    return (
        <div className="scoreboard">
            <div className="score-item">
                <span className="score-label">Score:</span>
                <span className="score-value">{score}</span>
            </div>
            <div className="score-item">
                <span className="score-label">Progress:</span>
                <span className="score-value">
          {correctAnswers} / {totalQuestions}
        </span>
            </div>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                        width: `${(correctAnswers / totalQuestions) * 100}%`,
                        backgroundColor: correctAnswers > totalQuestions / 2 ? '#4CAF50' : '#ff9800'
                    }}
                />
            </div>
        </div>
    );
};

export default ScoreBoard;
