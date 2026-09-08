package com.trainingplatform.service;

import com.trainingplatform.dto.CohortResponse;
import com.trainingplatform.dto.CourseDetailResponse;
import com.trainingplatform.dto.CourseListItemResponse;
import com.trainingplatform.dto.FaqResponse;
import com.trainingplatform.dto.ModuleResponse;
import com.trainingplatform.dto.PrivateTutorialOptionResponse;
import com.trainingplatform.dto.TopicResponse;
import com.trainingplatform.entity.CohortStatus;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.CourseModule;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CohortRepository;
import com.trainingplatform.repository.CourseModuleRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.repository.CourseTopicRepository;
import com.trainingplatform.repository.FaqRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicCourseService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final CourseTopicRepository topicRepository;
    private final FaqRepository faqRepository;
    private final CohortRepository cohortRepository;

    public List<CourseListItemResponse> listPublished(String level) {
        var openCohorts = cohortRepository.findByStatus(CohortStatus.OPEN).stream().collect(Collectors.groupingBy(cohort -> cohort.getCourse().getId()));
        return courseRepository.findAll().stream()
                .filter(Course::isPublished)
                .filter(course -> level == null || level.isBlank() || level.equalsIgnoreCase(course.getLevel()))
                .map(course -> CourseListItemResponse.from(course, openCohorts.getOrDefault(course.getId(), List.of())))
                .toList();
    }

    public CourseDetailResponse getPublishedBySlug(String slug) {
        Course course = courseRepository
                .findBySlug(slug)
                .filter(Course::isPublished)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + slug));

        List<ModuleResponse> modules = moduleRepository.findByCourseIdOrderByPositionAsc(course.getId()).stream()
                .map(this::toModuleResponse)
                .toList();
        List<FaqResponse> faqs = faqRepository.findByCourseIdOrderByPositionAsc(course.getId()).stream()
                .map(FaqResponse::from)
                .toList();

        return CourseDetailResponse.from(course, modules, faqs);
    }

    public List<CohortResponse> listOpenCohorts(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found: " + courseId);
        }
        return cohortRepository.findByCourseIdAndStatus(courseId, CohortStatus.OPEN).stream()
                .map(CohortResponse::from)
                .toList();
    }

    // One entry per course (its earliest open private cohort) — a course with several standing
    // private-tutorial cohorts still only needs one card on the public page.
    public List<PrivateTutorialOptionResponse> listPrivateTutorialOptions() {
        Map<Long, PrivateTutorialOptionResponse> byCourse = new LinkedHashMap<>();
        for (var cohort : cohortRepository.findByPrivateTutorialTrueAndStatusOrderByCourseIdAsc(CohortStatus.OPEN)) {
            if (!cohort.getCourse().isPublished()) {
                continue;
            }
            byCourse.putIfAbsent(cohort.getCourse().getId(), PrivateTutorialOptionResponse.from(cohort));
        }
        return List.copyOf(byCourse.values());
    }

    private ModuleResponse toModuleResponse(CourseModule module) {
        List<TopicResponse> topics = topicRepository.findByModuleIdOrderByPositionAsc(module.getId()).stream()
                .map(TopicResponse::from)
                .toList();
        // Class sessions are gated lesson content for enrolled students only (see
        // StudentPortalService) — this public endpoint never includes them, unlike the admin
        // module listing.
        return ModuleResponse.from(module, topics, List.of());
    }
}
