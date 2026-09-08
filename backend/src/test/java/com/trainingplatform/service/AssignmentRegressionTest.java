package com.trainingplatform.service;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.*;
import com.trainingplatform.security.CurrentStudentProvider;
import com.trainingplatform.exception.BadRequestException;
import java.util.*;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;

class AssignmentRegressionTest {
    private final AssignmentRepository assignments = mock(AssignmentRepository.class);
    private final AssignmentSubmissionRepository submissions = mock(AssignmentSubmissionRepository.class);
    private final CourseEnrollmentRepository enrollments = mock(CourseEnrollmentRepository.class);
    private final CurrentStudentProvider current = mock(CurrentStudentProvider.class);
    private final CloudinaryService uploads = mock(CloudinaryService.class);
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final StudentAssignmentService service = new StudentAssignmentService(assignments,submissions,enrollments,current,uploads,jdbc);
    private final Assignment assignment = new Assignment();
    private AssignmentSubmission fixture(AssignmentSubmissionStatus status) {
        Student student = new Student();student.setId(1L);when(current.getCurrentStudent()).thenReturn(student);
        Course course = new Course();course.setId(2L);CourseModule module = new CourseModule();module.setCourse(course);
        ClassSession session = new ClassSession();session.setModule(module);assignment.setClassSession(session);
        when(assignments.findById(3L)).thenReturn(Optional.of(assignment));when(enrollments.existsByStudentIdAndCourseId(1L,2L)).thenReturn(true);
        AssignmentSubmission submission = new AssignmentSubmission();submission.setId(4L);submission.setVersion(0L);submission.setStatus(status);submission.setScore(80);submission.setFeedback("Previous review");submission.setReviewedAt(Instant.now());
        when(submissions.findByAssignmentIdAndStudentId(3L,1L)).thenReturn(Optional.of(submission));
        when(submissions.saveAndFlush(any())).thenAnswer(i->i.getArgument(0));return submission;
    }
    @Test void reviewedWorkCannotBeReplaced() {
        var previous=fixture(AssignmentSubmissionStatus.REVIEWED);
        assertThatThrownBy(()->service.submit(3L,"Replacement",null,0L)).isInstanceOf(BadRequestException.class);
        assertThat(previous.getScore()).isEqualTo(80);verify(submissions,never()).saveAndFlush(any());
    }
    @Test void requestedCorrectionArchivesOldReviewAndClearsGrade() {
        fixture(AssignmentSubmissionStatus.NEEDS_RESUBMISSION);assignment.setDueAt(Instant.now().minusSeconds(60));
        var result=service.submit(3L,"Corrected response",null,0L);
        assertThat(result.score()).isNull();assertThat(result.feedback()).isNull();assertThat(result.reviewedAt()).isNull();
        assertThat(result.status()).isEqualTo(AssignmentSubmissionStatus.SUBMITTED);
        verify(jdbc).update(anyString(),eq(4L));
    }
    @Test void initialSubmissionAfterDeadlineIsRejected() {
        fixture(AssignmentSubmissionStatus.SUBMITTED);when(submissions.findByAssignmentIdAndStudentId(3L,1L)).thenReturn(Optional.empty());
        assignment.setDueAt(Instant.now().minusSeconds(60));
        assertThatThrownBy(()->service.submit(3L,"Late response",null)).isInstanceOf(BadRequestException.class).hasMessageContaining("deadline");
        verify(submissions,never()).saveAndFlush(any());
    }
    @Test void attachmentAllowlistIsEnforced() {
        assignment.setAllowedAttachmentTypes(".pdf, .txt");
        assertThatThrownBy(()->StudentAssignmentService.validateAttachment(assignment,new MockMultipartFile("file","program.exe","application/octet-stream",new byte[]{1}))).isInstanceOf(BadRequestException.class);
        assertThatCode(()->StudentAssignmentService.validateAttachment(assignment,new MockMultipartFile("file","notes.txt","text/plain",new byte[]{1}))).doesNotThrowAnyException();
    }
}
