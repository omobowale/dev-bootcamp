package com.trainingplatform.dto;

/**
 * The spec's "67%"-style indicator (§10), broken down by dimension. {@code attendanceTotal}/
 * {@code attendancePresent} are null when no attendance has been taken yet for this course —
 * see StudentProgressService for why an untracked dimension is excluded from the percentage
 * rather than counted against the student.
 */
public record CourseProgressResponse(
        int classesTotal,
        int classesCompleted,
        int quizzesTotal,
        int quizzesPassed,
        int assignmentsTotal,
        int assignmentsSubmitted,
        int assignmentsReviewed,
        Integer attendanceTotal,
        Integer attendancePresent,
        int overallPercentage,
        boolean courseComplete) {
}
