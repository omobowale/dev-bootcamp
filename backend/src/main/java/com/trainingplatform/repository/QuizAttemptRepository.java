package com.trainingplatform.repository;

import com.trainingplatform.entity.QuizAttempt;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizIdAndStudentIdOrderByCreatedAtDesc(Long quizId, Long studentId);

    int countByQuizIdAndStudentId(Long quizId, Long studentId);

    Optional<QuizAttempt> findByIdAndStudentId(Long id, Long studentId);

    List<QuizAttempt> findByQuizIdOrderByCreatedAtDesc(Long quizId);
}
