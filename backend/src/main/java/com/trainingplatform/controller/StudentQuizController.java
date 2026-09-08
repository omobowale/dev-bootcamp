package com.trainingplatform.controller;

import com.trainingplatform.dto.QuizAttemptResultResponse;
import com.trainingplatform.dto.StartQuizAttemptResponse;
import com.trainingplatform.dto.SubmitQuizAttemptRequest;
import com.trainingplatform.service.StudentQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class StudentQuizController {

    private final StudentQuizService studentQuizService;

    @PostMapping("/api/student/quizzes/{quizId}/attempts")
    public StartQuizAttemptResponse startAttempt(@PathVariable Long quizId) {
        return studentQuizService.startAttempt(quizId);
    }

    @PostMapping("/api/student/quiz-attempts/{attemptId}/submit")
    public QuizAttemptResultResponse submitAttempt(
            @PathVariable Long attemptId, @Valid @RequestBody SubmitQuizAttemptRequest request) {
        return studentQuizService.submitAttempt(attemptId, request);
    }

    @GetMapping("/api/student/quiz-attempts/{attemptId}")
    public QuizAttemptResultResponse getAttemptResult(@PathVariable Long attemptId) {
        return studentQuizService.getAttemptResult(attemptId);
    }
}
