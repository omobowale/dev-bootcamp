package com.trainingplatform.service;

import com.trainingplatform.dto.StudentClassListItemResponse;
import com.trainingplatform.dto.StudentClassSessionResponse;
import com.trainingplatform.dto.StudentEnrollmentResponse;
import com.trainingplatform.dto.StudentMeResponse;
import com.trainingplatform.entity.ClassSession;
import com.trainingplatform.entity.Student;
import com.trainingplatform.exception.ForbiddenException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.ClassSessionRepository;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.security.CurrentStudentProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentPortalService {

    private final CurrentStudentProvider currentStudentProvider;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final ClassSessionRepository classSessionRepository;
    private final StudentQuizService studentQuizService;
    private final StudentAssignmentService studentAssignmentService;

    public StudentMeResponse getMe() {
        return StudentMeResponse.from(currentStudentProvider.getCurrentStudent());
    }

    public List<StudentEnrollmentResponse> listMyEnrollments() {
        var student = currentStudentProvider.getCurrentStudent();
        return courseEnrollmentRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .map(StudentEnrollmentResponse::from)
                .toList();
    }

    public List<StudentClassListItemResponse> listClassesForCourse(Long courseId) {
        Student student = currentStudentProvider.getCurrentStudent();
        requireEnrolled(student, courseId);
        return classSessionRepository.findByCourseIdOrderByModulePositionAscPositionAsc(courseId).stream()
                .map(StudentClassListItemResponse::from)
                .toList();
    }

    public StudentClassSessionResponse getClass(Long classSessionId) {
        Student student = currentStudentProvider.getCurrentStudent();
        ClassSession session = classSessionRepository
                .findById(classSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classSessionId));
        requireEnrolled(student, session.getModule().getCourse().getId());
        var quiz = studentQuizService.summaryFor(classSessionId, student).orElse(null);
        var assignment = studentAssignmentService.summaryFor(classSessionId, student).orElse(null);
        return StudentClassSessionResponse.from(session, quiz, assignment);
    }

    private void requireEnrolled(Student student, Long courseId) {
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ForbiddenException("You are not enrolled in this course.");
        }
    }
}
