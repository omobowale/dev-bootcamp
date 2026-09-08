package com.trainingplatform.dto;

import java.util.List;

public record QuizAttemptResultResponse(
        Long attemptId,
        Integer score,
        Integer totalPossible,
        Double percentage,
        Boolean passed,
        Integer passingPercentage,
        List<QuizAnswerResultResponse> answers) {
}
