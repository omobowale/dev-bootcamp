package com.trainingplatform.repository;

import com.trainingplatform.entity.Cohort;
import com.trainingplatform.entity.CohortStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CohortRepository extends JpaRepository<Cohort, Long> {
    List<Cohort> findByCourseId(Long courseId);

    List<Cohort> findByCourseIdAndStatus(Long courseId, CohortStatus status);

    List<Cohort> findByStatus(CohortStatus status);

    long countByStatus(CohortStatus status);

    List<Cohort> findByPrivateTutorialTrueAndStatusOrderByCourseIdAsc(CohortStatus status);
}
