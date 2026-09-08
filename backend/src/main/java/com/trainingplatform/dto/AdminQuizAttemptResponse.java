package com.trainingplatform.dto;

import com.trainingplatform.entity.QuizAttempt;
import java.time.Instant;

public record AdminQuizAttemptResponse(
        Long id,
        String studentId,
        String studentName,
        Integer score,
        Integer totalPossible,
        Double percentage,
        Boolean passed,
        Instant startedAt,
        Instant submittedAt) {

    public static AdminQuizAttemptResponse from(QuizAttempt attempt) {
        return new AdminQuizAttemptResponse(
                attempt.getId(),
                attempt.getStudent().getStudentId(),
                attempt.getStudent().getFullName(),
                attempt.getScore(),
                attempt.getTotalPossible(),
                attempt.getPercentage(),
                attempt.getPassed(),
                attempt.getCreatedAt(),
                attempt.getSubmittedAt());
    }
}
