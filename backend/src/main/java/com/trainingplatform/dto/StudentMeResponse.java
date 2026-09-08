package com.trainingplatform.dto;

import com.trainingplatform.entity.Student;

public record StudentMeResponse(String studentId, String fullName, String email) {

    public static StudentMeResponse from(Student student) {
        return new StudentMeResponse(student.getStudentId(), student.getFullName(), student.getEmail());
    }
}
