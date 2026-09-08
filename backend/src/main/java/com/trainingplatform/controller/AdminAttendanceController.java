package com.trainingplatform.controller;

import com.trainingplatform.dto.AdminAttendanceRowResponse;
import com.trainingplatform.dto.BulkAttendanceRequest;
import com.trainingplatform.service.AdminAttendanceService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AdminAttendanceService adminAttendanceService;

    @GetMapping("/api/admin/class-sessions/{classSessionId}/attendance")
    public List<AdminAttendanceRowResponse> list(@PathVariable Long classSessionId) {
        return adminAttendanceService.listForClassSession(classSessionId);
    }

    @PutMapping("/api/admin/class-sessions/{classSessionId}/attendance")
    public List<AdminAttendanceRowResponse> save(
            @PathVariable Long classSessionId, @Valid @RequestBody BulkAttendanceRequest request) {
        return adminAttendanceService.saveAttendance(classSessionId, request);
    }
}
