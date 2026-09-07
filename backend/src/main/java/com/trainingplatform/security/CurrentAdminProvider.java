package com.trainingplatform.security;

import com.trainingplatform.entity.Admin;
import com.trainingplatform.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentAdminProvider {

    private final AdminRepository adminRepository;

    public Admin getCurrentAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return adminRepository
                .findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated admin not found: " + email));
    }
}
