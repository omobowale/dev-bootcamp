package com.trainingplatform.repository;

import com.trainingplatform.entity.AssignmentSubmission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<AssignmentSubmission> {
    boolean existsByAssignmentId(Long assignmentId);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    List<AssignmentSubmission> findByAssignmentIdOrderByStatusAscSubmittedAtDesc(Long assignmentId);
}
