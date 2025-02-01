import React from 'react';
import './DifficultyIndicator.css';

const DifficultyIndicator = ({ difficulty }) => {
    const getDifficultyColor = () => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return 'green';
            case 'medium':
                return 'yellow';
            case 'hard':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <div className="difficulty-indicator">
            <span className="difficulty-label">Difficulty:</span>
            <div
                className="difficulty-level"
                style={{ backgroundColor: getDifficultyColor() }}
            >
                {difficulty}
            </div>
        </div>
    );
};

export default DifficultyIndicator;
