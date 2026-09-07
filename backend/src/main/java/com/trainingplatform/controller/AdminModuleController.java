package com.trainingplatform.controller;

import com.trainingplatform.dto.ModuleRequest;
import com.trainingplatform.dto.ModuleResponse;
import com.trainingplatform.service.CourseModuleService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminModuleController {

    private final CourseModuleService courseModuleService;

    @GetMapping("/api/admin/courses/{courseId}/modules")
    public List<ModuleResponse> list(@PathVariable Long courseId) {
        return courseModuleService.findByCourse(courseId);
    }

    @PostMapping("/api/admin/courses/{courseId}/modules")
    public ModuleResponse create(@PathVariable Long courseId, @Valid @RequestBody ModuleRequest request) {
        return courseModuleService.create(courseId, request);
    }

    @PutMapping("/api/admin/modules/{id}")
    public ModuleResponse update(@PathVariable Long id, @Valid @RequestBody ModuleRequest request) {
        return courseModuleService.update(id, request);
    }

    @DeleteMapping("/api/admin/modules/{id}")
    public void delete(@PathVariable Long id) {
        courseModuleService.delete(id);
    }

    @PutMapping("/api/admin/courses/{courseId}/modules/reorder")
    public List<ModuleResponse> reorder(@PathVariable Long courseId, @RequestBody List<Long> orderedModuleIds) {
        return courseModuleService.reorder(courseId, orderedModuleIds);
    }
}
