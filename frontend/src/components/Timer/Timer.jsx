import React, { useEffect, useState } from 'react';
import './Timer.css';

const Timer = ({ initialTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft === 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const getTimerColor = () => {
        if (timeLeft > initialTime / 2) return '#4CAF50';
        if (timeLeft > initialTime / 4) return '#ff9800';
        return '#f44336';
    };

    return (
        <div className="timer">
            <div
                className="timer-circle"
                style={{
                    borderColor: getTimerColor(),
                    color: getTimerColor()
                }}
            >
                {timeLeft}
            </div>
        </div>
    );
};

export default Timer;
