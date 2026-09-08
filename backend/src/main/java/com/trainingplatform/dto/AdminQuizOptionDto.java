package com.trainingplatform.dto;

import com.trainingplatform.entity.QuizOption;
import jakarta.validation.constraints.NotBlank;

public record AdminQuizOptionDto(@NotBlank String text, boolean correct) {

    public static AdminQuizOptionDto from(QuizOption option) {
        return new AdminQuizOptionDto(option.getText(), option.isCorrect());
    }

    public QuizOption toEntity(int position) {
        return new QuizOption(text(), correct(), position);
    }
}
