package com.trainingplatform.service;

import com.trainingplatform.dto.PublicCertificateResponse;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicCertificateService {

    private final CertificateRepository certificateRepository;

    @Transactional(readOnly = true)
    public PublicCertificateResponse verify(String verificationId) {
        return certificateRepository
                .findByVerificationId(verificationId)
                .map(PublicCertificateResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("No certificate found for this verification ID."));
    }
}
