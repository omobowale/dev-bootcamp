package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * A student's answer to one {@link QuizQuestion} within a {@link QuizAttempt}. References the
 * option they picked by its position within the question (0-based, matching {@link QuizOption}'s
 * {@code position}) rather than a foreign key — see {@link QuizOption}'s javadoc for why. Null
 * means the question was left unanswered. {@code correct} is computed and frozen at submit time,
 * so it stays accurate even if the question is edited afterward.
 */
@Getter
@Setter
@Entity
@Table(name = "quiz_answers")
public class QuizAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(name = "selected_option_position")
    private Integer selectedOptionPosition;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;
}
