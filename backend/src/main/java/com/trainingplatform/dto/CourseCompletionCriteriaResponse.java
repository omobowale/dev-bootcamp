package com.trainingplatform.dto;

import com.trainingplatform.entity.CourseCompletionCriteria;

public record CourseCompletionCriteriaResponse(
        Long courseId,
        boolean requireAllClassesCompleted,
        boolean requireAllQuizzesPassed,
        boolean requireAllAssignmentsReviewed,
        Integer minAttendancePercentage) {

    private static final boolean DEFAULT_REQUIRE_CLASSES = true;
    private static final boolean DEFAULT_REQUIRE_QUIZZES = false;
    private static final boolean DEFAULT_REQUIRE_ASSIGNMENTS = false;

    public static CourseCompletionCriteriaResponse defaultsFor(Long courseId) {
        return new CourseCompletionCriteriaResponse(
                courseId, DEFAULT_REQUIRE_CLASSES, DEFAULT_REQUIRE_QUIZZES, DEFAULT_REQUIRE_ASSIGNMENTS, null);
    }

    public static CourseCompletionCriteriaResponse from(CourseCompletionCriteria criteria) {
        return new CourseCompletionCriteriaResponse(
                criteria.getCourse().getId(),
                criteria.isRequireAllClassesCompleted(),
                criteria.isRequireAllQuizzesPassed(),
                criteria.isRequireAllAssignmentsReviewed(),
                criteria.getMinAttendancePercentage());
    }
}
