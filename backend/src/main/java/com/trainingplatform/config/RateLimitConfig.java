package com.trainingplatform.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RateLimitConfig {

    @Bean
    public FilterRegistrationBean<RegistrationRateLimitFilter> registrationRateLimitFilter() {
        FilterRegistrationBean<RegistrationRateLimitFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new RegistrationRateLimitFilter());
        // Registration/recovery abuse and login brute-forcing are the same shape of problem —
        // too many requests per IP in a short window — so they share one limiter and one budget.
        registration.addUrlPatterns(
                "/api/registrations", "/api/student/auth/recovery", "/api/admin/login", "/api/student/auth/login");
        registration.setOrder(1);
        return registration;
    }
}
