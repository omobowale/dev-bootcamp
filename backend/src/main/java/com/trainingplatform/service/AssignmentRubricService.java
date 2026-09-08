package com.trainingplatform.service;
import com.trainingplatform.repository.*;
import com.trainingplatform.security.*;
import com.trainingplatform.exception.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
@Service @RequiredArgsConstructor
public class AssignmentRubricService {
    private final AssignmentRepository assignments;
    private final AssignmentSubmissionRepository submissions;
    private final CourseEnrollmentRepository enrollments;
    private final CurrentStudentProvider current;
    private final CurrentAdminProvider admin;
    private final AdminActionLogService logs;
    private final JdbcTemplate jdbc;
    public record Document(long version,int maxScore,boolean locked,List<RubricData.Criterion> criteria) {}
    public record Save(@jakarta.validation.constraints.NotNull Long version,@jakarta.validation.constraints.NotNull List<RubricData.Criterion> criteria) {}
    @Transactional(readOnly=true) public Document get(Long id,boolean student) {
        var assignment=assignments.findById(id).orElseThrow(()->new ResourceNotFoundException("Assignment not found."));
        if(student)LearningAccess.require(enrollments,current.getCurrentStudent().getId(),assignment.getClassSession());
        return new Document(assignment.getRubricVersion(),assignment.getMaxScore(),submissions.existsByAssignmentId(id),RubricData.criteria(assignment.getRubricCriteria()));
    }
    @Transactional public Document save(Long id,Save request) {
        if(!assignments.existsById(id))throw new ResourceNotFoundException("Assignment not found.");
        jdbc.queryForList("SELECT id FROM assignments WHERE id=? FOR UPDATE",Long.class,id);
        var assignment=assignments.findById(id).orElseThrow();
        if(assignment.getRubricVersion()!=request.version())throw new ConflictException("The rubric changed. Reload it before editing.");
        if(submissions.existsByAssignmentId(id))throw new ConflictException("Rubric criteria are locked after the first submission to keep grading consistent.");
        RubricData.validate(request.criteria(),assignment.getMaxScore());
        assignment.setRubricCriteria(RubricData.json(request.criteria()));assignment.setRubricVersion(assignment.getRubricVersion()+1);assignments.saveAndFlush(assignment);
        logs.log(admin.getCurrentAdmin(),"UPDATE_RUBRIC","Assignment",id);return get(id,false);
    }
}
