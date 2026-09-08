package com.trainingplatform.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Simple in-memory fixed-window limiter for the public registration endpoint — enough for
 * this project's scale (a single instance, low volume). Swap for Redis/Bucket4j if the
 * deployment ever moves to multiple instances behind a load balancer.
 */
public class RegistrationRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_WINDOW = 5;
    private static final long WINDOW_MILLIS = 60_000;

    private final ConcurrentHashMap<String, Window> windowsByIp = new ConcurrentHashMap<>();

    private record Window(long windowStartMillis, AtomicInteger count) {
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String ip = clientIp(request);
        long now = System.currentTimeMillis();

        Window window = windowsByIp.compute(ip, (key, existing) -> {
            if (existing == null || now - existing.windowStartMillis() >= WINDOW_MILLIS) {
                return new Window(now, new AtomicInteger(1));
            }
            existing.count().incrementAndGet();
            return existing;
        });

        if (window.count().get() > MAX_REQUESTS_PER_WINDOW) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String json =
                    """
                    {"timestamp":"%s","status":429,"error":"Too Many Requests",\
                    "message":"Too many requests. Please wait a minute and try again."}\
                    """
                            .formatted(Instant.now());
            response.getWriter().write(json);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
