package com.trainingplatform.dto;

import com.trainingplatform.entity.Assignment;
import java.time.Instant;

public record AssignmentResponse(
        Long id,
        Long classSessionId,
        String title,
        String learningObjective,
        String instructions,
        String tasks,
        String submissionRequirements,
        Integer maxScore,
        Instant dueAt,
        String rubric,
        String allowedAttachmentTypes) {

    public static AssignmentResponse from(Assignment assignment) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getClassSession().getId(),
                assignment.getTitle(),
                assignment.getLearningObjective(),
                assignment.getInstructions(),
                assignment.getTasks(),
                assignment.getSubmissionRequirements(),
                assignment.getMaxScore(),
                assignment.getDueAt(),
                assignment.getRubric(),
                assignment.getAllowedAttachmentTypes());
    }
}
