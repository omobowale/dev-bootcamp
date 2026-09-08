package com.trainingplatform.repository;

import com.trainingplatform.entity.AttendanceRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByClassSessionId(Long classSessionId);

    Optional<AttendanceRecord> findByClassSessionIdAndStudentId(Long classSessionId, Long studentId);

    List<AttendanceRecord> findByStudentIdAndClassSession_Module_Course_Id(Long studentId, Long courseId);
}
