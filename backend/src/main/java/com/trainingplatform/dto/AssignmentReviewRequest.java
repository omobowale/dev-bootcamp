package com.trainingplatform.dto;

import com.trainingplatform.entity.AssignmentSubmissionStatus;
import jakarta.validation.constraints.NotNull;

public record AssignmentReviewRequest(@NotNull AssignmentSubmissionStatus status, Integer score, String feedback, @NotNull Long version, Long rubricVersion, java.util.List<com.trainingplatform.service.RubricData.Input> criterionScores) {
}
