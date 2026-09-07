package com.trainingplatform.dto;

import com.trainingplatform.entity.Course;
import java.math.BigDecimal;
import java.util.List;

public record CourseDetailResponse(
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
        String instructorName,
        String instructorBio,
        String instructorAvatarUrl,
        String projects,
        List<IncludedItemDto> whatsIncluded,
        String aiSkillsDescription,
        List<ModuleResponse> modules,
        List<FaqResponse> faqs) {

    public static CourseDetailResponse from(Course course, List<ModuleResponse> modules, List<FaqResponse> faqs) {
        return new CourseDetailResponse(
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
                course.getInstructorName(),
                course.getInstructorBio(),
                course.getInstructorAvatarUrl(),
                course.getProjects(),
                course.getWhatsIncluded().stream().map(IncludedItemDto::from).toList(),
                course.getAiSkillsDescription(),
                modules,
                faqs);
    }
}
