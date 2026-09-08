package com.trainingplatform.service;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.exception.ForbiddenException;
final class LearningAccess {
    static boolean allows(CourseEnrollmentRepository repository, Long studentId, ClassSession session) {
        Long courseId=session.getModule().getCourse().getId();
        if (!repository.existsByStudentIdAndCourseId(studentId,courseId)) return false;
        return session.getCohortId()==null || repository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
            .anyMatch(e -> e.isActive() && e.getRegistration().getStatus()!=RegistrationStatus.CANCELLED && e.getCourse().getId().equals(courseId) && e.getCohort().getId().equals(session.getCohortId()));
    }
    static void requireCohort(CourseEnrollmentRepository repository,Long studentId,Long courseId,Long cohortId) {
        if(cohortId!=null && repository.findByStudentIdOrderByCreatedAtDesc(studentId).stream().noneMatch(e -> e.isActive() && e.getRegistration().getStatus()!=RegistrationStatus.CANCELLED && e.getCourse().getId().equals(courseId) && e.getCohort().getId().equals(cohortId))) throw new ForbiddenException("You do not have access to this cohort.");
    }
    static void require(CourseEnrollmentRepository repository, Long studentId, ClassSession session) {
        if(!allows(repository,studentId,session)) throw new ForbiddenException("You do not have access to this cohort's lesson.");
    }
}
