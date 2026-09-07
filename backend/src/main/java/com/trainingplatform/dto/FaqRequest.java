package com.trainingplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FaqRequest(Long courseId, @NotBlank String question, @NotBlank String answer, @NotNull Integer position) {
}
