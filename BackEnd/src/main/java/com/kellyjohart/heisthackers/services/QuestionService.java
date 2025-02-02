package com.kellyjohart.heisthackers.services;

import com.kellyjohart.heisthackers.models.Question;
import com.kellyjohart.heisthackers.repositories.QuestionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Question getNextQuestion(int currentDifficulty) {
        List<Question> questions = questionRepository.findByDifficultyLevel(currentDifficulty);
        // Add logic to randomly select a question or based on some criteria
        return questions.isEmpty() ? null : questions.get(0);
    }

    public boolean checkAnswer(Long questionId, String submittedAnswer) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        return question.getCorrectAnswer().equals(submittedAnswer);
    }

    public int adjustDifficulty(int currentDifficulty, boolean wasCorrect) {
        if (wasCorrect) {
            return Math.min(currentDifficulty + 1, 10); // Assuming 10 is max difficulty
        } else {
            return Math.max(currentDifficulty - 1, 1); // Assuming 1 is min difficulty
        }
    }
}
