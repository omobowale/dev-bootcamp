package com.trainingplatform.service;

import com.trainingplatform.dto.AdminActionLogResponse;
import com.trainingplatform.dto.PagedResponse;
import com.trainingplatform.entity.Admin;
import com.trainingplatform.entity.AdminActionLog;
import com.trainingplatform.repository.AdminActionLogRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    @Transactional(readOnly = true)
    public PagedResponse<AdminActionLogResponse> listAll(String entityType, String search, int page, int size) {
        Specification<AdminActionLog> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (entityType != null && !entityType.isBlank()) {
                predicates.add(cb.equal(root.get("entityType"), entityType));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("action")), pattern),
                        cb.like(cb.lower(root.get("details")), pattern),
                        cb.like(cb.lower(root.get("admin").get("name")), pattern)));
            }
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
        var results = adminActionLogRepository
                .findAll(spec, PageRequest.of(Math.max(0, page), size, Sort.by("createdAt").descending()))
                .map(AdminActionLogResponse::from);
        return PagedResponse.from(results);
    }
}
