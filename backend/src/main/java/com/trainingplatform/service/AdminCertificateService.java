package com.trainingplatform.service;

import com.trainingplatform.dto.AdminCertificateResponse;
import com.trainingplatform.repository.CertificateRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCertificateService {

    private final CertificateRepository certificateRepository;

    @Transactional(readOnly = true)
    public List<AdminCertificateResponse> listForCourse(Long courseId) {
        return certificateRepository.findByCourseIdOrderByCreatedAtDesc(courseId).stream()
                .map(AdminCertificateResponse::from)
                .toList();
    }
}
