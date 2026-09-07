package com.trainingplatform.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.trainingplatform.AbstractIntegrationTest;
import com.trainingplatform.entity.Admin;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.CourseModule;
import com.trainingplatform.entity.CourseTopic;
import com.trainingplatform.repository.AdminRepository;
import com.trainingplatform.repository.CourseModuleRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.repository.CourseTopicRepository;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Regression test for a real bug: the reorder endpoints used a "stage to negative positions,
 * then set final positions" trick to dodge the (course_id, position) / (module_id, position)
 * unique constraints. It never worked — Hibernate defers UPDATEs to flush time and coalesces
 * repeated changes to the same entity within a transaction into one statement, so the negative
 * staging pass never reached the database before the final pass, which could then collide with
 * a not-yet-updated sibling row. Fixed by flushing after each pass. This test exercises the real
 * repositories against a real Postgres so a regression here fails loudly again.
 */
class CourseModuleServiceReorderIT extends AbstractIntegrationTest {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseModuleRepository moduleRepository;

    @Autowired
    private CourseTopicRepository topicRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CourseModuleService courseModuleService;

    @Autowired
    private CourseTopicService courseTopicService;

    private Course course;

    @BeforeEach
    void setUp() {
        Admin admin = new Admin();
        admin.setName("Test Admin");
        admin.setEmail("reorder-test-admin-" + System.nanoTime() + "@example.com");
        admin.setPasswordHash("irrelevant-for-this-test");
        admin = adminRepository.save(admin);

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(admin.getEmail(), null, List.of()));

        course = new Course();
        course.setTitle("Reorder Test Course");
        course.setSlug("reorder-test-course-" + System.nanoTime());
        course.setPublished(false);
        course = courseRepository.save(course);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void reorderingModulesPersistsTheNewPositions() {
        CourseModule first = createModule("First", 1);
        CourseModule second = createModule("Second", 2);

        courseModuleService.reorder(course.getId(), List.of(second.getId(), first.getId()));

        List<CourseModule> reloaded = moduleRepository.findByCourseIdOrderByPositionAsc(course.getId());
        assertThat(reloaded).extracting(CourseModule::getId).containsExactly(second.getId(), first.getId());
        assertThat(reloaded.get(0).getPosition()).isEqualTo(1);
        assertThat(reloaded.get(1).getPosition()).isEqualTo(2);
    }

    @Test
    void reorderingThreeModulesToReverseOrderWorks() {
        CourseModule first = createModule("First", 1);
        CourseModule second = createModule("Second", 2);
        CourseModule third = createModule("Third", 3);

        courseModuleService.reorder(course.getId(), List.of(third.getId(), second.getId(), first.getId()));

        List<CourseModule> reloaded = moduleRepository.findByCourseIdOrderByPositionAsc(course.getId());
        assertThat(reloaded).extracting(CourseModule::getId).containsExactly(third.getId(), second.getId(), first.getId());
    }

    @Test
    void reorderingTopicsPersistsTheNewPositions() {
        CourseModule module = createModule("Module with topics", 1);
        CourseTopic t1 = createTopic(module, "Topic A", 1);
        CourseTopic t2 = createTopic(module, "Topic B", 2);
        CourseTopic t3 = createTopic(module, "Topic C", 3);

        courseTopicService.reorder(module.getId(), List.of(t3.getId(), t1.getId(), t2.getId()));

        List<CourseTopic> reloaded = topicRepository.findByModuleIdOrderByPositionAsc(module.getId());
        assertThat(reloaded).extracting(CourseTopic::getId).containsExactly(t3.getId(), t1.getId(), t2.getId());
    }

    private CourseModule createModule(String title, int position) {
        CourseModule module = new CourseModule();
        module.setCourse(course);
        module.setTitle(title);
        module.setPosition(position);
        return moduleRepository.save(module);
    }

    private CourseTopic createTopic(CourseModule module, String title, int position) {
        CourseTopic topic = new CourseTopic();
        topic.setModule(module);
        topic.setTitle(title);
        topic.setPosition(position);
        return topicRepository.save(topic);
    }
}
