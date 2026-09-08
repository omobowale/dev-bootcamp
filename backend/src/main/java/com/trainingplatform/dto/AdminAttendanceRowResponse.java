package com.trainingplatform.dto;

import com.trainingplatform.entity.AttendanceRecord;
import com.trainingplatform.entity.AttendanceStatus;
import com.trainingplatform.entity.Student;
import java.time.Instant;

/** One row per student enrolled in the class's course — {@code status} is null if not yet marked. */
public record AdminAttendanceRowResponse(
        Long studentId,
        String studentCode,
        String studentName,
        AttendanceStatus status,
        Instant checkInTime,
        Instant checkOutTime,
        String notes) {

    public static AdminAttendanceRowResponse unmarked(Student student) {
        return new AdminAttendanceRowResponse(
                student.getId(), student.getStudentId(), student.getFullName(), null, null, null, null);
    }

    public static AdminAttendanceRowResponse from(Student student, AttendanceRecord record) {
        return new AdminAttendanceRowResponse(
                student.getId(),
                student.getStudentId(),
                student.getFullName(),
                record.getStatus(),
                record.getCheckInTime(),
                record.getCheckOutTime(),
                record.getNotes());
    }
}
