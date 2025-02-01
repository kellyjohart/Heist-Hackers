package com.kellyjohart.heisthackers.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String questionText;

    @ElementCollection
    private List<String> possibleAnswers;

    private String correctAnswer;

    private int difficultyLevel;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType;

    public enum QuestionType {
        AI_GENERATED,
        PREDEFINED
    }
}
