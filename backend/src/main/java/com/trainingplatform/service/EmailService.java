package com.trainingplatform.service;

import com.trainingplatform.entity.Registration;
import com.trainingplatform.entity.Student;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Registration should never fail because email delivery failed — every send here is
 * best-effort and swallows its own exceptions (logged, not rethrown).
 */
@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String adminNotificationTo;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String fromAddress,
            @Value("${app.mail.admin-notification-to:}") String adminNotificationTo) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.adminNotificationTo = adminNotificationTo;
    }

    public void sendRegistrationConfirmation(Registration registration) {
        boolean isPrivate = registration.getCohort().isPrivateTutorial();
        String preferredTimeLine = registration.getPreferredTime() != null && !registration.getPreferredTime().isBlank()
                ? "\nYour preferred time: %s\n".formatted(registration.getPreferredTime())
                : "";
        String nextStepsLine = isPrivate
                ? "This is a private tutorial — our team will reach out on WhatsApp (%s) to confirm a time that works for both you and the instructor."
                        .formatted(registration.getWhatsappNumber())
                : "Our team will reach out to you on WhatsApp (%s) with next steps, including how to join the course WhatsApp group."
                        .formatted(registration.getWhatsappNumber());

        String body =
                """
                Hi %s,

                Thanks for registering for %s (%s)!

                Your registration number is: %s
                %s
                %s

                See you soon!
                """
                        .formatted(
                                registration.getFullName(),
                                registration.getCourse().getTitle(),
                                registration.getCohort().getName(),
                                registration.getRegistrationNumber(),
                                preferredTimeLine,
                                nextStepsLine);

        send(registration.getEmail(), "Your registration is confirmed — " + registration.getRegistrationNumber(), body);
    }

    public void sendAdminNotification(Registration registration) {
        if (adminNotificationTo == null || adminNotificationTo.isBlank()) {
            log.info("No ADMIN_NOTIFICATION_EMAIL configured — skipping admin notification email.");
            return;
        }

        String body =
                """
                New registration received.

                Registration number: %s
                Name: %s
                Email: %s
                WhatsApp: %s
                Course: %s
                Cohort: %s%s
                """
                        .formatted(
                                registration.getRegistrationNumber(),
                                registration.getFullName(),
                                registration.getEmail(),
                                registration.getWhatsappNumber(),
                                registration.getCourse().getTitle(),
                                registration.getCohort().getName()
                                        + (registration.getCohort().isPrivateTutorial() ? " (PRIVATE TUTORIAL)" : ""),
                                registration.getPreferredTime() != null && !registration.getPreferredTime().isBlank()
                                        ? "\nPreferred time: " + registration.getPreferredTime()
                                        : "");

        send(adminNotificationTo, "New registration — " + registration.getRegistrationNumber(), body);
    }

    public void sendStudentInvite(Student student, String inviteUrl, String courseTitle) {
        String body =
                """
                Hi %s,

                Your payment for %s has been confirmed and your student portal account is ready.

                Your Student ID: %s

                Set your password to get started:
                %s

                This link expires in 7 days. See you in class!
                """
                        .formatted(student.getFullName(), courseTitle, student.getStudentId(), inviteUrl);

        send(student.getEmail(), "Set up your student portal access — " + student.getStudentId(), body);
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
