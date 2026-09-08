package com.trainingplatform.service;

import com.trainingplatform.dto.AdminAttendanceRowResponse;
import com.trainingplatform.dto.AttendanceEntry;
import com.trainingplatform.dto.BulkAttendanceRequest;
import com.trainingplatform.entity.AttendanceRecord;
import com.trainingplatform.entity.ClassSession;
import com.trainingplatform.entity.CourseEnrollment;
import com.trainingplatform.entity.Student;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.AttendanceRecordRepository;
import com.trainingplatform.repository.ClassSessionRepository;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.repository.StudentRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ClassSessionRepository classSessionRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final StudentRepository studentRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public List<AdminAttendanceRowResponse> listForClassSession(Long classSessionId) {
        ClassSession session = getSessionOrThrow(classSessionId);
        requireCohort(session);
        Long courseId = session.getModule().getCourse().getId();

        List<Student> enrolledStudents = courseEnrollmentRepository.findByCourseId(courseId).stream()
                .filter(e -> e.isActive() && e.getRegistration().getStatus() != com.trainingplatform.entity.RegistrationStatus.CANCELLED)
                .filter(e -> e.getCohort().getId().equals(session.getCohortId()))
                .map(CourseEnrollment::getStudent)
                .distinct()
                .sorted(Comparator.comparing(Student::getFullName))
                .toList();

        Map<Long, AttendanceRecord> recordsByStudentId = new HashMap<>();
        attendanceRecordRepository
                .findByClassSessionId(classSessionId)
                .forEach(r -> recordsByStudentId.put(r.getStudent().getId(), r));

        return enrolledStudents.stream()
                .map(student -> {
                    LearningAccess.require(courseEnrollmentRepository, student.getId(), session);
            AttendanceRecord record = recordsByStudentId.get(student.getId());
                    return record != null
                            ? AdminAttendanceRowResponse.from(student, record)
                            : AdminAttendanceRowResponse.unmarked(student);
                })
                .toList();
    }

    @Transactional
    public List<AdminAttendanceRowResponse> saveAttendance(Long classSessionId, BulkAttendanceRequest request) {
        ClassSession session = getSessionOrThrow(classSessionId);

        requireCohort(session);
        for (AttendanceEntry entry : request.entries()) {
            if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(entry.studentId(), session.getModule().getCourse().getId())) {
                throw new BadRequestException("Attendance can only be recorded for enrolled students.");
            }
            Student student = studentRepository
                    .findById(entry.studentId())
                    .orElseThrow(() -> new BadRequestException("Student not found: " + entry.studentId()));

            LearningAccess.require(courseEnrollmentRepository, student.getId(), session);
            AttendanceRecord record = attendanceRecordRepository
                    .findByClassSessionIdAndStudentId(classSessionId, entry.studentId())
                    .orElseGet(() -> {
                        AttendanceRecord created = new AttendanceRecord();
                        created.setClassSession(session);
                        created.setStudent(student);
                        return created;
                    });
            record.setStatus(entry.status());
            record.setCheckInTime(entry.checkInTime());
            record.setCheckOutTime(entry.checkOutTime());
            record.setNotes(entry.notes());
            attendanceRecordRepository.save(record);
        }

        adminActionLogService.log(
                currentAdminProvider.getCurrentAdmin(),
                "SAVE_ATTENDANCE",
                "ClassSession",
                classSessionId,
                request.entries().size() + " student(s) marked");

        return listForClassSession(classSessionId);
    }

    private void requireCohort(ClassSession session) {
        if(session.getCohortId()==null) throw new BadRequestException("Assign this class to a cohort before recording attendance.");
    }

    private ClassSession getSessionOrThrow(Long id) {
        return classSessionRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + id));
    }
}
