package com.trainingplatform.dto;

import java.util.List;

public record StartQuizAttemptResponse(
        Long attemptId, Long quizId, Integer passingPercentage, List<StudentQuizQuestionResponse> questions) {
}
