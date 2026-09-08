package com.trainingplatform.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.trainingplatform.dto.*;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.*;
import com.trainingplatform.security.CurrentStudentProvider;
import com.trainingplatform.exception.BadRequestException;
import java.util.*;
import org.junit.jupiter.api.Test;

class LmsRegressionTest {
    private final CurrentStudentProvider current = mock(CurrentStudentProvider.class);
    private final QuizRepository quizzes = mock(QuizRepository.class);
    private final QuizQuestionRepository questions = mock(QuizQuestionRepository.class);
    private final QuizAttemptRepository attempts = mock(QuizAttemptRepository.class);
    private final QuizAnswerRepository answers = mock(QuizAnswerRepository.class);
    private final CourseEnrollmentRepository enrollments = mock(CourseEnrollmentRepository.class);
    private final StudentQuizService service = new StudentQuizService(quizzes, questions, attempts, answers, enrollments, current);
    private void quizFixture() {
        Student student = new Student(); student.setId(1L); when(current.getCurrentStudent()).thenReturn(student);
        Course course = new Course();course.setId(7L);CourseModule module = new CourseModule();module.setCourse(course);ClassSession session = new ClassSession();session.setModule(module);
        Quiz quiz = new Quiz(); quiz.setId(2L); quiz.setPassingPercentage(70);quiz.setClassSession(session);
        when(enrollments.existsByStudentIdAndCourseId(1L,7L)).thenReturn(true);
        QuizAttempt attempt = new QuizAttempt(); attempt.setId(3L); attempt.setQuiz(quiz);
        when(attempts.findForUpdate(3L,1L)).thenReturn(Optional.of(attempt));
        QuizQuestion question = new QuizQuestion(); question.setId(4L); question.setText("Question"); question.setPoints(5);
        when(questions.findByQuizIdOrderByPositionAsc(2L)).thenReturn(List.of(question));
    }
    @Test void unansweredQuestionIsGradedZeroInsteadOfCrashing() {
        quizFixture();
        var result = service.submitAttempt(3L,new SubmitQuizAttemptRequest(List.of(new QuizAnswerSubmission(4L,null))));
        assertThat(result.score()).isZero(); assertThat(result.totalPossible()).isEqualTo(5); assertThat(result.passed()).isFalse();
        verify(answers).save(any());
    }
    @Test void foreignQuestionIsRejectedBeforeSavingAnswers() {
        quizFixture();
        assertThatThrownBy(() -> service.submitAttempt(3L,new SubmitQuizAttemptRequest(List.of(new QuizAnswerSubmission(99L,null)))))
            .isInstanceOf(BadRequestException.class);
        verify(answers,never()).save(any());
    }
    @Test void duplicateUnansweredQuestionIsRejected() {
        quizFixture();
        assertThatThrownBy(() -> service.submitAttempt(3L,new SubmitQuizAttemptRequest(List.of(new QuizAnswerSubmission(4L,null),new QuizAnswerSubmission(4L,null)))))
            .isInstanceOf(BadRequestException.class);
    }
    @Test void emptyCourseCannotComplete() {
        Student student = new Student(); student.setId(1L); when(current.getCurrentStudent()).thenReturn(student);
        when(enrollments.existsByStudentIdAndCourseId(1L,2L)).thenReturn(true);
        var progress = new StudentProgressService(mock(ClassSessionRepository.class),mock(ClassCompletionRepository.class),quizzes,attempts,
            mock(AssignmentRepository.class),mock(AssignmentSubmissionRepository.class),mock(AttendanceRecordRepository.class),
            mock(CourseCompletionCriteriaRepository.class),enrollments,current);
        assertThat(progress.getProgress(2L).courseComplete()).isFalse();
    }
    @Test void refreshResumesOpenAttemptEvenWhenLimitIsReached() {
        Student student = new Student();student.setId(1L);when(current.getCurrentStudent()).thenReturn(student);
        Course course = new Course();course.setId(7L);CourseModule module = new CourseModule();module.setCourse(course);
        ClassSession session = new ClassSession();session.setModule(module);
        Quiz quiz = new Quiz();quiz.setId(2L);quiz.setClassSession(session);quiz.setMaxAttempts(1);quiz.setPassingPercentage(70);
        when(quizzes.findForUpdate(2L)).thenReturn(Optional.of(quiz));
        when(enrollments.existsByStudentIdAndCourseId(1L,7L)).thenReturn(true);
        QuizAttempt attempt = new QuizAttempt();attempt.setId(3L);attempt.setQuiz(quiz);attempt.setQuestionSnapshot(QuizSnapshot.encode(List.of()));attempt.setPassingPercentageSnapshot(70);
        when(attempts.findByQuizIdAndStudentIdOrderByCreatedAtDesc(2L,1L)).thenReturn(List.of(attempt));
        assertThat(service.startAttempt(2L).attemptId()).isEqualTo(3L);
        verify(attempts,never()).save(any());
    }
    @Test void gradingAndResultHistoryUseFrozenContent() {
        quizFixture();
        QuizAttempt attempt = attempts.findForUpdate(3L,1L).orElseThrow();
        QuizQuestion question = questions.findByQuizIdOrderByPositionAsc(2L).getFirst();
        question.setOptions(List.of(new QuizOption("Original correct answer",true,0),new QuizOption("Wrong",false,1)));
        attempt.setQuestionSnapshot(QuizSnapshot.encode(List.of(question)));attempt.setPassingPercentageSnapshot(70);
        question.setText("Changed question");question.setPoints(100);question.getOptions().getFirst().setCorrect(false);
        attempt.getQuiz().setPassingPercentage(100);
        var result = service.submitAttempt(3L,new SubmitQuizAttemptRequest(List.of(new QuizAnswerSubmission(4L,0))));
        assertThat(result.score()).isEqualTo(5);assertThat(result.passed()).isTrue();assertThat(result.passingPercentage()).isEqualTo(70);
        assertThat(result.answers().getFirst().text()).isEqualTo("Question");
        when(attempts.findByIdAndStudentId(3L,1L)).thenReturn(Optional.of(attempt));
        when(questions.findByQuizIdOrderByPositionAsc(2L)).thenReturn(List.of());
        assertThat(service.getAttemptResult(3L)).isEqualTo(result);
        verify(answers,never()).save(any());
    }
    @Test void studentSnapshotProjectionDoesNotExposeAnswerKeys() {
        QuizQuestion question = new QuizQuestion();question.setId(1L);question.setText("Prompt");question.setExplanation("Secret explanation");
        question.setOptions(List.of(new QuizOption("Answer",true,0)));
        var restored = QuizSnapshot.decode(QuizSnapshot.encode(List.of(question))).getFirst();
        String json = QuizSnapshot.JSON.writeValueAsString(StudentQuizQuestionResponse.from(restored));
        assertThat(json).doesNotContain("correct", "explanation", "Secret explanation");
    }
}
