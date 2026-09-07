package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One row of a course's "What's included" checklist — a title plus the description of why it
 * matters. Mapped as an {@code @ElementCollection} on {@link Course} (see
 * {@code course_included_items} in V8) rather than its own entity/repository/controller like
 * {@link Faq}: unlike FAQs, these items are always edited and saved together as part of the
 * course form, never independently, so there's no need for a separate CRUD surface.
 *
 * Ordered via {@code @OrderBy("position")} on the Course side rather than JPA's
 * {@code @OrderColumn} — the latter treats its index column as a dense, zero-based array index
 * and silently fills any gap with a null element, which a plain 1-based `position` column (the
 * natural way to seed/backfill this data) doesn't satisfy. Sorting by an explicit column has no
 * such requirement.
 */
@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class CourseIncludedItem {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer position;

    public CourseIncludedItem(String title, String description, Integer position) {
        this.title = title;
        this.description = description;
        this.position = position;
    }
}
