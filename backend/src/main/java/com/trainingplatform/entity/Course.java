package com.trainingplatform.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "courses")
public class Course extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "short_description")
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String image;

    private String level;

    private String duration;

    private String mode;

    private BigDecimal price;

    @Column(name = "discount_price")
    private BigDecimal discountPrice;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "certificate_available", nullable = false)
    private boolean certificateAvailable = false;

    @Column(name = "is_published", nullable = false)
    private boolean published = false;

    @Column(name = "instructor_name")
    private String instructorName;

    @Column(name = "instructor_bio", columnDefinition = "TEXT")
    private String instructorBio;

    @Column(name = "instructor_avatar_url")
    private String instructorAvatarUrl;

    @Column(columnDefinition = "TEXT")
    private String projects;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "course_included_items", joinColumns = @JoinColumn(name = "course_id"))
    @OrderBy("position ASC")
    private List<CourseIncludedItem> whatsIncluded = new ArrayList<>();

    @Column(name = "ai_skills_description", length = 500)
    private String aiSkillsDescription;
}
