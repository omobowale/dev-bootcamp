package com.trainingplatform.dto;

import com.trainingplatform.entity.QuizQuestion;
import java.util.List;

/** A question as shown to a student taking the quiz — no {@code explanation}, no correct answer. */
public record StudentQuizQuestionResponse(
        Long id, String text, Integer points, List<StudentQuizOptionResponse> options) {

    public static StudentQuizQuestionResponse from(QuizQuestion question) {
        return new StudentQuizQuestionResponse(
                question.getId(),
                question.getText(),
                question.getPoints(),
                question.getOptions().stream().map(StudentQuizOptionResponse::from).toList());
    }
}
