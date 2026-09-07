package com.trainingplatform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record SiteContentData(
        @NotNull @Email @Size(max = 254) String supportEmail,
        @NotNull @Pattern(regexp = "^$|[0-9]{7,15}", message = "Use 7–15 digits including country code") String whatsappNumber,
        @NotNull @Size(max = 12) List<@NotNull @Valid SocialLink> socialLinks,
        @NotNull @Size(max = 30) List<@NotNull @Valid Testimonial> testimonials,
        @NotNull @Size(max = 30) List<@NotNull @Valid TeamMember> team) {
    public record SocialLink(@NotBlank @Size(max = 50) String platform,
            @NotBlank @Size(max = 1000) String url, boolean published) {}
    public record Testimonial(@NotBlank @Size(max = 100) String name,
            @NotNull @Size(max = 150) String role, @NotBlank @Size(max = 1500) String quote,
            @NotNull @Size(max = 1000) String avatarUrl, boolean published) {}
    public record TeamMember(@NotBlank @Size(max = 100) String name,
            @NotBlank @Size(max = 150) String role, @NotBlank @Size(max = 2500) String bio,
            @NotNull @Size(max = 1000) String avatarUrl,
            @NotNull @Size(max = 1000) String profileUrl, boolean instructor, boolean published) {}
}
