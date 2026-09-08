package com.trainingplatform.controller;

import com.trainingplatform.dto.AdminSubmissionResponse;
import com.trainingplatform.dto.AssignmentRequest;
import com.trainingplatform.dto.AssignmentResponse;
import com.trainingplatform.dto.AssignmentReviewRequest;
import com.trainingplatform.service.AdminAssignmentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminAssignmentController {

    private final AdminAssignmentService adminAssignmentService;

    // 204, not 404: a class not having an assignment yet is the normal, common state — see the
    // identical reasoning on AdminQuizController's getForClassSession.
    @GetMapping("/api/admin/class-sessions/{classSessionId}/assignment")
    public ResponseEntity<AssignmentResponse> getForClassSession(@PathVariable Long classSessionId) {
        Optional<AssignmentResponse> assignment = adminAssignmentService.findForClassSession(classSessionId);
        return assignment.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/api/admin/class-sessions/{classSessionId}/assignment")
    public AssignmentResponse create(@PathVariable Long classSessionId) {
        return adminAssignmentService.create(classSessionId);
    }

    @PutMapping("/api/admin/assignments/{id}")
    public AssignmentResponse update(@PathVariable Long id, @Valid @RequestBody AssignmentRequest request) {
        return adminAssignmentService.update(id, request);
    }

    @GetMapping("/api/admin/assignments/{id}/submissions")
    public List<AdminSubmissionResponse> listSubmissions(@PathVariable Long id) {
        return adminAssignmentService.listSubmissions(id);
    }

    @PutMapping("/api/admin/assignment-submissions/{id}/review")
    public AdminSubmissionResponse review(@PathVariable Long id, @Valid @RequestBody AssignmentReviewRequest request) {
        return adminAssignmentService.review(id, request);
    }
}
