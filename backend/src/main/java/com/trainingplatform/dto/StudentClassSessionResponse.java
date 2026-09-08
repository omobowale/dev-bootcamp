package com.trainingplatform.dto;

import com.trainingplatform.entity.ClassSession;
import java.time.Instant;
import java.util.List;

public record StudentClassSessionResponse(
        Long id, Long courseId, Long cohortId,
        String title,
        String objectives,
        Instant scheduledAt,
        String meetingLink,
        String recordingUrl,
        List<LessonSectionDto> sections,
        List<MaterialResponse> materials,
        StudentQuizSummaryResponse quiz,
        StudentAssignmentResponse assignment,
        boolean completed) {

    public static StudentClassSessionResponse from(
            ClassSession session,
            List<MaterialResponse> materials,
            StudentQuizSummaryResponse quiz,
            StudentAssignmentResponse assignment,
            boolean completed) {
        return new StudentClassSessionResponse(
                session.getId(), session.getModule().getCourse().getId(), session.getCohortId(),
                session.getTitle(),
                session.getObjectives(),
                session.getCohortId() == null ? null : session.getScheduledAt(),
                session.getCohortId() == null ? null : session.getMeetingLink(),
                session.getCohortId() == null ? null : session.getRecordingUrl(),
                session.getSections().stream().map(LessonSectionDto::from).toList(),
                materials,
                quiz,
                assignment,
                completed);
    }
}
