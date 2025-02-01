package com.kellyjohart.heisthackers.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class Player {
    @Id
    private String id;

    private String name;
    private int score;

    @ManyToOne
    private GameSession gameSession;

    private boolean isHost;
}
