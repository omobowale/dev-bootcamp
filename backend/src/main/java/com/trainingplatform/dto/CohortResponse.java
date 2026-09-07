package com.trainingplatform.dto;

import com.trainingplatform.entity.Cohort;
import com.trainingplatform.entity.CohortStatus;
import java.time.LocalDate;

public record CohortResponse(
        Long id,
        Long courseId,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        String schedule,
        String time,
        String mode,
        String location,
        Integer capacity,
        CohortStatus status,
        boolean privateTutorial) {

    public static CohortResponse from(Cohort cohort) {
        return new CohortResponse(
                cohort.getId(),
                cohort.getCourse().getId(),
                cohort.getName(),
                cohort.getStartDate(),
                cohort.getEndDate(),
                cohort.getSchedule(),
                cohort.getTime(),
                cohort.getMode(),
                cohort.getLocation(),
                cohort.getCapacity(),
                cohort.getStatus(),
                cohort.isPrivateTutorial());
    }
}
