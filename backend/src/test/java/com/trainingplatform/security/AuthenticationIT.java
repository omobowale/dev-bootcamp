package com.trainingplatform.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.trainingplatform.AbstractIntegrationTest;
import com.trainingplatform.entity.Admin;
import com.trainingplatform.repository.AdminRepository;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Exercises real HTTP + Spring Security end to end (not MockMvc) against a random port, so it
 * proves the actual filter chain — JWT issuance, stateless auth, and the public/admin boundary
 * in SecurityConfig — works as wired, not just as unit-mocked.
 */
class AuthenticationIT extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final HttpClient client = HttpClient.newHttpClient();
    private String adminEmail;

    @BeforeEach
    void seedAdmin() {
        adminEmail = "auth-test-" + System.nanoTime() + "@example.com";
        Admin admin = new Admin();
        admin.setName("Auth Test Admin");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode("correct-horse-battery-staple"));
        adminRepository.save(admin);
    }

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    @Test
    void loginWithCorrectCredentialsReturnsAJwt() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/api/admin/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        """
                        {"email":"%s","password":"correct-horse-battery-staple"}
                        """
                                .formatted(adminEmail)))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"token\"").contains(adminEmail);
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/api/admin/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        """
                        {"email":"%s","password":"wrong-password"}
                        """
                                .formatted(adminEmail)))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(401);
    }

    @Test
    void adminEndpointWithoutTokenIsRejected() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/api/admin/courses"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(401);
    }

    @Test
    void adminEndpointWithValidTokenSucceeds() throws Exception {
        HttpRequest loginRequest = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/api/admin/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        """
                        {"email":"%s","password":"correct-horse-battery-staple"}
                        """
                                .formatted(adminEmail)))
                .build();
        HttpResponse<String> loginResponse = client.send(loginRequest, HttpResponse.BodyHandlers.ofString());
        String token = loginResponse.body().split("\"token\":\"")[1].split("\"")[0];

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/api/admin/courses"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(200);
    }

    @Test
    void publicCourseEndpointRequiresNoToken() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + "/api/courses"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(200);
    }
}
