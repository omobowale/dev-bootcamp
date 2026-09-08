package com.trainingplatform.controller;

import com.trainingplatform.dto.ClassSessionRequest;
import com.trainingplatform.dto.ClassSessionResponse;
import com.trainingplatform.service.ClassSessionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminClassSessionController {

    private final ClassSessionService classSessionService;

    @GetMapping("/api/admin/modules/{moduleId}/class-sessions")
    public List<ClassSessionResponse> listForModule(@PathVariable Long moduleId) {
        return classSessionService.listForModule(moduleId);
    }

    @PostMapping("/api/admin/modules/{moduleId}/class-sessions")
    public ClassSessionResponse create(@PathVariable Long moduleId, @Valid @RequestBody ClassSessionRequest request) {
        return classSessionService.create(moduleId, request);
    }

    @GetMapping("/api/admin/class-sessions/{id}")
    public ClassSessionResponse getById(@PathVariable Long id) {
        return classSessionService.getById(id);
    }

    @PutMapping("/api/admin/class-sessions/{id}")
    public ClassSessionResponse update(@PathVariable Long id, @Valid @RequestBody ClassSessionRequest request) {
        return classSessionService.update(id, request);
    }

    @DeleteMapping("/api/admin/class-sessions/{id}")
    public void delete(@PathVariable Long id) {
        classSessionService.delete(id);
    }

    @PutMapping("/api/admin/modules/{moduleId}/class-sessions/reorder")
    public List<ClassSessionResponse> reorder(@PathVariable Long moduleId, @RequestBody List<Long> orderedSessionIds) {
        return classSessionService.reorder(moduleId, orderedSessionIds);
    }
}
