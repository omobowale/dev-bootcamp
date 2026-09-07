package com.trainingplatform.service;

import com.trainingplatform.dto.AdminActionLogResponse;
import com.trainingplatform.entity.Admin;
import com.trainingplatform.entity.AdminActionLog;
import com.trainingplatform.repository.AdminActionLogRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminActionLogService {

    private final AdminActionLogRepository adminActionLogRepository;

    public void log(Admin admin, String action, String entityType, Long entityId) {
        log(admin, action, entityType, entityId, null);
    }

    public void log(Admin admin, String action, String entityType, Long entityId, String details) {
        AdminActionLog entry = new AdminActionLog();
        entry.setAdmin(admin);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details);
        adminActionLogRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public List<AdminActionLogResponse> findFor(String entityType, Long entityId) {
        return adminActionLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId).stream()
                .map(AdminActionLogResponse::from)
                .toList();
    }
}
