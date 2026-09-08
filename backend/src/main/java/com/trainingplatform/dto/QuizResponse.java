package com.trainingplatform.dto;

import com.trainingplatform.entity.Quiz;
import java.util.List;

public record QuizResponse(
        Long id,
        Long classSessionId,
        Integer passingPercentage,
        Integer maxAttempts,
        List<QuizQuestionResponse> questions) {

    public static QuizResponse from(Quiz quiz, List<QuizQuestionResponse> questions) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getClassSession().getId(),
                quiz.getPassingPercentage(),
                quiz.getMaxAttempts(),
                questions);
    }
}
