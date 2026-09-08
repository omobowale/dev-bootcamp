package com.trainingplatform.controller;

import com.trainingplatform.dto.CourseProgressResponse;
import com.trainingplatform.dto.StudentClassListItemResponse;
import com.trainingplatform.dto.StudentClassSessionResponse;
import com.trainingplatform.dto.StudentEnrollmentResponse;
import com.trainingplatform.dto.StudentMeResponse;
import com.trainingplatform.service.StudentPortalService;
import com.trainingplatform.service.StudentProgressService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentPortalController {

    private final StudentPortalService studentPortalService;
    private final StudentProgressService studentProgressService;

    @GetMapping("/me")
    public StudentMeResponse me() {
        return studentPortalService.getMe();
    }

    @GetMapping("/enrollments")
    public List<StudentEnrollmentResponse> enrollments() {
        return studentPortalService.listMyEnrollments();
    }

    @GetMapping("/courses/{courseId}/classes")
    public List<StudentClassListItemResponse> classesForCourse(@PathVariable Long courseId) {
        return studentPortalService.listClassesForCourse(courseId);
    }

    @GetMapping("/classes/{classSessionId}")
    public StudentClassSessionResponse getClass(@PathVariable Long classSessionId) {
        return studentPortalService.getClass(classSessionId);
    }

    @PostMapping("/classes/{classSessionId}/complete")
    public void markClassComplete(@PathVariable Long classSessionId) {
        studentProgressService.markClassComplete(classSessionId);
    }

    @GetMapping("/courses/{courseId}/progress")
    public CourseProgressResponse getProgress(@PathVariable Long courseId) {
        return studentProgressService.getProgress(courseId);
    }
}
