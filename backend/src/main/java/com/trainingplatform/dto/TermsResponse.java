package com.trainingplatform.dto;

import com.trainingplatform.entity.SiteSettings;
import java.time.Instant;

public record TermsResponse(String content, Instant updatedAt) {

    public static TermsResponse from(SiteSettings settings) {
        return new TermsResponse(settings.getTermsContent(), settings.getUpdatedAt());
    }
}
