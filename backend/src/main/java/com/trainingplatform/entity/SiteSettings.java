package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Single-row table of admin-editable site-wide legal content. There is exactly one row (id = 1)
 * today, holding the Terms & Conditions shown publicly and edited from the admin. Not a generic
 * key/value settings table — if more admin-editable site content shows up later, that's the point
 * to generalize this.
 */
@Getter
@Setter
@Entity
@Table(name = "site_settings")
public class SiteSettings {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id;

    @Column(name = "terms_content", nullable = false, columnDefinition = "TEXT")
    private String termsContent;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
