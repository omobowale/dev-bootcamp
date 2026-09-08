package com.trainingplatform.security;

import com.trainingplatform.entity.Admin;
import com.trainingplatform.repository.AdminRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Marked @Primary so the auto-configured AuthenticationManager (used only by admin login — see
 * AdminAuthService) unambiguously resolves to this one now that StudentUserDetailsService also
 * exists. Student login deliberately does NOT go through that shared AuthenticationManager at
 * all (see StudentAuthService) — it checks credentials directly — so this Bean never needs to
 * serve both principal types.
 */
@Primary
@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Admin admin = adminRepository
                .findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No admin with email " + email));
        return new User(
                admin.getEmail(),
                admin.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + admin.getRole().name())));
    }
}
