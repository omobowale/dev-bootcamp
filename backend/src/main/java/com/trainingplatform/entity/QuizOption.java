package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One answer option within a {@link QuizQuestion}. Mapped as an {@code @ElementCollection} on
 * the question (see {@code quiz_question_options} in V11), the same pattern as
 * {@link LessonSection} on {@link ClassSession} — always authored and saved together with the
 * parent question, never independently. A student's recorded answer ({@link QuizAnswer})
 * references the option they picked by its {@code position} within the question rather than a
 * foreign key to a specific option row, since these rows have no stable id of their own.
 */
@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class QuizOption {

    @Column(nullable = false, length = 500)
    private String text;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Column(nullable = false)
    private Integer position;

    public QuizOption(String text, boolean correct, Integer position) {
        this.text = text;
        this.correct = correct;
        this.position = position;
    }
}
