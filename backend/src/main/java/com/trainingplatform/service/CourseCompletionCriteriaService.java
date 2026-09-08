package com.trainingplatform.service;

import com.trainingplatform.dto.CourseCompletionCriteriaRequest;
import com.trainingplatform.dto.CourseCompletionCriteriaResponse;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.CourseCompletionCriteria;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CourseCompletionCriteriaRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseCompletionCriteriaService {

    private final CourseCompletionCriteriaRepository criteriaRepository;
    private final CourseRepository courseRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public CourseCompletionCriteriaResponse getForCourse(Long courseId) {
        return criteriaRepository
                .findByCourseId(courseId)
                .map(CourseCompletionCriteriaResponse::from)
                .orElseGet(() -> CourseCompletionCriteriaResponse.defaultsFor(courseId));
    }

    @Transactional
    public CourseCompletionCriteriaResponse update(Long courseId, CourseCompletionCriteriaRequest request) {
        CourseCompletionCriteria criteria = criteriaRepository.findByCourseId(courseId).orElseGet(() -> {
            Course course = courseRepository
                    .findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
            CourseCompletionCriteria created = new CourseCompletionCriteria();
            created.setCourse(course);
            return created;
        });

        criteria.setRequireAllClassesCompleted(request.requireAllClassesCompleted());
        criteria.setRequireAllQuizzesPassed(request.requireAllQuizzesPassed());
        criteria.setRequireAllAssignmentsReviewed(request.requireAllAssignmentsReviewed());
        criteria.setMinAttendancePercentage(request.minAttendancePercentage());
        criteria = criteriaRepository.save(criteria);

        adminActionLogService.log(
                currentAdminProvider.getCurrentAdmin(), "UPDATE", "CourseCompletionCriteria", courseId);
        return CourseCompletionCriteriaResponse.from(criteria);
    }
}
