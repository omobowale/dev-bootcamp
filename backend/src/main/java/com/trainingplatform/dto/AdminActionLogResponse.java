package com.trainingplatform.dto;

import com.trainingplatform.entity.AdminActionLog;
import java.time.Instant;

public record AdminActionLogResponse(String action, String details, String adminName, Instant createdAt) {

    public static AdminActionLogResponse from(AdminActionLog log) {
        return new AdminActionLogResponse(log.getAction(), log.getDetails(), log.getAdmin().getName(), log.getCreatedAt());
    }
}
