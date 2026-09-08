package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** A downloadable resource (slide deck, cheat sheet, sample code, …) attached to a class, uploaded to Cloudinary the same way assignment attachments are — see 09_LMS_Implementation_Plan.md Phase 14. */
@Getter
@Setter
@Entity
@Table(name = "course_materials")
public class CourseMaterial extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_session_id", nullable = false)
    private ClassSession classSession;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    @Column(name = "file_public_id", nullable = false)
    private String filePublicId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(nullable = false)
    private Integer position;
}
