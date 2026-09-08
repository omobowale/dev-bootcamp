package com.trainingplatform.dto;

import com.trainingplatform.entity.QuizOption;

/** An answer option as shown to a student BEFORE they submit — deliberately excludes {@code correct}. */
public record StudentQuizOptionResponse(Integer position, String text) {

    public static StudentQuizOptionResponse from(QuizOption option) {
        return new StudentQuizOptionResponse(option.getPosition(), option.getText());
    }
}
