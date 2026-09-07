package com.trainingplatform.service;

import com.trainingplatform.dto.AdminActionLogResponse;
import com.trainingplatform.dto.AdminRegistrationDetailResponse;
import com.trainingplatform.dto.AdminRegistrationListItemResponse;
import com.trainingplatform.dto.PagedResponse;
import com.trainingplatform.entity.Registration;
import com.trainingplatform.entity.RegistrationStatus;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.RegistrationRepository;
import com.trainingplatform.repository.RegistrationSpecifications;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminRegistrationService {

    private final RegistrationRepository registrationRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public PagedResponse<AdminRegistrationListItemResponse> list(
            RegistrationStatus status, Long courseId, Long cohortId, String search, int page, int size) {
        var spec = RegistrationSpecifications.filter(status, courseId, cohortId, search);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = registrationRepository.findAll(spec, pageable).map(AdminRegistrationListItemResponse::from);
        return PagedResponse.from(result);
    }

    @Transactional(readOnly = true)
    public AdminRegistrationDetailResponse getById(Long id) {
        return AdminRegistrationDetailResponse.from(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<AdminActionLogResponse> getActivity(Long id) {
        getOrThrow(id);
        return adminActionLogService.findFor("Registration", id);
    }

    @Transactional
    public AdminRegistrationDetailResponse updateStatus(Long id, RegistrationStatus newStatus) {
        Registration registration = getOrThrow(id);
        registration.setStatus(newStatus);
        registration = registrationRepository.save(registration);

        adminActionLogService.log(
                currentAdminProvider.getCurrentAdmin(),
                "UPDATE_STATUS",
                "Registration",
                registration.getId(),
                "New status: " + newStatus);

        return AdminRegistrationDetailResponse.from(registration);
    }

    private Registration getOrThrow(Long id) {
        return registrationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + id));
    }
}
