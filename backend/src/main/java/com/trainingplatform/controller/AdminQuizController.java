package com.trainingplatform.controller;

import com.trainingplatform.dto.AdminQuizAttemptResponse;
import com.trainingplatform.dto.QuizQuestionRequest;
import com.trainingplatform.dto.QuizQuestionResponse;
import com.trainingplatform.dto.QuizResponse;
import com.trainingplatform.dto.QuizSettingsRequest;
import com.trainingplatform.service.AdminQuizService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminQuizController {

    private final AdminQuizService adminQuizService;

    // 204, not 404: a class not having a quiz yet is the normal, common state (every class
    // starts this way), not an error condition — a 404 here would log a spurious-looking
    // network error on every single admin visit to a class that hasn't had a quiz set up yet.
    @GetMapping("/api/admin/class-sessions/{classSessionId}/quiz")
    public ResponseEntity<QuizResponse> getForClassSession(@PathVariable Long classSessionId) {
        Optional<QuizResponse> quiz = adminQuizService.findForClassSession(classSessionId);
        return quiz.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/api/admin/class-sessions/{classSessionId}/quiz")
    public QuizResponse create(@PathVariable Long classSessionId) {
        return adminQuizService.create(classSessionId);
    }

    @PutMapping("/api/admin/quizzes/{quizId}/settings")
    public QuizResponse updateSettings(@PathVariable Long quizId, @Valid @RequestBody QuizSettingsRequest request) {
        return adminQuizService.updateSettings(quizId, request);
    }

    @PostMapping("/api/admin/quizzes/{quizId}/questions")
    public QuizQuestionResponse createQuestion(@PathVariable Long quizId, @Valid @RequestBody QuizQuestionRequest request) {
        return adminQuizService.createQuestion(quizId, request);
    }

    @PutMapping("/api/admin/quiz-questions/{id}")
    public QuizQuestionResponse updateQuestion(@PathVariable Long id, @Valid @RequestBody QuizQuestionRequest request) {
        return adminQuizService.updateQuestion(id, request);
    }

    @DeleteMapping("/api/admin/quiz-questions/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        adminQuizService.deleteQuestion(id);
    }

    @PutMapping("/api/admin/quizzes/{quizId}/questions/reorder")
    public List<QuizQuestionResponse> reorderQuestions(@PathVariable Long quizId, @RequestBody List<Long> orderedQuestionIds) {
        return adminQuizService.reorderQuestions(quizId, orderedQuestionIds);
    }

    @GetMapping("/api/admin/quizzes/{quizId}/attempts")
    public List<AdminQuizAttemptResponse> listAttempts(@PathVariable Long quizId) {
        return adminQuizService.listAttempts(quizId);
    }
}
