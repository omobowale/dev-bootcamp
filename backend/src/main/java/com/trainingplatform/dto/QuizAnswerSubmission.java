package com.trainingplatform.dto;

import jakarta.validation.constraints.NotNull;

public record QuizAnswerSubmission(@NotNull Long questionId, Integer selectedOptionPosition) {
}
