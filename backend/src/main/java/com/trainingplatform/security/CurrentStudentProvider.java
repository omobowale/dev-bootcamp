package com.trainingplatform.security;

import com.trainingplatform.entity.Student;
import com.trainingplatform.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentStudentProvider {

    private final StudentRepository studentRepository;

    public Student getCurrentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository
                .findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated student not found: " + email));
    }
}
