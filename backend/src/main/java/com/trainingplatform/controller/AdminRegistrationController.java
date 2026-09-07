package com.trainingplatform.controller;

import com.trainingplatform.dto.AdminActionLogResponse;
import com.trainingplatform.dto.AdminRegistrationDetailResponse;
import com.trainingplatform.dto.AdminRegistrationListItemResponse;
import com.trainingplatform.dto.PagedResponse;
import com.trainingplatform.dto.RegistrationStatusUpdateRequest;
import com.trainingplatform.entity.RegistrationStatus;
import com.trainingplatform.service.AdminRegistrationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/registrations")
@RequiredArgsConstructor
public class AdminRegistrationController {

    private final AdminRegistrationService adminRegistrationService;

    @GetMapping
    public PagedResponse<AdminRegistrationListItemResponse> list(
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long cohortId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminRegistrationService.list(status, courseId, cohortId, search, page, size);
    }

    @GetMapping("/{id}")
    public AdminRegistrationDetailResponse get(@PathVariable Long id) {
        return adminRegistrationService.getById(id);
    }

    @GetMapping("/{id}/activity")
    public List<AdminActionLogResponse> activity(@PathVariable Long id) {
        return adminRegistrationService.getActivity(id);
    }

    @PutMapping("/{id}/status")
    public AdminRegistrationDetailResponse updateStatus(
            @PathVariable Long id, @Valid @RequestBody RegistrationStatusUpdateRequest request) {
        return adminRegistrationService.updateStatus(id, request.status());
    }
}
