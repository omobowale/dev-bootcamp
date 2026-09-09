package com.trainingplatform.service;

import com.trainingplatform.entity.AssignmentSubmission;
import com.trainingplatform.entity.AssignmentSubmissionStatus;
import com.trainingplatform.entity.Registration;
import com.trainingplatform.entity.Student;
import java.nio.charset.StandardCharsets;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import static com.trainingplatform.service.EmailTemplates.*;

/** Delivery remains best-effort so a mail failure cannot interrupt a registration or review. */
@Slf4j
@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String adminNotificationTo;
    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    public EmailService(JavaMailSender mailSender, @Value("${app.mail.from}") String fromAddress,
            @Value("${app.mail.admin-notification-to:}") String adminNotificationTo) {
        this.mailSender=mailSender; this.fromAddress=fromAddress; this.adminNotificationTo=adminNotificationTo;
    }
    private String link(String path) { return frontendBaseUrl == null ? null : frontendBaseUrl.replaceAll("/+$", "") + path; }
    private String hi(String name) { return "Hi " + name + ","; }
    public void sendRegistrationConfirmation(Registration r) {
        String next=r.getCohort().isPrivateTutorial()
            ? "Our team will contact you on WhatsApp ("+r.getWhatsappNumber()+") to agree on a time with your instructor."
            : "Our team will contact you on WhatsApp ("+r.getWhatsappNumber()+") with next steps and course group details.";
        send(r.getEmail(),"We received your registration - "+r.getRegistrationNumber(),new Content(
            "YOUR NEXT CHAPTER", "You're on the list.", "Your registration details and what happens next.", hi(r.getFullName()),
            "Thanks for registering. We have received your details and look forward to helping you get started.",
            List.of(new Detail("Registration number",r.getRegistrationNumber()),new Detail("Course",r.getCourse().getTitle()),
                new Detail("Learning option",r.getCohort().getName()),new Detail("Preferred time",r.getPreferredTime())),
            next+"\nThis acknowledges your registration; payment confirmation and portal access follow separately.",
            "Explore your course",link("/courses/"+r.getCourse().getSlug()),"You received this email because you registered with Bukiva Learn. Keep your registration number for reference."));
    }
    public void sendAdminNotification(Registration r) {
        if(adminNotificationTo==null||adminNotificationTo.isBlank()) { log.info("Admin registration notification is not configured; skipping."); return; }
        send(adminNotificationTo,"New registration - "+r.getRegistrationNumber(),new Content(
            "ADMIN WORKSPACE","A new learner is ready.","A registration is waiting for your review.","Hello team,",
            "A new registration has arrived. Review the details and contact the learner with the next steps.",
            List.of(new Detail("Registration number",r.getRegistrationNumber()),new Detail("Learner",r.getFullName()),
                new Detail("Email",r.getEmail()),new Detail("WhatsApp",r.getWhatsappNumber()),new Detail("Course",r.getCourse().getTitle()),
                new Detail("Learning option",r.getCohort().getName()+(r.getCohort().isPrivateTutorial()?" (private tutorial)":"")),new Detail("Preferred time",r.getPreferredTime())),
            "Confirm payment through your usual process before granting portal access.","Review registration",link("/admin/registrations/"+r.getId()),
            "This operational notification was sent to the configured Bukiva Learn administrator. Learner details are for course administration."));
    }
    public void sendStudentInvite(Student student,String inviteUrl,String courseTitle) {
        send(student.getEmail(),"Set up your student portal - "+student.getStudentId(),new Content(
            "WELCOME TO BUKIVA LEARN","Your classroom is ready.","Set your password and start your next chapter.",hi(student.getFullName()),
            "Your payment has been confirmed and your student portal account is ready. Set a password to access your learning space.",
            List.of(new Detail("Course",courseTitle),new Detail("Student ID",student.getStudentId())),
            "Your setup link expires in 7 days. Keep this email and link private.","Set up my account",inviteUrl,
            "You received this account invitation following your Bukiva Learn enrollment. If you were not expecting it, contact the team before proceeding."));
    }
    public void sendAssignmentReviewed(AssignmentSubmission s) {
        boolean revise=s.getStatus()==AssignmentSubmissionStatus.NEEDS_RESUBMISSION;
        var assignment=s.getAssignment();var student=s.getStudent();
        send(student.getEmail(),(revise?"Resubmission requested - ":"Your assignment has been reviewed - ")+assignment.getTitle(),new Content(
            "FEEDBACK THAT MOVES YOU FORWARD",revise?"Let's build on your work.":"Your feedback is ready.",
            revise?"Review your instructor's notes and submit an updated response.":"Your instructor has reviewed your assignment.",hi(student.getFullName()),
            revise?"Your instructor has reviewed your work and requested an updated submission. Use their feedback to guide your next version.":"Your instructor has reviewed your work. Open the student portal to explore your feedback and assessment details.",
            List.of(new Detail("Assignment",assignment.getTitle()),new Detail("Course",assignment.getClassSession().getModule().getCourse().getTitle()),
                new Detail("Status",revise?"Resubmission requested":"Reviewed"),new Detail("Score",!revise&&s.getScore()!=null?s.getScore()+" / "+assignment.getMaxScore():null),
                new Detail("Instructor feedback",s.getFeedback())),
            "Open your student portal to review the full assessment and any criterion scores.",
            revise?"Review and resubmit":"View my feedback",link("/student/classes/"+assignment.getClassSession().getId()),
            "You received this learning update because an instructor reviewed your Bukiva Learn assignment."));
    }
    public void sendStudentRecovery(Student student,String url) {
        send(student.getEmail(),"Reset your Bukiva Learn password",new Content(
            "ACCOUNT SECURITY","A fresh start for your password.","Your one-time reset link expires in 30 minutes.",hi(student.getFullName()),
            "We received a request to reset your student portal password. Use the button below to choose a new password.",
            List.of(new Detail("Link validity","30 minutes, one use")),
            "If you did not request this, you can ignore this email. Your password will stay unchanged. Never share this reset link.",
            "Reset my password",url,"This is a security email for your Bukiva Learn student account."));
    }
    private void send(String to,String subject,Content content) {
        try {
            var rendered=EmailTemplates.render(content);
            var message=mailSender.createMimeMessage();
            var helper=new MimeMessageHelper(message,true,StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress);helper.setTo(to);helper.setSubject(subject.replaceAll("[\r\n]", " "));
            helper.setText(rendered.text(),rendered.html());
            mailSender.send(message);
        } catch(Exception e) {
            // Transport errors can contain addresses or message content. Do not log account links.
            log.error("Email delivery failed ({})",e.getClass().getSimpleName());
        }
    }
}
