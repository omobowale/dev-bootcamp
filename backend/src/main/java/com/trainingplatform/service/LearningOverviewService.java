package com.trainingplatform.service;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.*;
import com.trainingplatform.security.CurrentStudentProvider;
import com.trainingplatform.dto.CourseProgressResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;
@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class LearningOverviewService {
 private final CurrentStudentProvider current;
 private final CourseEnrollmentRepository enrollments;
 private final ClassSessionRepository sessions;
 private final AssignmentRepository assignments;
 private final AssignmentSubmissionRepository submissions;
 private final QuizRepository quizzes;
 private final QuizAttemptRepository attempts;
 private final AttendanceRecordRepository attendance;
 private final StudentProgressService progress;
 public record Task(Long classId,String title,Instant dueAt,String status,Integer score) {}
 public record Result(Long attemptId,String classTitle,Instant submittedAt,Double percentage,Boolean passed) {}
 public record Attendance(Long classId,String title,String status) {}
 public record Upcoming(Long id,String title,Instant scheduledAt) {}
 public record Overview(CourseProgressResponse progress,List<Upcoming> upcoming,List<Task> assignments,List<Result> quizResults,List<Attendance> attendance) {}
 public Overview get(Long courseId,Long cohortId) {
  Student student=current.getCurrentStudent();var metrics=progress.getProgress(courseId,cohortId);
  var visible=sessions.findByCourseIdOrderByModulePositionAscPositionAsc(courseId).stream().filter(s->(cohortId==null||s.getCohortId()==null||cohortId.equals(s.getCohortId()))&&LearningAccess.allows(enrollments,student.getId(),s)).toList();
  var ids=visible.stream().map(ClassSession::getId).collect(java.util.stream.Collectors.toSet());
  var upcoming=visible.stream().filter(s->s.getCohortId()!=null&&s.getScheduledAt()!=null&&s.getScheduledAt().isAfter(Instant.now())).sorted(Comparator.comparing(ClassSession::getScheduledAt)).map(s->new Upcoming(s.getId(),s.getTitle(),s.getScheduledAt())).toList();
  var tasks=assignments.findByClassSession_Module_Course_Id(courseId).stream().filter(a->ids.contains(a.getClassSession().getId())).map(a->{var submission=submissions.findByAssignmentIdAndStudentId(a.getId(),student.getId());return new Task(a.getClassSession().getId(),a.getTitle(),a.getDueAt(),submission.map(s->s.getStatus().name()).orElse("NOT_SUBMITTED"),submission.map(AssignmentSubmission::getScore).orElse(null));}).toList();
  var results=quizzes.findByClassSession_Module_Course_Id(courseId).stream().filter(q->ids.contains(q.getClassSession().getId())).flatMap(q->attempts.findByQuizIdAndStudentIdOrderByCreatedAtDesc(q.getId(),student.getId()).stream().filter(a->a.getSubmittedAt()!=null).map(a->new Result(a.getId(),q.getClassSession().getTitle(),a.getSubmittedAt(),a.getPercentage(),a.getPassed()))).sorted(Comparator.comparing(Result::submittedAt).reversed()).toList();
  var records=attendance.findByStudentIdAndClassSession_Module_Course_Id(student.getId(),courseId);
  var marks=visible.stream().filter(s->s.getCohortId()!=null).map(s->new Attendance(s.getId(),s.getTitle(),records.stream().filter(a->a.getClassSession().getId().equals(s.getId())).map(a->a.getStatus().name()).findFirst().orElse("UNMARKED"))).toList();
  return new Overview(metrics,upcoming,tasks,results,marks);
 }
}
