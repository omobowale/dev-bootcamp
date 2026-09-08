package com.trainingplatform.service;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.*;
import com.trainingplatform.exception.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class RecoveryAndAccessTest {
    final StudentRepository students=mock(StudentRepository.class);
    final PasswordEncoder passwords=mock(PasswordEncoder.class);
    final EmailService email=mock(EmailService.class);
    final StudentRecoveryService recovery=new StudentRecoveryService(students,passwords,email);
    Student learner() { Student s=new Student();s.setId(1L);s.setEmail("student@example.com");s.setAuthVersion(7);return s; }
    @Test void recoveryStoresOnlyHashAndThrottlesRepeatRequests() {
        Student s=learner();when(students.findByEmailIgnoreCase(s.getEmail())).thenReturn(Optional.of(s));
        ReflectionTestUtils.setField(recovery,"frontendUrl","https://learning.example.com");
        recovery.request(" student@example.com ");
        var link=ArgumentCaptor.forClass(String.class);verify(email).sendStudentRecovery(eq(s),link.capture());
        String token=link.getValue().substring(link.getValue().lastIndexOf('/')+1);
        assertThat(token).hasSize(43);assertThat(s.getRecoveryTokenHash()).isEqualTo(StudentRecoveryService.hash(token)).isNotEqualTo(token);
        assertThat(s.getRecoveryExpiresAt()).isAfter(Instant.now().plusSeconds(1700));
        recovery.request(s.getEmail());verify(email,times(1)).sendStudentRecovery(any(),anyString());
    }
    @Test void resetConsumesLinkAndInvalidatesOldSessions() {
        Student s=learner();s.setRecoveryExpiresAt(Instant.now().plusSeconds(300));s.setInviteToken("old-invite");
        when(students.findByRecoveryTokenHash(StudentRecoveryService.hash("token"))).thenReturn(Optional.of(s));
        when(passwords.encode("new-password")).thenReturn("encoded");recovery.reset("token","new-password");
        assertThat(s.getPasswordHash()).isEqualTo("encoded");assertThat(s.getAuthVersion()).isEqualTo(8);
        assertThat(s.getRecoveryTokenHash()).isNull();assertThat(s.getRecoveryExpiresAt()).isNull();assertThat(s.getInviteToken()).isNull();
    }
    @Test void expiredAndSuspendedAccountsCannotReset() {
        Student s=learner();s.setRecoveryExpiresAt(Instant.now().minusSeconds(1));
        when(students.findByRecoveryTokenHash(anyString())).thenReturn(Optional.of(s));
        assertThatThrownBy(()->recovery.reset("old","password")).isInstanceOf(BadRequestException.class);
        s.setRecoveryExpiresAt(Instant.now().plusSeconds(60));s.setLoginSuspended(true);
        assertThatThrownBy(()->recovery.reset("old","password")).isInstanceOf(BadRequestException.class);verifyNoInteractions(passwords);
    }
    @Test void unknownAccountsDoNotSendMail() {
        when(students.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());recovery.request("missing@example.com");verifyNoInteractions(email);
    }
    @Test void cohortLessonsRequireMatchingActiveEnrollment() {
        var repository=mock(CourseEnrollmentRepository.class);
        Course course=new Course();course.setId(2L);CourseModule module=new CourseModule();module.setCourse(course);
        ClassSession session=new ClassSession();session.setModule(module);session.setCohortId(20L);
        Cohort cohort=new Cohort();cohort.setId(10L);Registration registration=new Registration();registration.setStatus(RegistrationStatus.CONFIRMED);
        CourseEnrollment enrollment=new CourseEnrollment();enrollment.setCourse(course);enrollment.setCohort(cohort);enrollment.setRegistration(registration);enrollment.setActive(true);
        when(repository.existsByStudentIdAndCourseId(1L,2L)).thenReturn(true);
        when(repository.findByStudentIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(enrollment));
        assertThat(LearningAccess.allows(repository,1L,session)).isFalse();
        assertThatThrownBy(()->LearningAccess.requireCohort(repository,1L,2L,20L)).isInstanceOf(ForbiddenException.class);
        session.setCohortId(10L);assertThat(LearningAccess.allows(repository,1L,session)).isTrue();
        enrollment.setActive(false);assertThat(LearningAccess.allows(repository,1L,session)).isFalse();
        enrollment.setActive(true);registration.setStatus(RegistrationStatus.CANCELLED);assertThat(LearningAccess.allows(repository,1L,session)).isFalse();
        session.setCohortId(null);when(repository.existsByStudentIdAndCourseId(1L,2L)).thenReturn(false);
        assertThat(LearningAccess.allows(repository,1L,session)).isFalse();
    }
}
