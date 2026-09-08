package com.trainingplatform.repository;

import com.trainingplatform.entity.Student;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select s from Student s where s.id=:id")
    Optional<Student> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    Optional<Student> findByInviteToken(String inviteToken);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    Optional<Student> findByEmailIgnoreCase(String email);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    Optional<Student> findByRecoveryTokenHash(String hash);

    boolean existsByEmail(String email);
}
