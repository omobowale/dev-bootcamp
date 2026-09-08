package com.trainingplatform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CourseCompletionCriteriaRequest(
        boolean requireAllClassesCompleted,
        boolean requireAllQuizzesPassed,
        boolean requireAllAssignmentsReviewed,
        @Min(1) @Max(100) Integer minAttendancePercentage) {
}
