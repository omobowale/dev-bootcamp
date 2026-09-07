package com.trainingplatform.service;

import com.trainingplatform.dto.CourseRequest;
import com.trainingplatform.dto.CourseResponse;
import com.trainingplatform.dto.IncludedItemDto;
import com.trainingplatform.entity.Course;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ConflictException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public List<CourseResponse> findAll() {
        return courseRepository.findAll().stream().map(CourseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse findById(Long id) {
        return CourseResponse.from(getOrThrow(id));
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        if (courseRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A course with slug '" + request.slug() + "' already exists");
        }

        Course course = new Course();
        applyRequest(course, request);
        course = courseRepository.save(course);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "Course", course.getId());
        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course course = getOrThrow(id);

        if (courseRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new ConflictException("A course with slug '" + request.slug() + "' already exists");
        }

        applyRequest(course, request);
        course = courseRepository.save(course);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "Course", course.getId());
        return CourseResponse.from(course);
    }

    @Transactional
    public void archive(Long id) {
        Course course = getOrThrow(id);
        course.setPublished(false);
        courseRepository.save(course);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "ARCHIVE", "Course", course.getId());
    }

    private Course getOrThrow(Long id) {
        return courseRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
    }

    private void applyRequest(Course course, CourseRequest request) {
        if (request.discountPrice() != null
                && request.price() != null
                && request.discountPrice().compareTo(request.price()) >= 0) {
            throw new BadRequestException("Discount price must be lower than the regular price.");
        }

        course.setTitle(request.title());
        course.setSlug(request.slug());
        course.setShortDescription(request.shortDescription());
        course.setDescription(request.description());
        course.setImage(request.image());
        course.setLevel(request.level());
        course.setDuration(request.duration());
        course.setMode(request.mode());
        course.setPrice(request.price());
        course.setDiscountPrice(request.discountPrice());
        course.setRequirements(request.requirements());
        course.setTargetAudience(request.targetAudience());
        course.setCertificateAvailable(request.certificateAvailable());
        course.setPublished(request.published());
        course.setInstructorName(request.instructorName());
        course.setInstructorBio(request.instructorBio());
        course.setInstructorAvatarUrl(request.instructorAvatarUrl());
        course.setProjects(request.projects());

        // Replace in place rather than reassigning the list reference — Hibernate manages this
        // @ElementCollection as a persistent collection tied to the owning entity, and swapping
        // in a brand new List instance on update loses that association. Position is assigned
        // from list order here since it's a plain sort column (@OrderBy), not something the
        // client sends explicitly.
        course.getWhatsIncluded().clear();
        List<IncludedItemDto> items = request.whatsIncluded() != null ? request.whatsIncluded() : List.of();
        for (int i = 0; i < items.size(); i++) {
            course.getWhatsIncluded().add(items.get(i).toEntity(i));
        }

        course.setAiSkillsDescription(request.aiSkillsDescription());
    }
}
