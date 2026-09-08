package com.trainingplatform.controller;

import com.trainingplatform.dto.StudentSubmissionResponse;
import com.trainingplatform.service.StudentAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class StudentAssignmentController {

    private final StudentAssignmentService studentAssignmentService;

    @PostMapping("/api/student/assignments/{assignmentId}/submit")
    public StudentSubmissionResponse submit(
            @PathVariable Long assignmentId,
            @RequestParam(required = false) String responseText,
            @RequestParam(required = false) MultipartFile attachment) {
        return studentAssignmentService.submit(assignmentId, responseText, attachment);
    }
}
