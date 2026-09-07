package com.trainingplatform.service;

import com.trainingplatform.dto.TopicRequest;
import com.trainingplatform.dto.TopicResponse;
import com.trainingplatform.entity.CourseModule;
import com.trainingplatform.entity.CourseTopic;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CourseModuleRepository;
import com.trainingplatform.repository.CourseTopicRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseTopicService {

    private final CourseTopicRepository topicRepository;
    private final CourseModuleRepository moduleRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional
    public TopicResponse create(Long moduleId, TopicRequest request) {
        CourseModule module = moduleRepository
                .findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + moduleId));

        CourseTopic topic = new CourseTopic();
        topic.setModule(module);
        topic.setTitle(request.title());
        topic.setPosition(request.position());
        topic = topicRepository.save(topic);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "CourseTopic", topic.getId());
        return TopicResponse.from(topic);
    }

    @Transactional
    public TopicResponse update(Long topicId, TopicRequest request) {
        CourseTopic topic = getOrThrow(topicId);
        topic.setTitle(request.title());
        topic.setPosition(request.position());
        topic = topicRepository.save(topic);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "CourseTopic", topic.getId());
        return TopicResponse.from(topic);
    }

    @Transactional
    public void delete(Long topicId) {
        CourseTopic topic = getOrThrow(topicId);
        topicRepository.delete(topic);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "DELETE", "CourseTopic", topicId);
    }

    @Transactional
    public List<TopicResponse> reorder(Long moduleId, List<Long> orderedTopicIds) {
        List<CourseTopic> topics = topicRepository.findByModuleIdOrderByPositionAsc(moduleId);

        for (int i = 0; i < topics.size(); i++) {
            topics.get(i).setPosition(-(i + 1));
        }
        topicRepository.saveAll(topics);
        topicRepository.flush();

        for (CourseTopic topic : topics) {
            topic.setPosition(orderedTopicIds.indexOf(topic.getId()) + 1);
        }
        topicRepository.saveAll(topics);
        topicRepository.flush();

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "REORDER", "CourseTopic", moduleId);
        return topics.stream()
                .sorted((a, b) -> Integer.compare(a.getPosition(), b.getPosition()))
                .map(TopicResponse::from)
                .toList();
    }

    private CourseTopic getOrThrow(Long id) {
        return topicRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + id));
    }
}
