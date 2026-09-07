package com.trainingplatform.dto;

import java.util.List;
import java.util.Map;

public record DashboardResponse(
        long totalCourses,
        long publishedCourses,
        long totalCohorts,
        long openCohorts,
        long totalRegistrations,
        Map<String, Long> registrationsByStatus,
        List<AdminRegistrationListItemResponse> recentRegistrations) {
}
