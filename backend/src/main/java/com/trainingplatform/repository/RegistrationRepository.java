package com.trainingplatform.repository;

import com.trainingplatform.entity.Registration;
import com.trainingplatform.entity.RegistrationStatus;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface RegistrationRepository
        extends JpaRepository<Registration, Long>, JpaSpecificationExecutor<Registration> {
    boolean existsByEmailAndCohortId(String email, Long cohortId);

    long countByCohortId(Long cohortId);

    long countByStatus(RegistrationStatus status);

    @Query("select r from Registration r order by r.createdAt desc")
    List<Registration> findRecent(Pageable pageable);
}
