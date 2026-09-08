package com.trainingplatform.service;

import com.trainingplatform.dto.AdminStudentResponse;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.repository.StudentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStudentService {

    private final StudentRepository studentRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    public List<AdminStudentResponse> list() {
        return studentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(student -> {
                    List<String> courseTitles = courseEnrollmentRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                            .map(enrollment -> enrollment.getCourse().getTitle())
                            .toList();
                    return AdminStudentResponse.from(student, courseTitles);
                })
                .toList();
    }
}
