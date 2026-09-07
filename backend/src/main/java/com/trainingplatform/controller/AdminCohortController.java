package com.trainingplatform.controller;

import com.trainingplatform.dto.CohortRequest;
import com.trainingplatform.dto.CohortResponse;
import com.trainingplatform.service.CohortService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminCohortController {

    private final CohortService cohortService;

    @GetMapping("/api/admin/cohorts")
    public List<CohortResponse> list() {
        return cohortService.findAll();
    }

    @PostMapping("/api/admin/cohorts")
    public CohortResponse create(@RequestParam Long courseId, @Valid @RequestBody CohortRequest request) {
        return cohortService.create(courseId, request);
    }

    @PutMapping("/api/admin/cohorts/{id}")
    public CohortResponse update(@PathVariable Long id, @Valid @RequestBody CohortRequest request) {
        return cohortService.update(id, request);
    }

    @DeleteMapping("/api/admin/cohorts/{id}")
    public void archive(@PathVariable Long id) {
        cohortService.archive(id);
    }
}
