package com.trainingplatform.dto;

import com.trainingplatform.entity.Certificate;
import java.time.LocalDate;

/** Deliberately minimal — no student email, no internal ids. Anyone with a verification ID can look this up. */
public record PublicCertificateResponse(
        String verificationId, String studentName, String courseTitle, LocalDate completionDate) {

    public static PublicCertificateResponse from(Certificate certificate) {
        return new PublicCertificateResponse(
                certificate.getVerificationId(),
                certificate.getStudent().getFullName(),
                certificate.getCourse().getTitle(),
                certificate.getCompletionDate());
    }
}
