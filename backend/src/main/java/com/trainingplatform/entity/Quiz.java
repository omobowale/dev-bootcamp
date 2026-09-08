package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * One multiple-choice quiz per {@link ClassSession}, auto-graded server-side (see
 * StudentQuizService). Questions live in a separate {@link QuizQuestion} table rather than as an
 * embedded collection here — unlike {@link LessonSection}, a question must have a stable id that
 * {@link QuizAnswer} can reference, so it needs to be a real entity, not an
 * {@code @ElementCollection}.
 */
@Getter
@Setter
@Entity
@Table(name = "quizzes")
public class Quiz extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_session_id", nullable = false, unique = true)
    private ClassSession classSession;

    @Column(name = "passing_percentage", nullable = false)
    private Integer passingPercentage = 70;

    /** Null means unlimited attempts. */
    @Column(name = "max_attempts")
    private Integer maxAttempts;
}
