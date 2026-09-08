package com.trainingplatform.service;

import com.trainingplatform.dto.InviteAcceptRequest;
import com.trainingplatform.dto.LoginRequest;
import com.trainingplatform.dto.LoginResponse;
import com.trainingplatform.entity.Student;
import com.trainingplatform.entity.StudentStatus;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.repository.StudentRepository;
import com.trainingplatform.security.JwtService;
import com.trainingplatform.security.StudentUserDetailsService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Deliberately does NOT go through the shared AuthenticationManager (that's wired to
 * AdminUserDetailsService — see its @Primary note) — student credentials are checked directly
 * against the Student table instead, so the two principal types stay fully independent.
 */
@Service
@RequiredArgsConstructor
public class StudentAuthService {

    private final StudentRepository studentRepository;
    private final StudentUserDetailsService studentUserDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // A fixed, never-matching hash compared against when the email doesn't exist, so a failed
    // login always pays the same BCrypt cost either way — otherwise a nonexistent email returns
    // measurably faster than a wrong password on a real one (no hash comparison ran at all),
    // letting an attacker enumerate registered emails by timing alone. Mirrors the same
    // defense Spring Security's own DaoAuthenticationProvider uses for the admin login path.
    private static final String DUMMY_HASH =
            "$2a$10$7EqJtq98hPqEX7fNZaFWoOa3HkPmT5aNfPnrpP6P7qzWxYq7ByR3S";

    public LoginResponse login(LoginRequest request) {
        var userDetails = tryLoad(request.email());
        boolean passwordMatches = passwordEncoder.matches(
                request.password(), userDetails != null ? userDetails.getPassword() : DUMMY_HASH);
        if (userDetails == null || !passwordMatches) {
            throw new BadCredentialsException("Invalid email or password");
        }

        Student student = studentRepository
                .findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("Student disappeared after authentication"));

        String token = jwtService.generateToken(student.getEmail(), "STUDENT", student.getAuthVersion());
        return new LoginResponse(token, student.getEmail(), student.getFullName(), "STUDENT");
    }

    @Transactional
    public LoginResponse acceptInvite(InviteAcceptRequest request) {
        Student student = studentRepository
                .findByInviteToken(request.token())
                .orElseThrow(() -> new BadRequestException("This invite link is invalid or has already been used."));

        if (student.isLoginSuspended() || student.getInviteTokenExpiresAt() == null || student.getInviteTokenExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("This invite link has expired. Contact us for a new one.");
        }

        student.setPasswordHash(passwordEncoder.encode(request.password()));
        student.setStatus(StudentStatus.ACTIVE);
        student.setInviteToken(null);
        student.setInviteTokenExpiresAt(null);
        studentRepository.save(student);

        String token = jwtService.generateToken(student.getEmail(), "STUDENT", student.getAuthVersion());
        return new LoginResponse(token, student.getEmail(), student.getFullName(), "STUDENT");
    }

    private UserDetails tryLoad(String email) {
        try {
            return studentUserDetailsService.loadUserByUsername(email);
        } catch (UsernameNotFoundException e) {
            return null;
        }
    }
}
