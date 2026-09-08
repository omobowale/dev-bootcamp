package com.trainingplatform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record QuizQuestionRequest(
        @NotBlank String text,
        @NotNull Integer points,
        String explanation,
        @NotNull Integer position,
        @NotNull @Size(min = 2, max = 8, message = "A question needs between 2 and 8 options") @Valid
                List<AdminQuizOptionDto> options) {
}
