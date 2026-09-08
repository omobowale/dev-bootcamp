package com.trainingplatform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record QuizSettingsRequest(
        @NotNull @Min(1) @Max(100) Integer passingPercentage,
        @Min(1) Integer maxAttempts) {
}
