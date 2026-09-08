package com.trainingplatform.controller;

import com.trainingplatform.dto.InviteAcceptRequest;
import com.trainingplatform.dto.LoginRequest;
import com.trainingplatform.dto.LoginResponse;
import com.trainingplatform.service.StudentAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/auth")
@RequiredArgsConstructor
public class StudentAuthController {

    private final StudentAuthService studentAuthService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return studentAuthService.login(request);
    }

    @PostMapping("/invite/accept")
    public LoginResponse acceptInvite(@Valid @RequestBody InviteAcceptRequest request) {
        return studentAuthService.acceptInvite(request);
    }
}
