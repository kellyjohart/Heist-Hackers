import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { setUsername } = useContext(UserContext);
    const [inputUsername, setInputUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [showJoinRoom, setShowJoinRoom] = useState(false);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (inputUsername.trim()) {
            setUsername(inputUsername);
            const roomId = 'room-' + Math.random().toString(36).substr(2, 9);
            navigate(`/game/${roomId}`, {
                state: {
                    username: inputUsername,
                    isHost: true
                }
            });
        }
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (inputUsername.trim() && roomCode.trim()) {
            setUsername(inputUsername);
            navigate(`/game/${roomCode}`, {
                state: {
                    username: inputUsername,
                    isHost: false
                }
            });
        }
    };

    return (
        <div className="join-screen">
            <h1>Heist Hackers</h1>

            {/* Username Input */}
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    required
                />
            </div>

            {/* Action Buttons */}
            <div className="button-group">
                <button
                    className={!showJoinRoom ? 'active' : ''}
                    onClick={() => setShowJoinRoom(false)}
                >
                    Create Room
                </button>
                <button
                    className={showJoinRoom ? 'active' : ''}
                    onClick={() => setShowJoinRoom(true)}
                >
                    Join Room
                </button>
            </div>

            {/* Conditional Form */}
            {showJoinRoom ? (
                <form onSubmit={handleJoinRoom} className="room-form">
                    <input
                        type="text"
                        placeholder="Enter Room Code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        required
                    />
                    <button type="submit">Join Room</button>
                </form>
            ) : (
                <form onSubmit={handleCreateRoom} className="room-form">
                    <button type="submit">Create New Room</button>
                </form>
            )}
        </div>
    );
};

export default Home;
