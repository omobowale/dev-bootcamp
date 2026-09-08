package com.trainingplatform.service;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.*;
import com.trainingplatform.security.CurrentStudentProvider;
import com.trainingplatform.exception.*;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
@Service @RequiredArgsConstructor
public class AssignmentDraftService {
    private final JdbcTemplate jdbc;
    private final AssignmentRepository assignments;
    private final AssignmentSubmissionRepository submissions;
    private final CourseEnrollmentRepository enrollments;
    private final CurrentStudentProvider current;
    public record Draft(String responseText,long version,long submissionVersion,Instant updatedAt) {}
    public record Save(@jakarta.validation.constraints.NotNull Long version,@jakarta.validation.constraints.NotNull Long submissionVersion,
        @jakarta.validation.constraints.NotNull @jakarta.validation.constraints.Size(max=100000) String responseText) {}
    private Assignment access(Long id,Student student) {
        var assignment=assignments.findById(id).orElseThrow(()->new ResourceNotFoundException("Assignment not found."));
        LearningAccess.require(enrollments,student.getId(),assignment.getClassSession());return assignment;
    }
    @Transactional(readOnly=true) public Draft get(Long id) {
        Student student=current.getCurrentStudent();access(id,student);return read(id,student.getId());
    }
    private Draft read(Long id,Long student) {
        var submission=submissions.findByAssignmentIdAndStudentId(id,student);
        long revision=submission.map(AssignmentSubmission::getVersion).orElse(-1L);
        var rows=jdbc.query("SELECT * FROM assignment_drafts WHERE student_id=? AND assignment_id=? AND submission_version=?",
            (rs,n)->new Draft(rs.getString("response_text"),rs.getLong("version"),rs.getLong("submission_version"),rs.getTimestamp("updated_at").toInstant()),student,id,revision);
        return rows.isEmpty()?new Draft(submission.map(AssignmentSubmission::getResponseText).orElse(""),0,revision,null):rows.get(0);
    }
    @Transactional public Draft save(Long id,Save request) {
        Student student=current.getCurrentStudent();
        jdbc.queryForObject("SELECT id FROM students WHERE id=? FOR UPDATE",Long.class,student.getId());
        access(id,student);
        var submission=submissions.findByAssignmentIdAndStudentId(id,student.getId());
        if(submission.isPresent() && submission.get().getStatus()!=AssignmentSubmissionStatus.NEEDS_RESUBMISSION)
            throw new ConflictException("This assignment is already submitted. Refresh to see its current status.");
        Draft previous=read(id,student.getId());
        if(previous.version()!=request.version() || previous.submissionVersion()!=request.submissionVersion())
            throw new ConflictException("A newer draft or review exists. Choose which version to keep.");
        jdbc.update("INSERT INTO assignment_drafts(student_id,assignment_id,response_text,version,submission_version) VALUES (?,?,?,?,?) ON CONFLICT(student_id,assignment_id) DO UPDATE SET response_text=EXCLUDED.response_text,version=EXCLUDED.version,submission_version=EXCLUDED.submission_version,updated_at=now()",
            student.getId(),id,request.responseText(),previous.version()+1,previous.submissionVersion());
        return read(id,student.getId());
    }
}
