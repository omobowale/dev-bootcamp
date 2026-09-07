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
        registration.addUrlPatterns("/api/registrations");
        registration.setOrder(1);
        return registration;
    }
}
