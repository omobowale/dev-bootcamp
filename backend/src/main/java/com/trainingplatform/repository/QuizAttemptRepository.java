package com.trainingplatform.repository;

import com.trainingplatform.entity.QuizAttempt;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizIdAndStudentIdOrderByCreatedAtDesc(Long quizId, Long studentId);

    int countByQuizIdAndStudentId(Long quizId, Long studentId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from QuizAttempt a where a.id = :id and a.student.id = :studentId")
    Optional<QuizAttempt> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("studentId") Long studentId);

    Optional<QuizAttempt> findByIdAndStudentId(Long id, Long studentId);

    List<QuizAttempt> findByQuizIdOrderByCreatedAtDesc(Long quizId);
}
