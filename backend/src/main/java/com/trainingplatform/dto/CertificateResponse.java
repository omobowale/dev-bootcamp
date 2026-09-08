package com.trainingplatform.dto;

import com.trainingplatform.entity.Certificate;
import java.time.LocalDate;

public record CertificateResponse(
        String verificationId, String studentName, String studentCode, String courseTitle, LocalDate completionDate) {

    public static CertificateResponse from(Certificate certificate) {
        return new CertificateResponse(
                certificate.getVerificationId(),
                certificate.getStudent().getFullName(),
                certificate.getStudent().getStudentId(),
                certificate.getCourse().getTitle(),
                certificate.getCompletionDate());
    }
}
