package com.trainingplatform.repository;

import com.trainingplatform.entity.Quiz;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select q from Quiz q where q.id = :id")
    Optional<Quiz> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    Optional<Quiz> findByClassSessionId(Long classSessionId);

    List<Quiz> findByClassSession_Module_Course_Id(Long courseId);
}
