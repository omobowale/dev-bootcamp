package com.trainingplatform.service;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.*;
import com.trainingplatform.security.CurrentStudentProvider;
import com.trainingplatform.exception.BadRequestException;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class StudentWorkspaceService {
    private final CurrentStudentProvider current;
    private final CourseEnrollmentRepository enrollments;
    private final ClassSessionRepository sessions;
    private final AssignmentRepository assignments;
    private final AssignmentSubmissionRepository submissions;
    private final CertificateRepository certificates;
    private final JdbcTemplate jdbc;
    public record Preferences(boolean enabled,int hoursBefore) {}
    public record Event(String id,String kind,String title,String courseTitle,Instant startsAt,String path,String status) {}
    public record Notice(String id,String kind,String title,String detail,Instant occurredAt,String path,boolean read) {}
    public record Inbox(List<Notice> items,long unreadCount) {}
    public Preferences preferences() {
        var rows=jdbc.query("SELECT enabled,hours_before FROM student_reminder_preferences WHERE student_id=?",(rs,n)->new Preferences(rs.getBoolean(1),rs.getInt(2)),current.getCurrentStudent().getId());
        return rows.isEmpty()?new Preferences(true,24):rows.get(0);
    }
    @Transactional public Preferences preferences(Preferences value) {
        if(!Set.of(1,6,24,48,168).contains(value.hoursBefore()))throw new BadRequestException("Choose a supported reminder window.");
        jdbc.update("INSERT INTO student_reminder_preferences(student_id,enabled,hours_before) VALUES (?,?,?) ON CONFLICT(student_id) DO UPDATE SET enabled=EXCLUDED.enabled,hours_before=EXCLUDED.hours_before",current.getCurrentStudent().getId(),value.enabled(),value.hoursBefore());return value;
    }
    private List<Long> courses(Student student) {
        return enrollments.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream().filter(e->e.isActive()&&e.getRegistration().getStatus()!=RegistrationStatus.CANCELLED).map(e->e.getCourse().getId()).distinct().toList();
    }
    public List<Event> calendar(Instant from,Instant to) {
        if(!from.isBefore(to)||Duration.between(from,to).compareTo(Duration.ofDays(93))>0)throw new BadRequestException("Choose a calendar range of up to 93 days.");
        Student student=current.getCurrentStudent();List<Event> events=new ArrayList<>();
        for(Long course:courses(student)) {
            for(var s:sessions.findByCourseIdOrderByModulePositionAscPositionAsc(course))
                if(s.getCohortId()!=null&&s.getScheduledAt()!=null&&LearningAccess.allows(enrollments,student.getId(),s)&&inRange(s.getScheduledAt(),from,to))
                    events.add(new Event("class-"+s.getId(),"CLASS",s.getTitle(),s.getModule().getCourse().getTitle(),s.getScheduledAt(),"/student/classes/"+s.getId(),"SCHEDULED"));
            for(var a:assignments.findByClassSession_Module_Course_Id(course))
                if(a.getDueAt()!=null&&LearningAccess.allows(enrollments,student.getId(),a.getClassSession())&&inRange(a.getDueAt(),from,to)) {
                    String status=submissions.findByAssignmentIdAndStudentId(a.getId(),student.getId()).map(s->s.getStatus().name()).orElse("NOT_SUBMITTED");
                    events.add(new Event("assignment-"+a.getId(),"ASSIGNMENT",a.getTitle(),a.getClassSession().getModule().getCourse().getTitle(),a.getDueAt(),"/student/classes/"+a.getClassSession().getId(),status));
                }
        }
        return events.stream().sorted(Comparator.comparing(Event::startsAt).thenComparing(Event::id)).toList();
    }
    private static boolean inRange(Instant date,Instant from,Instant to){return !date.isBefore(from)&&date.isBefore(to);}
    public Inbox notifications() {
        Student student=current.getCurrentStudent();Instant now=Instant.now();Preferences prefs=preferences();List<Notice> items=new ArrayList<>();
        if(prefs.enabled())for(Event event:calendar(now,now.plusSeconds(prefs.hoursBefore()*3600L))) {
            if(event.kind().equals("ASSIGNMENT")&&!Set.of("NOT_SUBMITTED","NEEDS_RESUBMISSION").contains(event.status()))continue;
            items.add(new Notice(event.id()+":"+event.startsAt().getEpochSecond(),event.kind(),event.kind().equals("CLASS")?"Class coming up":"Assignment due soon",event.title()+" · "+event.courseTitle(),event.startsAt(),event.path(),false));
        }
        for(Long course:courses(student)) {
            for(var assignment:assignments.findByClassSession_Module_Course_Id(course)) {
                if(!LearningAccess.allows(enrollments,student.getId(),assignment.getClassSession()))continue;
                submissions.findByAssignmentIdAndStudentId(assignment.getId(),student.getId()).filter(s->s.getReviewedAt()!=null&&s.getReviewedAt().isAfter(now.minusSeconds(90L*86400))).ifPresent(s->items.add(new Notice("review-"+s.getId()+":"+s.getVersion(),"FEEDBACK",s.getStatus()==AssignmentSubmissionStatus.NEEDS_RESUBMISSION?"Your instructor requested a revision":"New assignment feedback",assignment.getTitle(),s.getReviewedAt(),"/student/classes/"+assignment.getClassSession().getId(),false)));
            }
            certificates.findByStudentIdAndCourseId(student.getId(),course).filter(c->c.getCreatedAt().isAfter(now.minusSeconds(90L*86400))).ifPresent(c->items.add(new Notice("certificate-"+c.getId(),"CERTIFICATE","Your certificate is ready",c.getCourse().getTitle(),c.getCreatedAt(),"/verify/"+c.getVerificationId(),false)));
        }
        var read=new HashSet<>(jdbc.queryForList("SELECT notification_key FROM student_notification_reads WHERE student_id=?",String.class,student.getId()));
        var result=items.stream().sorted(Comparator.comparing(Notice::occurredAt).reversed()).limit(100).map(n->new Notice(n.id(),n.kind(),n.title(),n.detail(),n.occurredAt(),n.path(),read.contains(n.id()))).toList();
        return new Inbox(result,result.stream().filter(n->!n.read()).count());
    }
    @Transactional public void markRead(List<String> ids) {
        if(ids==null||ids.size()>100)throw new BadRequestException("Choose up to 100 notifications.");
        var valid=notifications().items().stream().map(Notice::id).collect(java.util.stream.Collectors.toSet());
        for(String id:ids)if(!valid.contains(id))throw new BadRequestException("Notification is no longer available.");
        Long student=current.getCurrentStudent().getId();
        for(String id:ids)jdbc.update("INSERT INTO student_notification_reads(student_id,notification_key) VALUES (?,?) ON CONFLICT DO NOTHING",student,id);
    }
}
