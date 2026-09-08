package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/**
 * A student's submission for an {@link Assignment} — one evolving row per (assignment, student),
 * not one row per attempt. See V12's javadoc comment for why resubmission updates this row in
 * place rather than creating a new one.
 */
@Getter
@Setter
@Entity
@Table(name = "assignment_submissions")
public class AssignmentSubmission extends BaseEntity {
    @jakarta.persistence.Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "response_text", columnDefinition = "TEXT")
    private String responseText;

    @Column(name = "attachment_url", length = 1000)
    private String attachmentUrl;

    @Column(name = "attachment_public_id", length = 500)
    private String attachmentPublicId;

    @Column(name = "attachment_filename")
    private String attachmentFilename;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssignmentSubmissionStatus status = AssignmentSubmissionStatus.SUBMITTED;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String feedback;
    @Column(columnDefinition = "TEXT") private String rubricBreakdown;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;
}
