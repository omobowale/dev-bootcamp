package com.trainingplatform.repository;

import com.trainingplatform.entity.Registration;
import com.trainingplatform.entity.RegistrationStatus;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public final class RegistrationSpecifications {

    private RegistrationSpecifications() {
    }

    public static Specification<Registration> filter(
            RegistrationStatus status, Long courseId, Long cohortId, String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (courseId != null) {
                predicates.add(cb.equal(root.get("course").get("id"), courseId));
            }
            if (cohortId != null) {
                predicates.add(cb.equal(root.get("cohort").get("id"), cohortId));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("registrationNumber")), pattern)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
