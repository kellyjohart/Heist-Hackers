import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { setUsername } = useContext(UserContext);
    const [inputUsername, setInputUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputUsername.trim()) {
            setUsername(inputUsername);
            const roomId = 'room-' + Math.random().toString(36).substr(2, 9);
            navigate(`/game/${roomId}`);
        }
    };

    return (
        <div className="join-screen">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    required
                />
                <button type="submit">Join Game</button>
            </form>
        </div>
    );
};

export default Home;
