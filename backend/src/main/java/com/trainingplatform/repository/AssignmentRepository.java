package com.trainingplatform.repository;

import com.trainingplatform.entity.Assignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Optional<Assignment> findByClassSessionId(Long classSessionId);

    List<Assignment> findByClassSession_Module_Course_Id(Long courseId);
}
