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
    private final com.trainingplatform.service.StudentRecoveryService recovery;
    public record RecoveryRequest(@jakarta.validation.constraints.Email @jakarta.validation.constraints.NotBlank String email) {}
    public record ResetRequest(@jakarta.validation.constraints.NotBlank String token,
        @jakarta.validation.constraints.Size(min=8,max=72) @jakarta.validation.constraints.NotBlank String password) {}
    @PostMapping("/recovery") public java.util.Map<String,String> recover(@Valid @RequestBody RecoveryRequest request) {
        recovery.request(request.email());
        return java.util.Map.of("message","If an eligible account exists, a password link has been sent.");
    }
    @PostMapping("/reset-password") public void reset(@Valid @RequestBody ResetRequest request) { recovery.reset(request.token(),request.password()); }


    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return studentAuthService.login(request);
    }

    @PostMapping("/invite/accept")
    public LoginResponse acceptInvite(@Valid @RequestBody InviteAcceptRequest request) {
        return studentAuthService.acceptInvite(request);
    }
}
