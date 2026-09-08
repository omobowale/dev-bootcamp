package com.trainingplatform.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * A single gated class within a course — the real lesson content an enrolled student gets,
 * as opposed to {@link CourseTopic} which stays the public marketing teaser. Optionally linked
 * to the {@link CourseTopic} it corresponds to, but deliberately its own entity: see
 * 09_LMS_Implementation_Plan.md for why the two aren't merged.
 */
@Getter
@Setter
@Entity
@Table(name = "class_sessions")
public class ClassSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private CourseTopic topic;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "meeting_link", length = 1000)
    private String meetingLink;

    @Column(name = "recording_url", length = 1000)
    private String recordingUrl;

    @Column(nullable = false)
    private Integer position;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "lesson_sections", joinColumns = @JoinColumn(name = "class_session_id"))
    @OrderBy("position ASC")
    private List<LessonSection> sections = new ArrayList<>();
}
