package com.trainingplatform.service;

import com.trainingplatform.dto.ClassSessionRequest;
import com.trainingplatform.dto.ClassSessionResponse;
import com.trainingplatform.dto.LessonSectionDto;
import com.trainingplatform.entity.ClassSession;
import com.trainingplatform.entity.CourseModule;
import com.trainingplatform.entity.CourseTopic;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.ClassSessionRepository;
import com.trainingplatform.repository.CourseModuleRepository;
import com.trainingplatform.repository.CourseTopicRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClassSessionService {

    private final ClassSessionRepository classSessionRepository;
    private final CourseModuleRepository moduleRepository;
    private final CourseTopicRepository topicRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional
    public ClassSessionResponse create(Long moduleId, ClassSessionRequest request) {
        CourseModule module = moduleRepository
                .findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + moduleId));

        ClassSession session = new ClassSession();
        session.setModule(module);
        applyRequest(session, request);
        session = classSessionRepository.save(session);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "ClassSession", session.getId());
        return ClassSessionResponse.from(session);
    }

    @Transactional(readOnly = true)
    public ClassSessionResponse getById(Long id) {
        return ClassSessionResponse.from(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<ClassSessionResponse> listForModule(Long moduleId) {
        return classSessionRepository.findByModuleIdOrderByPositionAsc(moduleId).stream()
                .map(ClassSessionResponse::from)
                .toList();
    }

    @Transactional
    public ClassSessionResponse update(Long id, ClassSessionRequest request) {
        ClassSession session = getOrThrow(id);
        applyRequest(session, request);
        session = classSessionRepository.save(session);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "ClassSession", session.getId());
        return ClassSessionResponse.from(session);
    }

    @Transactional
    public void delete(Long id) {
        ClassSession session = getOrThrow(id);
        classSessionRepository.delete(session);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "DELETE", "ClassSession", id);
    }

    @Transactional
    public List<ClassSessionResponse> reorder(Long moduleId, List<Long> orderedSessionIds) {
        List<ClassSession> sessions = classSessionRepository.findByModuleIdOrderByPositionAsc(moduleId);

        for (int i = 0; i < sessions.size(); i++) {
            sessions.get(i).setPosition(-(i + 1));
        }
        classSessionRepository.saveAll(sessions);
        classSessionRepository.flush();

        for (ClassSession session : sessions) {
            session.setPosition(orderedSessionIds.indexOf(session.getId()) + 1);
        }
        classSessionRepository.saveAll(sessions);
        classSessionRepository.flush();

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "REORDER", "ClassSession", moduleId);
        return sessions.stream()
                .sorted((a, b) -> Integer.compare(a.getPosition(), b.getPosition()))
                .map(ClassSessionResponse::from)
                .toList();
    }

    private void applyRequest(ClassSession session, ClassSessionRequest request) {
        CourseTopic topic = null;
        if (request.topicId() != null) {
            topic = topicRepository
                    .findById(request.topicId())
                    .orElseThrow(() -> new BadRequestException("Topic not found: " + request.topicId()));
        }

        session.setTopic(topic);
        session.setTitle(request.title());
        session.setObjectives(request.objectives());
        session.setScheduledAt(request.scheduledAt());
        session.setMeetingLink(request.meetingLink());
        session.setRecordingUrl(request.recordingUrl());
        session.setPosition(request.position());

        session.getSections().clear();
        List<LessonSectionDto> sections = request.sections() != null ? request.sections() : List.of();
        for (int i = 0; i < sections.size(); i++) {
            session.getSections().add(sections.get(i).toEntity(i));
        }
    }

    private ClassSession getOrThrow(Long id) {
        return classSessionRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class session not found: " + id));
    }
}
