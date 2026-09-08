package com.trainingplatform.service;

import com.trainingplatform.dto.CourseProgressResponse;
import com.trainingplatform.entity.AssignmentSubmissionStatus;
import com.trainingplatform.entity.AttendanceRecord;
import com.trainingplatform.entity.AttendanceStatus;
import com.trainingplatform.entity.Assignment;
import com.trainingplatform.entity.ClassCompletion;
import com.trainingplatform.entity.ClassSession;
import com.trainingplatform.entity.CourseCompletionCriteria;
import com.trainingplatform.entity.Quiz;
import com.trainingplatform.entity.Student;
import com.trainingplatform.exception.ForbiddenException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.AssignmentRepository;
import com.trainingplatform.repository.AssignmentSubmissionRepository;
import com.trainingplatform.repository.AttendanceRecordRepository;
import com.trainingplatform.repository.ClassCompletionRepository;
import com.trainingplatform.repository.ClassSessionRepository;
import com.trainingplatform.repository.CourseCompletionCriteriaRepository;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.repository.QuizAttemptRepository;
import com.trainingplatform.repository.QuizRepository;
import com.trainingplatform.security.CurrentStudentProvider;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentProgressService {

    private final ClassSessionRepository classSessionRepository;
    private final ClassCompletionRepository classCompletionRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final CourseCompletionCriteriaRepository courseCompletionCriteriaRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CurrentStudentProvider currentStudentProvider;

    @Transactional
    public void markClassComplete(Long classSessionId) {
        Student student = currentStudentProvider.getCurrentStudent();
        ClassSession session = classSessionRepository
                .findById(classSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classSessionId));
        requireEnrolled(student, session.getModule().getCourse().getId());

        if (classCompletionRepository.existsByClassSessionIdAndStudentId(classSessionId, student.getId())) {
            return;
        }
        ClassCompletion completion = new ClassCompletion();
        completion.setClassSession(session);
        completion.setStudent(student);
        classCompletionRepository.save(completion);
    }

    @Transactional(readOnly = true)
    public CourseProgressResponse getProgress(Long courseId) {
        Student student = currentStudentProvider.getCurrentStudent();
        requireEnrolled(student, courseId);

        int classesTotal = classSessionRepository.findByCourseIdOrderByModulePositionAscPositionAsc(courseId).size();
        int classesCompleted = classCompletionRepository
                .findByStudentIdAndClassSession_Module_Course_Id(student.getId(), courseId)
                .size();

        List<Quiz> quizzes = quizRepository.findByClassSession_Module_Course_Id(courseId);
        int quizzesTotal = quizzes.size();
        int quizzesPassed = (int) quizzes.stream()
                .filter(quiz -> quizAttemptRepository
                        .findByQuizIdAndStudentIdOrderByCreatedAtDesc(quiz.getId(), student.getId())
                        .stream()
                        .anyMatch(attempt -> Boolean.TRUE.equals(attempt.getPassed())))
                .count();

        List<Assignment> assignments = assignmentRepository.findByClassSession_Module_Course_Id(courseId);
        int assignmentsTotal = assignments.size();
        int assignmentsSubmitted = 0;
        int assignmentsReviewed = 0;
        for (Assignment assignment : assignments) {
            var submission =
                    assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId());
            if (submission.isPresent()) {
                assignmentsSubmitted++;
                if (submission.get().getStatus() == AssignmentSubmissionStatus.REVIEWED) {
                    assignmentsReviewed++;
                }
            }
        }

        List<AttendanceRecord> attendanceRecords =
                attendanceRecordRepository.findByStudentIdAndClassSession_Module_Course_Id(student.getId(), courseId);
        Integer attendanceTotal = attendanceRecords.isEmpty() ? null : attendanceRecords.size();
        Integer attendancePresent = attendanceRecords.isEmpty()
                ? null
                : (int) attendanceRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();

        List<Double> dimensionPercentages = new ArrayList<>();
        if (classesTotal > 0) dimensionPercentages.add(classesCompleted * 100.0 / classesTotal);
        if (quizzesTotal > 0) dimensionPercentages.add(quizzesPassed * 100.0 / quizzesTotal);
        if (assignmentsTotal > 0) dimensionPercentages.add(assignmentsSubmitted * 100.0 / assignmentsTotal);
        if (attendanceTotal != null && attendanceTotal > 0) {
            dimensionPercentages.add(attendancePresent * 100.0 / attendanceTotal);
        }
        int overallPercentage = dimensionPercentages.isEmpty()
                ? 0
                : (int) Math.round(dimensionPercentages.stream().mapToDouble(Double::doubleValue).average().orElse(0));

        boolean courseComplete = isComplete(
                courseId,
                classesTotal,
                classesCompleted,
                quizzesTotal,
                quizzesPassed,
                assignmentsTotal,
                assignmentsReviewed,
                attendanceTotal,
                attendancePresent);

        return new CourseProgressResponse(
                classesTotal,
                classesCompleted,
                quizzesTotal,
                quizzesPassed,
                assignmentsTotal,
                assignmentsSubmitted,
                assignmentsReviewed,
                attendanceTotal,
                attendancePresent,
                overallPercentage,
                courseComplete);
    }

    private boolean isComplete(
            Long courseId,
            int classesTotal,
            int classesCompleted,
            int quizzesTotal,
            int quizzesPassed,
            int assignmentsTotal,
            int assignmentsReviewed,
            Integer attendanceTotal,
            Integer attendancePresent) {
        CourseCompletionCriteria criteria = courseCompletionCriteriaRepository.findByCourseId(courseId).orElse(null);
        boolean requireAllClasses = criteria == null || criteria.isRequireAllClassesCompleted();
        boolean requireAllQuizzes = criteria != null && criteria.isRequireAllQuizzesPassed();
        boolean requireAllAssignments = criteria != null && criteria.isRequireAllAssignmentsReviewed();
        Integer minAttendance = criteria != null ? criteria.getMinAttendancePercentage() : null;

        if (requireAllClasses && classesTotal > 0 && classesCompleted < classesTotal) {
            return false;
        }
        if (requireAllQuizzes && quizzesTotal > 0 && quizzesPassed < quizzesTotal) {
            return false;
        }
        if (requireAllAssignments && assignmentsTotal > 0 && assignmentsReviewed < assignmentsTotal) {
            return false;
        }
        if (minAttendance != null) {
            if (attendanceTotal == null || attendanceTotal == 0) {
                return false;
            }
            double attendancePercentage = attendancePresent * 100.0 / attendanceTotal;
            if (attendancePercentage < minAttendance) {
                return false;
            }
        }
        return true;
    }

    private void requireEnrolled(Student student, Long courseId) {
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ForbiddenException("You are not enrolled in this course.");
        }
    }
}
