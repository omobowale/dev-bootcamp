package com.trainingplatform.entity;

/** "Not Submitted" (spec §9) isn't a value here — it's the absence of an AssignmentSubmission row. */
public enum AssignmentSubmissionStatus {
    SUBMITTED,
    UNDER_REVIEW,
    REVIEWED,
    NEEDS_RESUBMISSION
}
