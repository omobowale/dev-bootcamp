package com.trainingplatform.controller;

import com.trainingplatform.dto.AdminStudentResponse;
import com.trainingplatform.service.AdminStudentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    @GetMapping
    public List<AdminStudentResponse> list() {
        return adminStudentService.list();
    }
}
