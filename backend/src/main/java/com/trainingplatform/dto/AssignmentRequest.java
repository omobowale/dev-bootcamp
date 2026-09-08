package com.trainingplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AssignmentRequest(
        @NotBlank String title,
        String learningObjective,
        String instructions,
        String tasks,
        String submissionRequirements,
        @NotNull Integer maxScore,
        Instant dueAt,
        String rubric,
        String allowedAttachmentTypes) {
}
