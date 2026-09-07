package com.trainingplatform.controller;

import com.trainingplatform.dto.TopicRequest;
import com.trainingplatform.dto.TopicResponse;
import com.trainingplatform.service.CourseTopicService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminTopicController {

    private final CourseTopicService courseTopicService;

    @PostMapping("/api/admin/modules/{moduleId}/topics")
    public TopicResponse create(@PathVariable Long moduleId, @Valid @RequestBody TopicRequest request) {
        return courseTopicService.create(moduleId, request);
    }

    @PutMapping("/api/admin/topics/{id}")
    public TopicResponse update(@PathVariable Long id, @Valid @RequestBody TopicRequest request) {
        return courseTopicService.update(id, request);
    }

    @DeleteMapping("/api/admin/topics/{id}")
    public void delete(@PathVariable Long id) {
        courseTopicService.delete(id);
    }

    @PutMapping("/api/admin/modules/{moduleId}/topics/reorder")
    public List<TopicResponse> reorder(@PathVariable Long moduleId, @RequestBody List<Long> orderedTopicIds) {
        return courseTopicService.reorder(moduleId, orderedTopicIds);
    }
}
