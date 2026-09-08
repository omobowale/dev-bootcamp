package com.trainingplatform.dto;

import com.trainingplatform.entity.Assignment;
import java.time.Instant;

public record StudentAssignmentResponse(
        Long id,
        String title,
        String learningObjective,
        String instructions,
        String tasks,
        String submissionRequirements,
        Integer maxScore,
        Instant dueAt,
        String rubric,
        String allowedAttachmentTypes,
        StudentSubmissionResponse mySubmission) {

    public static StudentAssignmentResponse from(Assignment assignment, StudentSubmissionResponse mySubmission) {
        return new StudentAssignmentResponse(
                assignment.getId(),
                assignment.getTitle(),
                assignment.getLearningObjective(),
                assignment.getInstructions(),
                assignment.getTasks(),
                assignment.getSubmissionRequirements(),
                assignment.getMaxScore(),
                assignment.getDueAt(),
                assignment.getRubric(),
                assignment.getAllowedAttachmentTypes(),
                mySubmission);
    }
}
