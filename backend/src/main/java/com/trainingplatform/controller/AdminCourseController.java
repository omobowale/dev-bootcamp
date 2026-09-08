package com.trainingplatform.controller;

import com.trainingplatform.dto.AdminCertificateResponse;
import com.trainingplatform.dto.CourseCompletionCriteriaRequest;
import com.trainingplatform.dto.CourseCompletionCriteriaResponse;
import com.trainingplatform.dto.CourseRequest;
import com.trainingplatform.dto.CourseResponse;
import com.trainingplatform.service.AdminCertificateService;
import com.trainingplatform.service.CourseCompletionCriteriaService;
import com.trainingplatform.service.CourseService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
public class AdminCourseController {

    private final CourseService courseService;
    private final CourseCompletionCriteriaService courseCompletionCriteriaService;
    private final AdminCertificateService adminCertificateService;

    @GetMapping
    public List<CourseResponse> list() {
        return courseService.findAll();
    }

    @PostMapping
    public CourseResponse create(@Valid @RequestBody CourseRequest request) {
        return courseService.create(request);
    }

    @GetMapping("/{id}")
    public CourseResponse get(@PathVariable Long id) {
        return courseService.findById(id);
    }

    @PutMapping("/{id}")
    public CourseResponse update(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return courseService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void archive(@PathVariable Long id) {
        courseService.archive(id);
    }

    @GetMapping("/{id}/completion-criteria")
    public CourseCompletionCriteriaResponse getCompletionCriteria(@PathVariable Long id) {
        return courseCompletionCriteriaService.getForCourse(id);
    }

    @PutMapping("/{id}/completion-criteria")
    public CourseCompletionCriteriaResponse updateCompletionCriteria(
            @PathVariable Long id, @Valid @RequestBody CourseCompletionCriteriaRequest request) {
        return courseCompletionCriteriaService.update(id, request);
    }

    @GetMapping("/{id}/certificates")
    public List<AdminCertificateResponse> listCertificates(@PathVariable Long id) {
        return adminCertificateService.listForCourse(id);
    }
}
