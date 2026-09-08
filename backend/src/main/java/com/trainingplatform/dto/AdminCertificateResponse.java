package com.trainingplatform.dto;

import com.trainingplatform.entity.Certificate;
import java.time.Instant;
import java.time.LocalDate;

public record AdminCertificateResponse(
        String studentCode, String studentName, String verificationId, LocalDate completionDate, Instant issuedAt) {

    public static AdminCertificateResponse from(Certificate certificate) {
        return new AdminCertificateResponse(
                certificate.getStudent().getStudentId(),
                certificate.getStudent().getFullName(),
                certificate.getVerificationId(),
                certificate.getCompletionDate(),
                certificate.getCreatedAt());
    }
}
