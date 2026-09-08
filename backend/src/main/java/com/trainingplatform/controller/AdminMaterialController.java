package com.trainingplatform.controller;

import com.trainingplatform.dto.MaterialResponse;
import com.trainingplatform.dto.MaterialUpdateRequest;
import com.trainingplatform.service.AdminMaterialService;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class AdminMaterialController {

    private final AdminMaterialService adminMaterialService;

    @GetMapping("/api/admin/class-sessions/{classSessionId}/materials")
    public List<MaterialResponse> list(@PathVariable Long classSessionId) {
        return adminMaterialService.listForClassSession(classSessionId);
    }

    @PostMapping("/api/admin/class-sessions/{classSessionId}/materials")
    public MaterialResponse upload(
            @PathVariable Long classSessionId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam MultipartFile file) {
        return adminMaterialService.upload(classSessionId, title, description, file);
    }

    @PutMapping("/api/admin/materials/{id}")
    public MaterialResponse update(@PathVariable Long id, @Valid @RequestBody MaterialUpdateRequest request) {
        return adminMaterialService.updateMeta(id, request);
    }

    @DeleteMapping("/api/admin/materials/{id}")
    public void delete(@PathVariable Long id) {
        adminMaterialService.delete(id);
    }

    @PutMapping("/api/admin/class-sessions/{classSessionId}/materials/reorder")
    public List<MaterialResponse> reorder(@PathVariable Long classSessionId, @RequestBody List<Long> orderedMaterialIds) {
        return adminMaterialService.reorder(classSessionId, orderedMaterialIds);
    }
}
