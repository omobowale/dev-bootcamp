package com.trainingplatform.dto;

/**
 * Embedded in {@link StudentClassSessionResponse} so the class page knows whether to offer
 * "Start quiz"/"Retake"/"Attempts used up" without a second round trip.
 */
public record StudentQuizSummaryResponse(
        Long quizId,
        Integer passingPercentage,
        Integer maxAttempts,
        int questionCount,
        int attemptsUsed,
        Double bestPercentage,
        Boolean bestPassed,
        boolean canAttempt) {
}
