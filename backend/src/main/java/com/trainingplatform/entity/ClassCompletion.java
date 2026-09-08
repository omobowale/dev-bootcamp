package com.trainingplatform.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * A student explicitly marking a class as done — the only reliable "finished with this" signal,
 * since a class isn't required to have a quiz or assignment to infer completion from. The
 * inherited {@code createdAt} doubles as "completed at", same reasoning as {@link QuizAttempt}.
 */
@Getter
@Setter
@Entity
@Table(name = "class_completions")
public class ClassCompletion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_session_id", nullable = false)
    private ClassSession classSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
}
