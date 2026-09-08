package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One ordered rich-text block within a {@link ClassSession}'s lesson content. Mapped as an
 * {@code @ElementCollection} on {@code ClassSession} (see {@code lesson_sections} in V10), the
 * same pattern as {@link CourseIncludedItem} on {@link Course}: always authored and saved
 * together with the parent class session, never independently, so there's no need for a
 * separate CRUD surface. Ordered via {@code @OrderBy("position")}, not {@code @OrderColumn} —
 * see {@link CourseIncludedItem}'s javadoc for why.
 */
@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class LessonSection {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    private Integer position;

    public LessonSection(String title, String body, Integer position) {
        this.title = title;
        this.body = body;
        this.position = position;
    }
}
