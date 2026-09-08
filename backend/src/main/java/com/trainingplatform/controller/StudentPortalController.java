package com.trainingplatform.controller;

import com.trainingplatform.dto.CertificateResponse;
import com.trainingplatform.dto.CourseProgressResponse;
import com.trainingplatform.dto.StudentClassListItemResponse;
import com.trainingplatform.dto.StudentClassSessionResponse;
import com.trainingplatform.dto.StudentEnrollmentResponse;
import com.trainingplatform.dto.StudentMeResponse;
import com.trainingplatform.service.StudentCertificateService;
import com.trainingplatform.service.StudentPortalService;
import com.trainingplatform.service.StudentProgressService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    private final StudentCertificateService studentCertificateService;

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

    // 204, not 404: no certificate yet is the normal state before completion, not an error.
    @GetMapping("/courses/{courseId}/certificate")
    public ResponseEntity<CertificateResponse> getCertificate(@PathVariable Long courseId) {
        Optional<CertificateResponse> certificate = studentCertificateService.getMine(courseId);
        return certificate.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/courses/{courseId}/certificate")
    public CertificateResponse issueCertificate(@PathVariable Long courseId) {
        return studentCertificateService.issue(courseId);
    }
}
