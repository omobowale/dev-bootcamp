package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/**
 * One student's attempt at a {@link Quiz}. {@code submittedAt}/{@code score}/etc stay null while
 * the attempt is in progress (started but not yet submitted) — see StudentQuizService. The
 * inherited {@code createdAt} (from {@link BaseEntity}) doubles as "started at" — a separate
 * column would just duplicate it, since an attempt row is created at the moment it starts.
 */
@Getter
@Setter
@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    private Integer score;

    @Column(name = "total_possible")
    private Integer totalPossible;

    private Double percentage;

    private Boolean passed;
}
