package com.kellyjohart.heisthackers.repositories;

import com.kellyjohart.heisthackers.models.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    // Find questions by difficulty level
    List<Question> findByDifficultyLevel(int difficultyLevel);

    // Find questions by type (AI_GENERATED or PREDEFINED)
    List<Question> findByQuestionType(Question.QuestionType questionType);

    // Find questions by difficulty and type
    List<Question> findByDifficultyLevelAndQuestionType(int difficultyLevel, Question.QuestionType questionType);
}
