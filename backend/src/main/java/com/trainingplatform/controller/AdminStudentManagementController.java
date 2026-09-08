package com.trainingplatform.controller;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.*;
import com.trainingplatform.service.*;
import com.trainingplatform.security.CurrentAdminProvider;
import com.trainingplatform.dto.CourseProgressResponse;
import com.trainingplatform.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@RestController @RequestMapping("/api/admin/students") @RequiredArgsConstructor
public class AdminStudentManagementController {
    private final StudentRepository students;
    private final CourseEnrollmentRepository enrollments;
    private final StudentRecoveryService recovery;
    private final StudentProgressService progress;
    private final AdminActionLogService log;
    private final CurrentAdminProvider admin;
    public record Enrollment(Long id, Long courseId, String courseTitle, String cohortName, boolean active, String registrationStatus, CourseProgressResponse progress) {}
    public record Detail(Long id,String name,String email,String studentCode,boolean suspended,List<Enrollment> enrollments) {}
    public record AccessRequest(boolean enabled) {}
    @GetMapping("/{id}") @Transactional(readOnly=true) public Detail detail(@PathVariable Long id) {
        Student s=get(id);
        var entries=enrollments.findByStudentIdOrderByCreatedAtDesc(id).stream().map(e->new Enrollment(e.getId(),e.getCourse().getId(),e.getCourse().getTitle(),e.getCohort().getName(),e.isActive(),e.getRegistration().getStatus().name(),
            e.isActive() && e.getRegistration().getStatus()!=RegistrationStatus.CANCELLED ? progress.getProgressForStudent(s,e.getCourse().getId(),e.getCohort().getId()):null)).toList();
        return new Detail(id,s.getFullName(),s.getEmail(),s.getStudentId(),s.isLoginSuspended(),entries);
    }
    @PostMapping("/{id}/recovery") @Transactional public void resend(@PathVariable Long id) {
        recovery.request(get(id).getEmail());log.log(admin.getCurrentAdmin(),"SEND_RECOVERY","Student",id);
    }
    @PutMapping("/{id}/access") @Transactional public void access(@PathVariable Long id,@RequestBody AccessRequest request) {
        Student s=get(id);s.setLoginSuspended(!request.enabled());s.setAuthVersion(s.getAuthVersion()+1);students.save(s);
        log.log(admin.getCurrentAdmin(),request.enabled()?"RESTORE_ACCESS":"SUSPEND_ACCESS","Student",id);
    }
    @PutMapping("/{id}/enrollments/{enrollmentId}/access") @Transactional public void enrollment(@PathVariable Long id,@PathVariable Long enrollmentId,@RequestBody AccessRequest request) {
        var e=enrollments.findById(enrollmentId).filter(row->row.getStudent().getId().equals(id)).orElseThrow(()->new ResourceNotFoundException("Enrollment not found."));
        e.setActive(request.enabled());enrollments.save(e);log.log(admin.getCurrentAdmin(),request.enabled()?"RESTORE_ACCESS":"REVOKE_ACCESS","CourseEnrollment",enrollmentId);
    }
    private Student get(Long id) {return students.findById(id).orElseThrow(()->new ResourceNotFoundException("Student not found."));}
}
