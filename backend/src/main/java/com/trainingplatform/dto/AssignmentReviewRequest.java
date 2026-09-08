package com.trainingplatform.dto;

import com.trainingplatform.entity.AssignmentSubmissionStatus;
import jakarta.validation.constraints.NotNull;

public record AssignmentReviewRequest(@NotNull AssignmentSubmissionStatus status, Integer score, String feedback) {
}
