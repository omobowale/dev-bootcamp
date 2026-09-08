package com.trainingplatform.dto;

import com.trainingplatform.entity.AssignmentSubmission;
import com.trainingplatform.entity.AssignmentSubmissionStatus;
import java.time.Instant;

public record StudentSubmissionResponse(
        String responseText,
        String attachmentUrl,
        String attachmentFilename,
        AssignmentSubmissionStatus status,
        Instant submittedAt,
        Integer score,
        String feedback,
        Instant reviewedAt) {

    public static StudentSubmissionResponse from(AssignmentSubmission submission) {
        return new StudentSubmissionResponse(
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
