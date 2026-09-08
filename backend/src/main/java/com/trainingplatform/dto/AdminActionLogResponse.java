package com.trainingplatform.dto;

import com.trainingplatform.entity.AdminActionLog;
import java.time.Instant;

public record AdminActionLogResponse(
        String action, String entityType, Long entityId, String details, String adminName, Instant createdAt) {

    public static AdminActionLogResponse from(AdminActionLog log) {
        return new AdminActionLogResponse(
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDetails(),
                log.getAdmin().getName(),
                log.getCreatedAt());
    }
}
