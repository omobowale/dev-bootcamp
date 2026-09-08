package com.trainingplatform.repository;

import com.trainingplatform.entity.Assignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from Assignment a where a.id=:id")
    Optional<Assignment> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    Optional<Assignment> findByClassSessionId(Long classSessionId);

    List<Assignment> findByClassSession_Module_Course_Id(Long courseId);
}
