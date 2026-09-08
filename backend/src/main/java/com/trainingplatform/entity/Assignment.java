package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** One theory/practical assignment per {@link ClassSession}, reviewed by hand — see spec §7. */
@Getter
@Setter
@Entity
@Table(name = "assignments")
public class Assignment extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_session_id", nullable = false, unique = true)
    private ClassSession classSession;

    @Column(nullable = false)
    private String title;

    @Column(name = "learning_objective", columnDefinition = "TEXT")
    private String learningObjective;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String tasks;

    @Column(name = "submission_requirements", columnDefinition = "TEXT")
    private String submissionRequirements;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore = 100;

    @Column(name = "due_at")
    private Instant dueAt;

    @Column(columnDefinition = "TEXT")
    private String rubric;
    @Column(columnDefinition = "TEXT") private String rubricCriteria;
    @Column(nullable = false) private long rubricVersion;

    @Column(name = "allowed_attachment_types")
    private String allowedAttachmentTypes;
}
