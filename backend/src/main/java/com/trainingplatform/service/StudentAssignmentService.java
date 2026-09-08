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

        submission.setResponseText(responseText);
        if (attachment != null && !attachment.isEmpty()) {
            CloudinaryService.UploadResult uploaded = cloudinaryService.upload(attachment);
            submission.setAttachmentUrl(uploaded.url());
            submission.setAttachmentPublicId(uploaded.publicId());
            submission.setAttachmentFilename(attachment.getOriginalFilename());
        }
        submission.setStatus(AssignmentSubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(Instant.now());
        submission = submissionRepository.save(submission);

        return StudentSubmissionResponse.from(submission);
    }

    private void requireEnrolled(Student student, Assignment assignment) {
        Long courseId = assignment.getClassSession().getModule().getCourse().getId();
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ForbiddenException("You are not enrolled in this course.");
        }
    }
}
