package com.trainingplatform.controller;

import com.trainingplatform.dto.CohortResponse;
import com.trainingplatform.dto.CourseDetailResponse;
import com.trainingplatform.dto.CourseListItemResponse;
import com.trainingplatform.dto.PrivateTutorialOptionResponse;
import com.trainingplatform.service.PublicCourseService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class PublicCourseController {

    private final PublicCourseService publicCourseService;

    @GetMapping
    public List<CourseListItemResponse> list(@RequestParam(required = false) String level) {
        return publicCourseService.listPublished(level);
    }

    @GetMapping("/private-tutorials")
    public List<PrivateTutorialOptionResponse> privateTutorials() {
        return publicCourseService.listPrivateTutorialOptions();
    }

    @GetMapping("/{slug}")
    public CourseDetailResponse getBySlug(@PathVariable String slug) {
        return publicCourseService.getPublishedBySlug(slug);
    }

    @GetMapping("/{id}/cohorts")
    public List<CohortResponse> cohorts(@PathVariable Long id) {
        return publicCourseService.listOpenCohorts(id);
    }
}
