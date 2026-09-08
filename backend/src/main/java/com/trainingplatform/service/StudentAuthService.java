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

    public LoginResponse login(LoginRequest request) {
        var userDetails = tryLoad(request.email());
        if (userDetails == null || !passwordEncoder.matches(request.password(), userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        Student student = studentRepository
                .findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("Student disappeared after authentication"));

        String token = jwtService.generateToken(student.getEmail(), "STUDENT");
        return new LoginResponse(token, student.getEmail(), student.getFullName(), "STUDENT");
    }

    @Transactional
    public LoginResponse acceptInvite(InviteAcceptRequest request) {
        Student student = studentRepository
                .findByInviteToken(request.token())
                .orElseThrow(() -> new BadRequestException("This invite link is invalid or has already been used."));

        if (student.getInviteTokenExpiresAt() == null || student.getInviteTokenExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("This invite link has expired. Contact us for a new one.");
        }

        student.setPasswordHash(passwordEncoder.encode(request.password()));
        student.setStatus(StudentStatus.ACTIVE);
        student.setInviteToken(null);
        student.setInviteTokenExpiresAt(null);
        studentRepository.save(student);

        String token = jwtService.generateToken(student.getEmail(), "STUDENT");
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
