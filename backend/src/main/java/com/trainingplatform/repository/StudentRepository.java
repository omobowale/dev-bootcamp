package com.trainingplatform.repository;

import com.trainingplatform.entity.Student;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);

    Optional<Student> findByInviteToken(String inviteToken);

    boolean existsByEmail(String email);
}
