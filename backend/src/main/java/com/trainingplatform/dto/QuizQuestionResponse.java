package com.trainingplatform.dto;

import com.trainingplatform.entity.QuizQuestion;
import java.util.List;

public record QuizQuestionResponse(
        Long id,
        Long quizId,
        String text,
        Integer points,
        String explanation,
        Integer position,
        List<AdminQuizOptionDto> options) {

    public static QuizQuestionResponse from(QuizQuestion question) {
        return new QuizQuestionResponse(
                question.getId(),
                question.getQuiz().getId(),
                question.getText(),
                question.getPoints(),
                question.getExplanation(),
                question.getPosition(),
                question.getOptions().stream().map(AdminQuizOptionDto::from).toList());
    }
}
