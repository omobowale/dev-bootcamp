package com.trainingplatform.service;

import com.trainingplatform.dto.MaterialResponse;
import com.trainingplatform.dto.MaterialUpdateRequest;
import com.trainingplatform.entity.ClassSession;
import com.trainingplatform.entity.CourseMaterial;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.ClassSessionRepository;
import com.trainingplatform.repository.CourseMaterialRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AdminMaterialService {

    private static final long MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

    private final CourseMaterialRepository courseMaterialRepository;
    private final ClassSessionRepository classSessionRepository;
    private final CloudinaryService cloudinaryService;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public List<MaterialResponse> listForClassSession(Long classSessionId) {
        return courseMaterialRepository.findByClassSessionIdOrderByPositionAsc(classSessionId).stream()
                .map(MaterialResponse::from)
                .toList();
    }

    @Transactional
    public MaterialResponse upload(Long classSessionId, String title, String description, MultipartFile file) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Title is required.");
        }
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Choose a file to upload.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("Files must be 20 MB or smaller.");
        }
        ClassSession session = classSessionRepository
                .findById(classSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classSessionId));

        CloudinaryService.UploadResult uploaded = cloudinaryService.upload(file, "course-materials");

        int nextPosition = courseMaterialRepository.findByClassSessionIdOrderByPositionAsc(classSessionId).size() + 1;

        CourseMaterial material = new CourseMaterial();
        material.setClassSession(session);
        material.setTitle(title);
        material.setDescription(description);
        material.setFileUrl(uploaded.url());
        material.setFilePublicId(uploaded.publicId());
        material.setFileName(file.getOriginalFilename());
        material.setPosition(nextPosition);
        material = courseMaterialRepository.save(material);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "CourseMaterial", material.getId());
        return MaterialResponse.from(material);
    }

    @Transactional
    public MaterialResponse updateMeta(Long id, MaterialUpdateRequest request) {
        CourseMaterial material = getOrThrow(id);
        material.setTitle(request.title());
        material.setDescription(request.description());
        material = courseMaterialRepository.save(material);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "CourseMaterial", material.getId());
        return MaterialResponse.from(material);
    }

    @Transactional
    public void delete(Long id) {
        CourseMaterial material = getOrThrow(id);
        courseMaterialRepository.delete(material);
        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "DELETE", "CourseMaterial", id);
    }

    @Transactional
    public List<MaterialResponse> reorder(Long classSessionId, List<Long> orderedMaterialIds) {
        List<CourseMaterial> materials = courseMaterialRepository.findByClassSessionIdOrderByPositionAsc(classSessionId);

        ReorderValidation.requireCompleteOrder(materials.stream().map(CourseMaterial::getId).toList(), orderedMaterialIds);

        for (int i = 0; i < materials.size(); i++) {
            materials.get(i).setPosition(-(i + 1));
        }
        courseMaterialRepository.saveAll(materials);
        courseMaterialRepository.flush();

        for (CourseMaterial material : materials) {
            material.setPosition(orderedMaterialIds.indexOf(material.getId()) + 1);
        }
        courseMaterialRepository.saveAll(materials);
        courseMaterialRepository.flush();

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "REORDER", "CourseMaterial", classSessionId);
        return listForClassSession(classSessionId);
    }

    private CourseMaterial getOrThrow(Long id) {
        return courseMaterialRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Material not found: " + id));
    }
}
