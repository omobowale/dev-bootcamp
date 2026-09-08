package com.trainingplatform.security;

import com.trainingplatform.entity.Student;
import com.trainingplatform.entity.StudentStatus;
import com.trainingplatform.repository.StudentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Not wired into the shared AuthenticationManager (see AdminUserDetailsService's @Primary note)
 * — used directly by StudentAuthService for login, and by JwtAuthenticationFilter to re-resolve
 * a student principal on every authenticated request.
 */
@Service
@RequiredArgsConstructor
public class StudentUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Student student = studentRepository
                .findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No student with email " + email));

        if (student.getStatus() != StudentStatus.ACTIVE || student.getPasswordHash() == null) {
            throw new UsernameNotFoundException("Student account not yet activated: " + email);
        }

        return new User(student.getEmail(), student.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
    }
}
