package com.kellyjohart.heisthackers.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Entity
public class GameSession {
    @Id
    private String roomCode;

    private String hostId;
    private GameState gameState;

    @OneToMany(mappedBy = "gameSession")
    private List<Player> players;

    private int currentQuestionIndex;
    private long startTime;

    public GameSession() {
        this.roomCode = generateRoomCode();
        this.gameState = GameState.WAITING;
    }

    private String generateRoomCode() {
        // Generate a 4-letter room code
        return UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    public enum GameState {
        WAITING,
        PLAYING,
        FINISHED
    }
}
