package com.trainingplatform.service;

import com.trainingplatform.dto.StudentAssignmentResponse;
import com.trainingplatform.dto.StudentSubmissionResponse;
import com.trainingplatform.entity.Assignment;
import com.trainingplatform.entity.AssignmentSubmission;
import com.trainingplatform.entity.AssignmentSubmissionStatus;
import com.trainingplatform.entity.Student;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ForbiddenException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.AssignmentRepository;
import com.trainingplatform.repository.AssignmentSubmissionRepository;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.security.CurrentStudentProvider;
import java.time.Instant;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class StudentAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CurrentStudentProvider currentStudentProvider;
    private final CloudinaryService cloudinaryService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public Optional<StudentAssignmentResponse> summaryFor(Long classSessionId, Student student) {
        return assignmentRepository.findByClassSessionId(classSessionId).map(assignment -> {
            StudentSubmissionResponse mySubmission = submissionRepository
                    .findByAssignmentIdAndStudentId(assignment.getId(), student.getId())
                    .map(StudentSubmissionResponse::from)
                    .orElse(null);
            return StudentAssignmentResponse.from(assignment, mySubmission);
        });
    }

    @Transactional
    public StudentSubmissionResponse submit(Long assignmentId, String responseText, MultipartFile attachment) {
        Student student = currentStudentProvider.getCurrentStudent();
        Assignment assignment = assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        requireEnrolled(student, assignment);

        if ((responseText == null || responseText.isBlank()) && (attachment == null || attachment.isEmpty())) {
            throw new BadRequestException("Submit a written response and/or an attachment.");
        }

        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElseGet(() -> {
                    AssignmentSubmission created = new AssignmentSubmission();
                    created.setAssignment(assignment);
                    created.setStudent(student);
                    return created;
                });

        if (submission.getId() != null && submission.getStatus() != AssignmentSubmissionStatus.NEEDS_RESUBMISSION) {
            throw new BadRequestException("Your submission is already received. Your instructor must request a resubmission before you can replace it.");
        }
        if (assignment.getDueAt() != null && assignment.getDueAt().isBefore(Instant.now())
                && submission.getStatus() != AssignmentSubmissionStatus.NEEDS_RESUBMISSION) {
            throw new BadRequestException("The assignment deadline has passed.");
        }
        validateAttachment(assignment, attachment);
        if (submission.getId() != null) {
            jdbcTemplate.update("INSERT INTO assignment_submission_revisions (submission_id, snapshot) SELECT id, row_to_json(s)::text FROM assignment_submissions s WHERE id = ?", submission.getId());
        }
        submission.setScore(null);
        submission.setFeedback(null);
        submission.setReviewedAt(null);
        submission.setResponseText(responseText);
        if (attachment != null && !attachment.isEmpty()) {
            CloudinaryService.UploadResult uploaded = cloudinaryService.upload(attachment, "assignment-submissions");
            submission.setAttachmentUrl(uploaded.url());
            submission.setAttachmentPublicId(uploaded.publicId());
            submission.setAttachmentFilename(attachment.getOriginalFilename());
        }
        submission.setStatus(AssignmentSubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(Instant.now());
        submission = submissionRepository.save(submission);

        return StudentSubmissionResponse.from(submission);
    }

    static void validateAttachment(Assignment assignment, MultipartFile attachment) {
        if (attachment == null || attachment.isEmpty()) return;
        if (attachment.getSize() > 10 * 1024 * 1024) throw new BadRequestException("Attachments must be 10 MB or smaller.");
        String allowed = assignment.getAllowedAttachmentTypes();
        if (allowed == null || allowed.isBlank()) return;
        String filename = java.util.Objects.toString(attachment.getOriginalFilename(), "").toLowerCase(java.util.Locale.ROOT);
        String mime = java.util.Objects.toString(attachment.getContentType(), "").toLowerCase(java.util.Locale.ROOT);
        boolean valid = java.util.Arrays.stream(allowed.toLowerCase(java.util.Locale.ROOT).split("[,;\\s]+"))
                .filter(type -> !type.isBlank()).anyMatch(type -> type.contains("/")
                        ? (type.endsWith("/*") ? mime.startsWith(type.substring(0, type.length() - 1)) : mime.equals(type))
                        : filename.endsWith(type.startsWith(".") ? type : "." + type));
        if (!valid) throw new BadRequestException("This attachment type is not allowed. Accepted: " + allowed);
    }

    private void requireEnrolled(Student student, Assignment assignment) {
        Long courseId = assignment.getClassSession().getModule().getCourse().getId();
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ForbiddenException("You are not enrolled in this course.");
        }
    }
}
