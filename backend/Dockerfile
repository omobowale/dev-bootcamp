# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
# Cache dependencies separately from source so code-only changes don't re-download the world.
RUN ./mvnw -B -o dependency:go-offline || ./mvnw -B dependency:go-offline
COPY src src
# Unit tests only (see 10_Deployment_Checklist.md, section 4): the Testcontainers-based
# *IT.java tests bind to the integration-test/verify phases, which `package` never reaches,
# so this build never needs a Docker daemon inside the build container.
RUN ./mvnw -B clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Railway injects $PORT at runtime; fall back to 8080 for `docker run` outside Railway.
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
