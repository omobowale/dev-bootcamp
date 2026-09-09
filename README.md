# Bukiva Learn — Software Development Training Platform

A course catalog, registration, and admin management platform for a software development training business — built with a React + Vite + TypeScript frontend and a Java Spring Boot + PostgreSQL backend.

## Stack

- **Frontend**: React 19, Vite, TypeScript, React Router, TanStack React Query, Vitest
- **Backend**: Java 21, Spring Boot, Spring Data JPA, Flyway migrations, Spring Security (JWT), PostgreSQL

See [00_Tech_Stack.md](../Software_Training_Platform_Documents/00_Tech_Stack.md) in the project documentation for the full stack decision log, and [05_Developer_Implementation_Checklist.md](../Software_Training_Platform_Documents/05_Developer_Implementation_Checklist.md) for a phase-by-phase build history.

## Local development

### Backend

```
cd backend
cp .env.example .env   # fill in local values
mvn spring-boot:run
```

Requires a local PostgreSQL instance (see `.env.example` for connection defaults) and Flyway will apply migrations automatically on startup.

### Frontend

```
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Testing

```
# Backend — unit tests
cd backend && mvn test

# Backend — unit + integration tests (requires Docker, uses Testcontainers)
cd backend && mvn verify

# Frontend
cd frontend && npx tsc --noEmit -p tsconfig.app.json && npx vitest run
```
