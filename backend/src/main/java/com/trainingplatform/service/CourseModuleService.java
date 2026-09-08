package com.trainingplatform.service;

import com.trainingplatform.dto.ClassSessionResponse;
import com.trainingplatform.dto.ModuleRequest;
import com.trainingplatform.dto.ModuleResponse;
import com.trainingplatform.dto.TopicResponse;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.CourseModule;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.ClassSessionRepository;
import com.trainingplatform.repository.CourseModuleRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.repository.CourseTopicRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseModuleService {

    private final CourseModuleRepository moduleRepository;
    private final CourseTopicRepository topicRepository;
    private final ClassSessionRepository classSessionRepository;
    private final CourseRepository courseRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public List<ModuleResponse> findByCourse(Long courseId) {
        return moduleRepository.findByCourseIdOrderByPositionAsc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ModuleResponse create(Long courseId, ModuleRequest request) {
        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        CourseModule module = new CourseModule();
        module.setCourse(course);
        module.setTitle(request.title());
        module.setDescription(request.description());
        module.setPosition(request.position());
        module = moduleRepository.save(module);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "CourseModule", module.getId());
        return toResponse(module);
    }

    @Transactional
    public ModuleResponse update(Long moduleId, ModuleRequest request) {
        CourseModule module = getOrThrow(moduleId);
        module.setTitle(request.title());
        module.setDescription(request.description());
        module.setPosition(request.position());
        module = moduleRepository.save(module);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "CourseModule", module.getId());
        return toResponse(module);
    }

    @Transactional
    public List<ModuleResponse> reorder(Long courseId, List<Long> orderedModuleIds) {
        List<CourseModule> modules = moduleRepository.findByCourseIdOrderByPositionAsc(courseId);

        // Two-pass reassignment avoids colliding with the (course_id, position) unique constraint
        // while positions are still in their old arrangement. Each pass must be flushed —
        // Hibernate defers UPDATEs to flush time and coalesces repeated changes to the same
        // entity into one statement, so without an explicit flush the negative staging never
        // actually reaches the DB before the final positions are written, and the final write
        // can collide with a not-yet-updated sibling row.
        for (int i = 0; i < modules.size(); i++) {
            modules.get(i).setPosition(-(i + 1));
        }
        moduleRepository.saveAll(modules);
        moduleRepository.flush();

        for (CourseModule module : modules) {
            int newPosition = orderedModuleIds.indexOf(module.getId()) + 1;
            module.setPosition(newPosition);
        }
        moduleRepository.saveAll(modules);
        moduleRepository.flush();

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "REORDER", "CourseModule", courseId);
        return modules.stream()
                .sorted((a, b) -> Integer.compare(a.getPosition(), b.getPosition()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void delete(Long moduleId) {
        CourseModule module = getOrThrow(moduleId);
        moduleRepository.delete(module);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "DELETE", "CourseModule", moduleId);
    }

    private CourseModule getOrThrow(Long id) {
        return moduleRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + id));
    }

    private ModuleResponse toResponse(CourseModule module) {
        List<TopicResponse> topics = topicRepository.findByModuleIdOrderByPositionAsc(module.getId()).stream()
                .map(TopicResponse::from)
                .toList();
        List<ClassSessionResponse> classSessions = classSessionRepository
                .findByModuleIdOrderByPositionAsc(module.getId())
                .stream()
                .map(ClassSessionResponse::from)
                .toList();
        return ModuleResponse.from(module, topics, classSessions);
    }
}
