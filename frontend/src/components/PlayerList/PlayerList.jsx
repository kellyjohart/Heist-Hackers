import React from 'react';
import './PlayerList.css';

function PlayerList({ players }) {
    return (
        <div className="player-list">
            <h3>Players</h3>
            <ul>
                {players.map((player, index) => (
                    <li key={index} className="player-item">
                        {player.name}
                        {player.isHost && <span className="host-badge">(Host)</span>}
                        {player.score !== undefined && <span className="score">Score: {player.score}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PlayerList;
