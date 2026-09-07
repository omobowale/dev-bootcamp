package com.trainingplatform.service;

import com.trainingplatform.dto.AdminRegistrationListItemResponse;
import com.trainingplatform.dto.DashboardResponse;
import com.trainingplatform.entity.CohortStatus;
import com.trainingplatform.entity.RegistrationStatus;
import com.trainingplatform.repository.CohortRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.repository.RegistrationRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final CourseRepository courseRepository;
    private final CohortRepository cohortRepository;
    private final RegistrationRepository registrationRepository;

    public DashboardResponse getMetrics() {
        Map<String, Long> registrationsByStatus = new LinkedHashMap<>();
        for (RegistrationStatus status : RegistrationStatus.values()) {
            registrationsByStatus.put(status.name(), registrationRepository.countByStatus(status));
        }

        var recent = registrationRepository.findRecent(PageRequest.of(0, 5)).stream()
                .map(AdminRegistrationListItemResponse::from)
                .toList();

        return new DashboardResponse(
                courseRepository.count(),
                courseRepository.countByPublishedTrue(),
                cohortRepository.count(),
                cohortRepository.countByStatus(CohortStatus.OPEN),
                registrationRepository.count(),
                registrationsByStatus,
                recent);
    }
}
