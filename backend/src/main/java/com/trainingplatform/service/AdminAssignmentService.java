package com.trainingplatform.service;

import com.trainingplatform.dto.AdminSubmissionResponse;
import com.trainingplatform.dto.AssignmentRequest;
import com.trainingplatform.dto.AssignmentResponse;
import com.trainingplatform.dto.AssignmentReviewRequest;
import com.trainingplatform.entity.Assignment;
import com.trainingplatform.entity.AssignmentSubmission;
import com.trainingplatform.entity.AssignmentSubmissionStatus;
import com.trainingplatform.entity.ClassSession;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ConflictException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.AssignmentRepository;
import com.trainingplatform.repository.AssignmentSubmissionRepository;
import com.trainingplatform.repository.ClassSessionRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final ClassSessionRepository classSessionRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public Optional<AssignmentResponse> findForClassSession(Long classSessionId) {
        return assignmentRepository.findByClassSessionId(classSessionId).map(AssignmentResponse::from);
    }

    @Transactional
    public AssignmentResponse create(Long classSessionId) {
        if (assignmentRepository.findByClassSessionId(classSessionId).isPresent()) {
            throw new ConflictException("This class already has an assignment.");
        }
        ClassSession session = classSessionRepository
                .findById(classSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classSessionId));

        Assignment assignment = new Assignment();
        assignment.setClassSession(session);
        assignment.setTitle("Untitled assignment");
        assignment.setMaxScore(100);
        assignment = assignmentRepository.save(assignment);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "Assignment", assignment.getId());
        return AssignmentResponse.from(assignment);
    }

    @Transactional
    public AssignmentResponse update(Long assignmentId, AssignmentRequest request) {
        Assignment assignment = getAssignmentOrThrow(assignmentId);
        assignment.setTitle(request.title());
        assignment.setLearningObjective(request.learningObjective());
        assignment.setInstructions(request.instructions());
        assignment.setTasks(request.tasks());
        assignment.setSubmissionRequirements(request.submissionRequirements());
        assignment.setMaxScore(request.maxScore());
        assignment.setDueAt(request.dueAt());
        assignment.setRubric(request.rubric());
        assignment.setAllowedAttachmentTypes(request.allowedAttachmentTypes());
        assignment = assignmentRepository.save(assignment);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "Assignment", assignment.getId());
        return AssignmentResponse.from(assignment);
    }

    @Transactional(readOnly = true)
    public List<AdminSubmissionResponse> listSubmissions(Long assignmentId) {
        getAssignmentOrThrow(assignmentId);
        return submissionRepository.findByAssignmentIdOrderByStatusAscSubmittedAtDesc(assignmentId).stream()
                .map(AdminSubmissionResponse::from)
                .toList();
    }

    @Transactional
    public AdminSubmissionResponse review(Long submissionId, AssignmentReviewRequest request) {
        AssignmentSubmission submission = submissionRepository
                .findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (!java.util.Objects.equals(submission.getVersion(), request.version())) throw new com.trainingplatform.exception.ConflictException("This submission changed. Refresh before reviewing.");
        if (request.status() == AssignmentSubmissionStatus.SUBMITTED) {
            throw new BadRequestException("An admin review can't set the status back to Submitted.");
        }
        if (request.status() == AssignmentSubmissionStatus.REVIEWED) {
            if (request.score() == null) {
                throw new BadRequestException("A score is required to mark a submission as Reviewed.");
            }
            if (request.score() < 0 || request.score() > submission.getAssignment().getMaxScore()) {
                throw new BadRequestException("Score must be between 0 and " + submission.getAssignment().getMaxScore() + ".");
            }
        }

        submission.setStatus(request.status());
        submission.setScore(request.score());
        submission.setFeedback(request.feedback());
        if (request.status() == AssignmentSubmissionStatus.REVIEWED
                || request.status() == AssignmentSubmissionStatus.NEEDS_RESUBMISSION) {
            submission.setReviewedAt(Instant.now());
        }
        submission = submissionRepository.saveAndFlush(submission);

        adminActionLogService.log(
                currentAdminProvider.getCurrentAdmin(),
                "REVIEW",
                "AssignmentSubmission",
                submission.getId(),
                "New status: " + request.status());
        return AdminSubmissionResponse.from(submission);
    }

    private Assignment getAssignmentOrThrow(Long assignmentId) {
        return assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
    }
}
