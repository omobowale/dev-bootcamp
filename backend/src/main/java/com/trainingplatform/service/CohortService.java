package com.trainingplatform.service;

import com.trainingplatform.dto.CohortRequest;
import com.trainingplatform.dto.CohortResponse;
import com.trainingplatform.entity.Cohort;
import com.trainingplatform.entity.CohortStatus;
import com.trainingplatform.entity.Course;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CohortRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CohortService {

    private final CohortRepository cohortRepository;
    private final CourseRepository courseRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public List<CohortResponse> findAll() {
        return cohortRepository.findAll().stream().map(CohortResponse::from).toList();
    }

    @Transactional
    public CohortResponse create(Long courseId, CohortRequest request) {
        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        Cohort cohort = new Cohort();
        cohort.setCourse(course);
        applyRequest(cohort, request);
        cohort = cohortRepository.save(cohort);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "Cohort", cohort.getId());
        return CohortResponse.from(cohort);
    }

    @Transactional
    public CohortResponse update(Long id, CohortRequest request) {
        Cohort cohort = getOrThrow(id);
        applyRequest(cohort, request);
        cohort = cohortRepository.save(cohort);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "Cohort", cohort.getId());
        return CohortResponse.from(cohort);
    }

    @Transactional
    public void archive(Long id) {
        Cohort cohort = getOrThrow(id);
        cohort.setStatus(CohortStatus.CLOSED);
        cohortRepository.save(cohort);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "ARCHIVE", "Cohort", cohort.getId());
    }

    private Cohort getOrThrow(Long id) {
        return cohortRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found: " + id));
    }

    private void applyRequest(Cohort cohort, CohortRequest request) {
        cohort.setName(request.name());
        cohort.setStartDate(request.startDate());
        cohort.setEndDate(request.endDate());
        cohort.setSchedule(request.schedule());
        cohort.setTime(request.time());
        cohort.setMode(request.mode());
        cohort.setLocation(request.location());
        cohort.setCapacity(request.capacity());
        cohort.setPrivateTutorial(request.privateTutorial());
        if (request.status() != null) {
            cohort.setStatus(request.status());
        }
    }
}
