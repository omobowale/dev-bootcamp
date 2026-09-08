package com.trainingplatform.dto;

import com.trainingplatform.entity.AssignmentSubmission;
import com.trainingplatform.entity.AssignmentSubmissionStatus;
import java.time.Instant;

public record AdminSubmissionResponse(
        Long id,
        String studentId,
        String studentName,
        String responseText,
        String attachmentUrl,
        String attachmentFilename,
        AssignmentSubmissionStatus status,
        Instant submittedAt,
        Integer score,
        String feedback,
        Instant reviewedAt) {

    public static AdminSubmissionResponse from(AssignmentSubmission submission) {
        return new AdminSubmissionResponse(
                submission.getId(),
                submission.getStudent().getStudentId(),
                submission.getStudent().getFullName(),
                submission.getResponseText(),
                submission.getAttachmentUrl(),
                submission.getAttachmentFilename(),
                submission.getStatus(),
                submission.getSubmittedAt(),
                submission.getScore(),
                submission.getFeedback(),
                submission.getReviewedAt());
    }
}
