package com.trainingplatform.service;
import static org.assertj.core.api.Assertions.assertThat;
import com.trainingplatform.AbstractIntegrationTest;
import com.trainingplatform.entity.Admin;
import com.trainingplatform.repository.AdminRepository;
import java.net.URI;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.ObjectMapper;

class SiteContentIT extends AbstractIntegrationTest {
    @LocalServerPort int port;
    @Autowired AdminRepository admins;
    @Autowired PasswordEncoder encoder;
    @Autowired ObjectMapper mapper;
    final HttpClient client = HttpClient.newHttpClient();
    HttpResponse<String> send(String path, String method, String body, String token) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).header("Content-Type", "application/json");
        if (token != null) request.header("Authorization", "Bearer " + token);
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test void migratesPersistsFiltersAndProtectsContent() throws Exception {
        assertThat(send("/api/site-content", "GET", null, null).statusCode()).isEqualTo(200);
        assertThat(send("/api/admin/site-content", "GET", null, null).statusCode()).isEqualTo(401);
        assertThat(send("/api/admin/site-content", "PUT", "{}", null).statusCode()).isEqualTo(401);
        Admin admin = new Admin(); admin.setName("Content Test"); admin.setEmail("content-test@example.com"); admin.setPasswordHash(encoder.encode("test-content-password")); admins.save(admin);
        String login = send("/api/admin/login", "POST", "{\"email\":\"content-test@example.com\",\"password\":\"test-content-password\"}", null).body();
        String token = mapper.readTree(login).get("token").asText();
        long version = mapper.readTree(send("/api/admin/site-content", "GET", null, token).body()).get("version").asLong();
        String payload = """
                {"version":%d,"content":{"supportEmail":"hello@example.com","whatsappNumber":"2348000000000","socialLinks":[{"platform":"Published social","url":"https://example.com","published":true},{"platform":"Draft social","url":"https://example.com/draft","published":false}],"team":[],"testimonials":[]}}
                """.formatted(version);
        assertThat(send("/api/admin/site-content", "PUT", payload, token).statusCode()).isEqualTo(200);
        assertThat(send("/api/site-content", "GET", null, null).body()).contains("Published social").doesNotContain("Draft social");
        assertThat(send("/api/admin/site-content", "GET", null, token).body()).contains("Draft social");
        assertThat(send("/api/admin/site-content", "PUT", payload, token).statusCode()).isEqualTo(409);
        assertThat(send("/api/admin/site-content", "PUT", "{}", token).statusCode()).isEqualTo(400);
    }
}
