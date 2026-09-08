package com.trainingplatform.dto;

import java.util.List;

/** One graded answer within a submitted attempt — reveals the correct option and explanation. */
public record QuizAnswerResultResponse(
        Long questionId,
        String text,
        Integer points,
        String explanation,
        List<AdminQuizOptionDto> options,
        Integer selectedOptionPosition,
        boolean correct) {
}
