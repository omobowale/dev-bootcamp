package com.trainingplatform.service;

import com.trainingplatform.exception.BadRequestException;
import java.util.HashSet;
import java.util.List;

final class ReorderValidation {
    static void requireCompleteOrder(List<Long> existing, List<Long> requested) {
        if (requested == null || requested.size() != existing.size() || requested.stream().anyMatch(java.util.Objects::isNull)
                || new HashSet<>(requested).size() != requested.size()
                || !new HashSet<>(existing).equals(new HashSet<>(requested))) {
            throw new BadRequestException("The order must include every item exactly once. Refresh and try again.");
        }
    }
}
