package com.trainingplatform.service;

import com.trainingplatform.entity.*;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;
import java.nio.file.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailTemplatesTest {
    @Test void escapesDynamicContentAndRejectsUnsafeLinks() {
        var content=new EmailTemplates.Content("UPDATE","<script>alert(1)</script>","Preview","Hi <img src=x>,",
            "Keep {{action}} as text & learn",List.of(new EmailTemplates.Detail("Course","<b>React</b>")),
            "Line one\nLine two","Open","javascript:alert(1)","Footer");
        var rendered=EmailTemplates.render(content);
        assertThat(rendered.html()).doesNotContain("<script>alert(1)</script>","<img src=x>", "javascript:","<b>React</b>")
            .contains("&lt;script&gt;","&lt;b&gt;React&lt;/b&gt;","Keep {{action}} as text &amp; learn","Line one<br>Line two");
        assertThat(rendered.text()).contains("Line one\nLine two","Course: <b>React</b>").doesNotContain("javascript:");
    }

    @Test void allSixEmailsHavePlainTextHtmlAndWorkingActionLinks() throws Exception {
        var sender=mock(JavaMailSender.class);
        when(sender.createMimeMessage()).thenAnswer(i->new MimeMessage(Session.getInstance(new Properties())));
        var service=new EmailService(sender,"hello@example.com","admin@example.com");
        ReflectionTestUtils.setField(service,"frontendBaseUrl","https://learning.example.com/");
        var course=new Course();course.setTitle("React & accessible interfaces");course.setSlug("react");
        var cohort=new Cohort();cohort.setName("September cohort");cohort.setPrivateTutorial(true);
        var r=new Registration();r.setId(11L);r.setCourse(course);r.setCohort(cohort);r.setFullName("Ada Learner");
        r.setEmail("learner@example.com");r.setWhatsappNumber("+234 800 000 0000");r.setRegistrationNumber("REG-DEMO-001");r.setPreferredTime("Weekdays, 6pm");
        var student=new Student();student.setFullName("Ada Learner");student.setEmail("learner@example.com");student.setStudentId("STU-DEMO-001");
        var module=new CourseModule();module.setCourse(course);var session=new ClassSession();session.setId(21L);session.setModule(module);
        var assignment=new Assignment();assignment.setTitle("Build an accessible course catalogue");assignment.setMaxScore(100);assignment.setClassSession(session);
        var submission=new AssignmentSubmission();submission.setStudent(student);submission.setAssignment(assignment);submission.setScore(86);submission.setStatus(AssignmentSubmissionStatus.REVIEWED);
        service.sendRegistrationConfirmation(r);service.sendAdminNotification(r);
        service.sendStudentInvite(student,"https://learning.example.com/student/invite/demo-token",course.getTitle());
        service.sendAssignmentReviewed(submission);submission.setStatus(AssignmentSubmissionStatus.NEEDS_RESUBMISSION);service.sendAssignmentReviewed(submission);
        service.sendStudentRecovery(student,"https://learning.example.com/student/reset-password/demo-token?one=1&two=2");
        var captor=ArgumentCaptor.forClass(MimeMessage.class);verify(sender,times(6)).send(captor.capture());
        var names=List.of("registration","admin-registration","invitation","assignment-reviewed","resubmission","password-reset");
        var urls=List.of("/courses/react","/admin/registrations/11","/student/invite/demo-token","/student/classes/21","/student/classes/21","/student/reset-password/demo-token");
        for(int i=0;i<6;i++) {
            var message=captor.getAllValues().get(i);message.saveChanges();
            var parts=new HashMap<String,String>();collect(message,parts);
            assertThat(parts).containsKeys("text/plain","text/html");
            assertThat(parts.get("text/html")).contains("Bukiva Learn","role=\"presentation\"",urls.get(i)).doesNotContain("{{",">null<");
            assertThat(parts.get("text/plain")).contains("Bukiva Learn",urls.get(i)).doesNotContain("<table");
            assertThat(message.getFrom()[0].toString()).isEqualTo("hello@example.com");
            assertThat(message.getAllRecipients()[0].toString()).isEqualTo(i==1?"admin@example.com":"learner@example.com");
            if(i==5)assertThat(parts.get("text/html")).contains("one=1&amp;two=2","30 minutes");
            String directory=System.getProperty("email.preview.directory");
            if(directory!=null){Path path=Path.of(directory);Files.createDirectories(path);Files.writeString(path.resolve(names.get(i)+".html"),parts.get("text/html"));Files.writeString(path.resolve(names.get(i)+".txt"),parts.get("text/plain"));}
        }
    }
    private void collect(Part part,Map<String,String> parts)throws Exception {
        if(part.isMimeType("multipart/*")){var multi=(Multipart)part.getContent();for(int i=0;i<multi.getCount();i++)collect(multi.getBodyPart(i),parts);}
        else if(part.isMimeType("text/html"))parts.put("text/html",(String)part.getContent());
        else if(part.isMimeType("text/plain"))parts.put("text/plain",(String)part.getContent());
    }
    @Test void transportFailureRemainsBestEffortAndMissingAdminRecipientSkipsDelivery() {
        var sender=mock(JavaMailSender.class);when(sender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
        doThrow(new MailSendException("Transport unavailable")).when(sender).send(any(MimeMessage.class));
        var service=new EmailService(sender,"hello@example.com","");var student=new Student();student.setEmail("learner@example.com");student.setFullName("Learner");
        assertThatCode(()->service.sendStudentRecovery(student,"https://learning.example.com/reset/demo")).doesNotThrowAnyException();
        service.sendAdminNotification(new Registration());verify(sender,times(1)).send(any(MimeMessage.class));
    }
}
