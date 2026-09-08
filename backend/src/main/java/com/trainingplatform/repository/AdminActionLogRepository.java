package com.trainingplatform.repository;

import com.trainingplatform.entity.AdminActionLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AdminActionLogRepository
        extends JpaRepository<AdminActionLog, Long>, JpaSpecificationExecutor<AdminActionLog> {
    List<AdminActionLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
}
