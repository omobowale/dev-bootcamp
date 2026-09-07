package com.trainingplatform.dto;

import com.trainingplatform.entity.Course;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CourseResponse(
        Long id,
        String title,
        String slug,
        String shortDescription,
        String description,
        String image,
        String level,
        String duration,
        String mode,
        BigDecimal price,
        BigDecimal discountPrice,
        String requirements,
        String targetAudience,
        boolean certificateAvailable,
        boolean published,
        String instructorName,
        String instructorBio,
        String instructorAvatarUrl,
        String projects,
        List<IncludedItemDto> whatsIncluded,
        String aiSkillsDescription,
        Instant createdAt,
        Instant updatedAt) {

    public static CourseResponse from(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getShortDescription(),
                course.getDescription(),
                course.getImage(),
                course.getLevel(),
                course.getDuration(),
                course.getMode(),
                course.getPrice(),
                course.getDiscountPrice(),
                course.getRequirements(),
                course.getTargetAudience(),
                course.isCertificateAvailable(),
                course.isPublished(),
                course.getInstructorName(),
                course.getInstructorBio(),
                course.getInstructorAvatarUrl(),
                course.getProjects(),
                course.getWhatsIncluded().stream().map(IncludedItemDto::from).toList(),
                course.getAiSkillsDescription(),
                course.getCreatedAt(),
                course.getUpdatedAt());
    }
}
