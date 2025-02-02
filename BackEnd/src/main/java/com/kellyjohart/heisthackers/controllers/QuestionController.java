package com.kellyjohart.heisthackers.controllers;

import com.kellyjohart.heisthackers.models.Question;
import com.kellyjohart.heisthackers.services.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:3000") // Adjust this for your React frontend
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/next")
    public ResponseEntity<Question> getNextQuestion(
            @RequestParam(defaultValue = "1") int difficulty) {
        Question question = questionService.getNextQuestion(difficulty);
        return ResponseEntity.ok(question);
    }

    @PostMapping("/{questionId}/check")
    public ResponseEntity<Boolean> checkAnswer(
            @PathVariable Long questionId,
            @RequestBody String answer) {
        boolean isCorrect = questionService.checkAnswer(questionId, answer);
        return ResponseEntity.ok(isCorrect);
    }
}
