package com.trainingplatform.config;

import com.trainingplatform.entity.Admin;
import com.trainingplatform.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the initial admin account from environment variables on first boot.
 * Intentionally does not run if ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD are unset, or if that
 * email already exists — there is no public admin signup, this is the only creation path.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeedRunner implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed.email:}")
    private String seedEmail;

    @Value("${app.admin.seed.password:}")
    private String seedPassword;

    @Value("${app.admin.seed.name:Administrator}")
    private String seedName;

    @Override
    public void run(String... args) {
        if (seedEmail.isBlank() || seedPassword.isBlank()) {
            log.info("No ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD provided — skipping admin seed.");
            return;
        }

        if (adminRepository.existsByEmail(seedEmail)) {
            log.info("Admin account already exists for {} — skipping seed.", seedEmail);
            return;
        }

        Admin admin = new Admin();
        admin.setName(seedName);
        admin.setEmail(seedEmail);
        admin.setPasswordHash(passwordEncoder.encode(seedPassword));
        adminRepository.save(admin);

        log.info("Seeded initial admin account for {}", seedEmail);
    }
}
