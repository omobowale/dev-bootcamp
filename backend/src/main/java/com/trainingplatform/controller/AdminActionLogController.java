package com.trainingplatform.controller;

import com.trainingplatform.dto.AdminActionLogResponse;
import com.trainingplatform.dto.PagedResponse;
import com.trainingplatform.service.AdminActionLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/action-logs")
@RequiredArgsConstructor
public class AdminActionLogController {

    private final AdminActionLogService adminActionLogService;

    @GetMapping
    public PagedResponse<AdminActionLogResponse> list(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        return adminActionLogService.listAll(entityType, search, page, size);
    }
}
