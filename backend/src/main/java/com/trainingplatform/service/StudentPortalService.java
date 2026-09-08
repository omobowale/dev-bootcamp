package com.trainingplatform.service;

import com.trainingplatform.dto.StudentEnrollmentResponse;
import com.trainingplatform.dto.StudentMeResponse;
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

    public StudentMeResponse getMe() {
        return StudentMeResponse.from(currentStudentProvider.getCurrentStudent());
    }

    public List<StudentEnrollmentResponse> listMyEnrollments() {
        var student = currentStudentProvider.getCurrentStudent();
        return courseEnrollmentRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .map(StudentEnrollmentResponse::from)
                .toList();
    }
}
