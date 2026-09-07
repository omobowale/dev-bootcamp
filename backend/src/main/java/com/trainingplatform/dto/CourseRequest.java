package com.trainingplatform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record CourseRequest(
        @NotBlank String title,
        @NotBlank String slug,
        String shortDescription,
        String description,
        String image,
        String level,
        String duration,
        String mode,
        @DecimalMin(value = "0", message = "Price cannot be negative") BigDecimal price,
        @DecimalMin(value = "0", message = "Discount price cannot be negative") BigDecimal discountPrice,
        String requirements,
        String targetAudience,
        boolean certificateAvailable,
        boolean published,
        String instructorName,
        String instructorBio,
        String instructorAvatarUrl,
        String projects,
        @Valid List<IncludedItemDto> whatsIncluded,
        @Size(max = 500, message = "AI skills description must be 500 characters or fewer") String aiSkillsDescription) {
}
