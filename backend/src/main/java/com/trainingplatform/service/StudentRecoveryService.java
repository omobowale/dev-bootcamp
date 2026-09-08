package com.trainingplatform.service;
import com.trainingplatform.entity.*;
import com.trainingplatform.repository.StudentRepository;
import com.trainingplatform.exception.BadRequestException;
import java.time.Instant;
import java.security.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class StudentRecoveryService {
    private final StudentRepository students;
    private final PasswordEncoder passwords;
    private final EmailService email;
    @Value("${app.frontend-base-url}") private String frontendUrl;
    @Transactional public void request(String address) {
        students.findByEmailIgnoreCase(address.trim()).ifPresent(student -> {
            if(student.isLoginSuspended()) return;
            Instant now=Instant.now();
            if(student.getRecoveryRequestedAt()!=null && student.getRecoveryRequestedAt().isAfter(now.minusSeconds(60))) return;
            byte[] bytes=new byte[32];new SecureRandom().nextBytes(bytes);
            String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            student.setRecoveryTokenHash(hash(token));student.setRecoveryExpiresAt(now.plusSeconds(1800));student.setRecoveryRequestedAt(now);
            students.save(student);
            email.sendStudentRecovery(student,frontendUrl+"/student/reset-password/"+token);
        });
    }
    @Transactional public void reset(String token,String password) {
        Student student=students.findByRecoveryTokenHash(hash(token)).orElseThrow(()->new BadRequestException("This reset link is invalid or expired. Request a new link."));
        if(student.isLoginSuspended() || student.getRecoveryExpiresAt()==null || !student.getRecoveryExpiresAt().isAfter(Instant.now()))
            throw new BadRequestException("This reset link is invalid or expired. Request a new link.");
        student.setPasswordHash(passwords.encode(password));student.setStatus(StudentStatus.ACTIVE);
        student.setRecoveryTokenHash(null);student.setRecoveryExpiresAt(null);student.setInviteToken(null);student.setInviteTokenExpiresAt(null);
        student.setAuthVersion(student.getAuthVersion()+1);students.save(student);
    }
    static String hash(String value) {
        try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}
        catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}
    }
}
