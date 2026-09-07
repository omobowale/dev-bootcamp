package com.trainingplatform.dto;

import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.Cohort;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.math.BigDecimal;

public record CourseListItemResponse(
        Long id,
        String title,
        String slug,
        String shortDescription,
        String image,
        String level,
        String duration,
        String mode,
        BigDecimal price,
        BigDecimal discountPrice,
        boolean certificateAvailable,
        String aiSkillsDescription,
        int openCohortCount,
        LocalDate nextStartDate,
        boolean privateTutorialAvailable) {

    public static CourseListItemResponse from(Course course, List<Cohort> cohorts) {
        return new CourseListItemResponse(
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getShortDescription(),
                course.getImage(),
                course.getLevel(),
                course.getDuration(),
                course.getMode(),
                course.getPrice(),
                course.getDiscountPrice(),
                course.isCertificateAvailable(),
                course.getAiSkillsDescription(),
                cohorts.size(),
                cohorts.stream().filter(cohort -> !cohort.isPrivateTutorial()).map(Cohort::getStartDate).filter(Objects::nonNull).filter(date -> !date.isBefore(LocalDate.now())).min(LocalDate::compareTo).orElse(null),
                cohorts.stream().anyMatch(Cohort::isPrivateTutorial));
    }
}
