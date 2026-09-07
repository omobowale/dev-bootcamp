package com.trainingplatform.dto;

import com.trainingplatform.entity.Cohort;
import java.math.BigDecimal;

/** One course's standing private-tutorial offer, for the public "Private tutorials" page. */
public record PrivateTutorialOptionResponse(
        Long courseId,
        String courseTitle,
        String courseSlug,
        String courseImage,
        String shortDescription,
        String level,
        BigDecimal price,
        BigDecimal discountPrice,
        String aiSkillsDescription,
        Long cohortId,
        String cohortName) {

    public static PrivateTutorialOptionResponse from(Cohort cohort) {
        var course = cohort.getCourse();
        return new PrivateTutorialOptionResponse(
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getImage(),
                course.getShortDescription(),
                course.getLevel(),
                course.getPrice(),
                course.getDiscountPrice(),
                course.getAiSkillsDescription(),
                cohort.getId(),
                cohort.getName());
    }
}
