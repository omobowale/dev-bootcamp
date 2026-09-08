package com.trainingplatform.controller;

import com.trainingplatform.dto.StudentEnrollmentResponse;
import com.trainingplatform.dto.StudentMeResponse;
import com.trainingplatform.service.StudentPortalService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentPortalController {

    private final StudentPortalService studentPortalService;

    @GetMapping("/me")
    public StudentMeResponse me() {
        return studentPortalService.getMe();
    }

    @GetMapping("/enrollments")
    public List<StudentEnrollmentResponse> enrollments() {
        return studentPortalService.listMyEnrollments();
    }
}
