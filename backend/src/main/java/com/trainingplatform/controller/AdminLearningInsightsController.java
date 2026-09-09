package com.trainingplatform.controller;

import com.trainingplatform.dto.*;
import com.trainingplatform.repository.*;
import com.trainingplatform.service.RubricData;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Read-only administration endpoints. Student response types omit answer keys and submissions. */
@RestController
@RequestMapping("/api/admin/learning")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminLearningInsightsController {
    private final NamedParameterJdbcTemplate jdbc;
    private final CourseRepository courses;
    private final ClassSessionRepository sessions;
    private final CourseMaterialRepository materials;
    private final QuizRepository quizzes;
    private final QuizQuestionRepository questions;
    private final AssignmentRepository assignments;

    @GetMapping("/analytics")
    public Map<String,Object> analytics(@RequestParam(required=false) Long courseId,
            @RequestParam(required=false) Long cohortId) {
        var params = new HashMap<String,Object>();
        params.put("course",courseId); params.put("cohort",cohortId);
        String scope = """
          WITH enrolled AS (
            SELECT DISTINCT e.student_id,e.course_id,e.cohort_id FROM course_enrollments e
            JOIN registrations r ON r.id=e.registration_id
            WHERE e.active AND r.status <> 'CANCELLED'
              AND (CAST(:course AS bigint) IS NULL OR e.course_id=:course)
              AND (CAST(:cohort AS bigint) IS NULL OR e.cohort_id=:cohort)
          ), visible AS (
            SELECT DISTINCT e.student_id,e.course_id,s.id AS session_id FROM enrolled e
            JOIN course_modules m ON m.course_id=e.course_id
            JOIN class_sessions s ON s.module_id=m.id AND (s.cohort_id IS NULL OR s.cohort_id=e.cohort_id)
          ), activity AS (
            SELECT v.student_id,v.course_id,c.created_at AS at FROM visible v
              JOIN class_completions c ON c.class_session_id=v.session_id AND c.student_id=v.student_id
            UNION ALL SELECT v.student_id,v.course_id,COALESCE(a.submitted_at,a.created_at) FROM visible v
              JOIN quizzes q ON q.class_session_id=v.session_id JOIN quiz_attempts a ON a.quiz_id=q.id AND a.student_id=v.student_id
            UNION ALL SELECT v.student_id,v.course_id,a.submitted_at FROM visible v
              JOIN assignments t ON t.class_session_id=v.session_id JOIN assignment_submissions a ON a.assignment_id=t.id AND a.student_id=v.student_id
            UNION ALL SELECT v.student_id,v.course_id,d.updated_at FROM visible v
              JOIN assignments t ON t.class_session_id=v.session_id JOIN assignment_drafts d ON d.assignment_id=t.id AND d.student_id=v.student_id
          ), learners AS (SELECT DISTINCT student_id,course_id FROM enrolled),
          work AS (
            SELECT v.course_id,v.student_id,t.id,t.due_at,a.status FROM visible v
            JOIN assignments t ON t.class_session_id=v.session_id
            LEFT JOIN assignment_submissions a ON a.assignment_id=t.id AND a.student_id=v.student_id
          ), attempts AS (
            SELECT v.course_id,a.passed FROM visible v JOIN quizzes q ON q.class_session_id=v.session_id
            JOIN quiz_attempts a ON a.quiz_id=q.id AND a.student_id=v.student_id WHERE a.submitted_at IS NOT NULL
          )
          """;
        var rows=jdbc.queryForList(scope+"""
          SELECT c.id,c.title,
            (SELECT count(*) FROM learners l WHERE l.course_id=c.id) AS learners,
            (SELECT count(*) FROM learners l WHERE l.course_id=c.id AND EXISTS
              (SELECT 1 FROM activity a WHERE a.course_id=l.course_id AND a.student_id=l.student_id AND a.at >= now()-interval '14 days')) AS recent,
            (SELECT count(*) FROM work w WHERE w.course_id=c.id AND w.due_at<now() AND (w.status IS NULL OR w.status='NEEDS_RESUBMISSION')) AS overdue,
            (SELECT count(*) FROM work w WHERE w.course_id=c.id AND w.status IN ('SUBMITTED','UNDER_REVIEW')) AS pending,
            (SELECT count(*) FROM attempts a WHERE a.course_id=c.id) AS attempts,
            (SELECT count(*) FROM attempts a WHERE a.course_id=c.id AND a.passed) AS passed
          FROM courses c WHERE (CAST(:course AS bigint) IS NULL OR c.id=:course)
            AND (CAST(:cohort AS bigint) IS NULL OR EXISTS(SELECT 1 FROM cohorts h WHERE h.id=:cohort AND h.course_id=c.id))
          ORDER BY c.title,c.id
          """,params);
        return Map.of("courses",rows,"courseOptions",jdbc.queryForList("SELECT id,title FROM courses ORDER BY title",Map.of()),
            "cohortOptions",jdbc.queryForList("SELECT id,name,course_id AS course_id FROM cohorts ORDER BY name",Map.of()));
    }

    @GetMapping("/courses/{id}/preview")
    public Map<String,Object> outline(@PathVariable Long id) {
        var course=courses.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        var lessons=sessions.findByCourseIdOrderByModulePositionAscPositionAsc(id).stream().map(s->{
            var row=new LinkedHashMap<String,Object>();row.put("id",s.getId());row.put("title",s.getTitle());
            row.put("module",s.getModule().getTitle());row.put("cohortId",s.getCohortId());return row;
        }).toList();
        return Map.of("title",course.getTitle(),"lessons",lessons,"cohorts",jdbc.queryForList("SELECT id,name FROM cohorts WHERE course_id=:id ORDER BY name",Map.of("id",id)));
    }
    @GetMapping("/classes/{id}/preview")
    public Map<String,Object> lesson(@PathVariable Long id) {
        var s=sessions.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        var q=quizzes.findByClassSessionId(id);var a=assignments.findByClassSessionId(id);
        var result=new LinkedHashMap<String,Object>();
        result.put("lesson",StudentClassSessionResponse.from(s,materials.findByClassSessionIdOrderByPositionAsc(id).stream().map(MaterialResponse::from).toList(),null,a.map(v->StudentAssignmentResponse.from(v,null)).orElse(null),false));
        result.put("questions",q.map(v->questions.findByQuizIdOrderByPositionAsc(v.getId()).stream().map(StudentQuizQuestionResponse::from).toList()).orElse(List.of()));
        result.put("passingPercentage",q.map(v->v.getPassingPercentage()).orElse(null));
        result.put("criteria",a.map(v->RubricData.criteria(v.getRubricCriteria())).orElse(List.of()));
        return result;
    }
}
