package com.trainingplatform.dto;

import com.trainingplatform.entity.Student;
import java.time.Instant;
import java.util.List;

public record AdminStudentResponse(
        Long id,
        String studentId,
        String fullName,
        String email,
        String status,
        List<String> enrolledCourseTitles,
        Instant createdAt) {

    public static AdminStudentResponse from(Student student, List<String> enrolledCourseTitles) {
        return new AdminStudentResponse(
                student.getId(),
                student.getStudentId(),
                student.getFullName(),
                student.getEmail(),
                student.getStatus().name(),
                enrolledCourseTitles,
                student.getCreatedAt());
    }
}
