package com.trainingplatform.controller;
import com.trainingplatform.service.LearningOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor
public class LearningOverviewController {
 private final LearningOverviewService overview;
 @GetMapping("/api/student/courses/{courseId}/overview") public LearningOverviewService.Overview get(@PathVariable Long courseId,@RequestParam(required=false) Long cohortId){return overview.get(courseId,cohortId);}
}
