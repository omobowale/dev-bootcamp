package com.trainingplatform;

import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base for tests that need a real Postgres — Flyway migrations use Postgres-specific SQL
 * (sequences, native functions), so H2 would silently pass tests that fail against the real
 * database.
 *
 * <p>This deliberately does NOT use {@code @Testcontainers}/{@code @Container}: those annotations
 * stop the container in the owning test class's {@code afterAll}, which is fine for a single
 * class but breaks every subsequent subclass in the same run — they'd reconnect to a container
 * that's already been torn down. Instead this is the "singleton container" pattern: start it once
 * in a static initializer (runs exactly once per JVM, the first time this class loads) and never
 * stop it explicitly — Testcontainers' Ryuk reaper container kills it when the test JVM exits.
 */
@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class AbstractIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine").withDatabaseName("training_platform_test");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void registerDatasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }
}
