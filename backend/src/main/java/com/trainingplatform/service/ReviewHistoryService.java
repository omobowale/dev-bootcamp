package com.trainingplatform.service;
import com.trainingplatform.repository.*;
import com.trainingplatform.security.CurrentStudentProvider;
import com.trainingplatform.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class ReviewHistoryService {
    private final AssignmentSubmissionRepository submissions;
    private final CourseEnrollmentRepository enrollments;
    private final CurrentStudentProvider current;
    private final JdbcTemplate jdbc;
    public record Revision(String archivedAt,String responseText,Integer score,String feedback,String attachmentUrl) {}
    public List<Revision> adminHistory(Long id) {
        if(!submissions.existsById(id)) throw new ResourceNotFoundException("Submission not found.");return history(id);
    }
    public List<Revision> studentHistory(Long assignmentId) {
        var student=current.getCurrentStudent();var row=submissions.findByAssignmentIdAndStudentId(assignmentId,student.getId());
        if(row.isEmpty()) return List.of();
        LearningAccess.require(enrollments,student.getId(),row.get().getAssignment().getClassSession());return history(row.get().getId());
    }
    private List<Revision> history(Long id) {
        return jdbc.query("SELECT archived_at,snapshot FROM assignment_submission_revisions WHERE submission_id=? ORDER BY id DESC",(rs,n)->{
            var data=QuizSnapshot.JSON.readTree(rs.getString("snapshot"));
            return new Revision(rs.getTimestamp("archived_at").toInstant().toString(),data.path("response_text").asText(""),data.path("score").isNumber()?data.path("score").asInt():null,data.path("feedback").asText(""),data.path("attachment_url").asText(""));
        },id);
    }
}
