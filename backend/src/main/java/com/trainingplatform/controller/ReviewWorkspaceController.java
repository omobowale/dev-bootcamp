package com.trainingplatform.controller;
import com.trainingplatform.service.ReviewHistoryService;
import com.trainingplatform.repository.AssignmentSubmissionRepository;
import com.trainingplatform.entity.AssignmentSubmission;
import com.trainingplatform.dto.AdminSubmissionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;
@RestController @RequiredArgsConstructor
public class ReviewWorkspaceController {
    private final ReviewHistoryService history;
    private final AssignmentSubmissionRepository submissions;
    public record QueueItem(Long assignmentId,String assignmentTitle,String courseTitle,java.time.Instant dueAt,AdminSubmissionResponse submission) {}
    @GetMapping("/api/admin/grading") @Transactional(readOnly=true)
    public Page<QueueItem> queue(@RequestParam(defaultValue="") String status,@RequestParam(defaultValue="") String search,@RequestParam(defaultValue="0") int page) {
        com.trainingplatform.entity.AssignmentSubmissionStatus selectedStatus;
        try { selectedStatus=status.isBlank()?null:com.trainingplatform.entity.AssignmentSubmissionStatus.valueOf(status); }
        catch(IllegalArgumentException e) { throw new com.trainingplatform.exception.BadRequestException("Unknown submission status."); }
        Specification<AssignmentSubmission> spec=(root,q,cb)->{
            var predicates=new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if(selectedStatus!=null) predicates.add(cb.equal(root.get("status"),selectedStatus));
            if(!search.isBlank()) {String pattern="%"+search.toLowerCase(java.util.Locale.ROOT)+"%";predicates.add(cb.or(cb.like(cb.lower(root.get("student").get("fullName")),pattern),cb.like(cb.lower(root.get("assignment").get("title")),pattern),cb.like(cb.lower(root.get("assignment").get("classSession").get("module").get("course").get("title")),pattern)));}
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
        return submissions.findAll(spec,PageRequest.of(Math.max(0,page),20,Sort.by("submittedAt").ascending())).map(s->new QueueItem(s.getAssignment().getId(),s.getAssignment().getTitle(),s.getAssignment().getClassSession().getModule().getCourse().getTitle(),s.getAssignment().getDueAt(),AdminSubmissionResponse.from(s)));
    }
    @GetMapping("/api/admin/assignment-submissions/{id}/history") public List<ReviewHistoryService.Revision> adminHistory(@PathVariable Long id){return history.adminHistory(id);}
    @GetMapping("/api/student/assignments/{id}/history") public List<ReviewHistoryService.Revision> studentHistory(@PathVariable Long id){return history.studentHistory(id);}
}
