package com.trainingplatform.service;

import com.trainingplatform.dto.LoginRequest;
import com.trainingplatform.dto.LoginResponse;
import com.trainingplatform.entity.Admin;
import com.trainingplatform.repository.AdminRepository;
import com.trainingplatform.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final JwtService jwtService;
    private final AdminActionLogService adminActionLogService;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        Admin admin = adminRepository
                .findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("Admin disappeared after authentication"));

        String token = jwtService.generateToken(admin.getEmail(), admin.getRole().name());
        adminActionLogService.log(admin, "LOGIN", "Admin", admin.getId());

        return new LoginResponse(token, admin.getEmail(), admin.getName(), admin.getRole().name());
    }
}
