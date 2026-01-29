<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 → 1.0.0 (Initial ratification)

  Modified principles: N/A (initial version)

  Added sections:
    - Core Principles (5 principles)
    - Security Requirements
    - Code Quality Standards
    - Governance

  Removed sections: N/A (initial version)

  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
    - .specify/templates/spec-template.md: ✅ Compatible (Requirements section aligns)
    - .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports principles)

  Follow-up TODOs: None
-->

# TrackWatch Constitution

## Core Principles

### I. API-First Design

All features MUST be designed API-first with clear contracts between frontend and backend.

- Backend endpoints MUST be defined in `app/views/` with corresponding URL routing
- Frontend API calls MUST use the service layer (`services/spotify/`, `services/trackwatch/`)
- API contracts MUST specify request/response types in TypeScript (`types/`) and match Django serializers
- Authentication tokens MUST be passed via dedicated headers (`X-Spotify-Access-Token`, `X-Spotify-Refresh-Token`)

**Rationale**: Decoupled frontend and backend enable independent development, testing, and deployment.

### II. Service Layer Architecture

Business logic MUST reside in dedicated service modules, not in views or components.

- Backend: Services in `app/services/` orchestrate business logic; views handle HTTP only
- Frontend: Services in `src/services/` handle API communication; components handle UI only
- External API clients (Spotify, Resend) MUST be wrapped in `app/clients/` modules
- Services MUST be stateless and receive all dependencies via parameters

**Rationale**: Single Responsibility Principle ensures testable, maintainable, and reusable code.

### III. Type Safety

All code MUST leverage static typing to catch errors at compile time.

- Frontend: TypeScript strict mode enabled; no `any` types without explicit justification
- Backend: Django models with explicit field types; DRF serializers for validation
- API types MUST be defined in `src/types/` mirroring backend data structures
- Function parameters and return types MUST be explicitly typed

**Rationale**: Type safety prevents runtime errors and serves as executable documentation.

### IV. Component Isolation

UI components MUST be self-contained with co-located styles and clear boundaries.

- Each component resides in its own directory with associated CSS (`components/ArtistCard/`)
- Components MUST NOT directly call APIs; they receive data via props or context
- Global state MUST use React Context (`context/UserContext.tsx`) with typed providers
- Layout components (`layout/`) handle page structure; page components (`pages/`) handle routing

**Rationale**: Isolated components are reusable, testable, and reduce coupling.

### V. Security-First Development

All code MUST follow defensive security practices to protect user data and credentials.

- Secrets (API keys, tokens, credentials) MUST NEVER be committed; use environment variables
- User input MUST be validated and sanitized at system boundaries (API endpoints, forms)
- Spotify tokens MUST be stored securely and refreshed appropriately via `useTokenManager`
- CORS configuration MUST explicitly whitelist allowed origins (no wildcards in production)
- SQL queries MUST use Django ORM or parameterized queries; no raw string interpolation
- Error messages MUST NOT expose internal system details or stack traces to users

**Rationale**: Security vulnerabilities can compromise user accounts and Spotify credentials.

## Security Requirements

### Authentication & Authorization

- All authenticated endpoints MUST verify token presence and validity
- Token refresh logic MUST handle expiration gracefully without user intervention
- Session management MUST follow Spotify OAuth best practices

### Data Protection

- Personal data (Spotify IDs, tokens) MUST be stored encrypted at rest where possible
- Logs MUST NOT contain access tokens or personally identifiable information
- Database connections MUST use SSL in production

### Input Validation

- All user-provided data MUST be validated using Django serializers or form validation
- File paths and URLs MUST be validated against allowed patterns
- Rate limiting SHOULD be applied to authentication and resource-intensive endpoints

## Code Quality Standards

### Clean Code Practices

- Functions MUST do one thing and do it well (Single Responsibility)
- Names MUST be descriptive and intention-revealing
- Functions SHOULD be small (< 30 lines preferred)
- Comments MUST explain "why", not "what"; code should be self-documenting
- Duplication MUST be eliminated through appropriate abstraction

### SOLID Principles Application

- **Single Responsibility**: Each module/class has one reason to change
- **Open/Closed**: Services extend via composition, not modification
- **Liskov Substitution**: Interfaces are honored by all implementations
- **Interface Segregation**: Clients depend only on methods they use
- **Dependency Inversion**: High-level modules depend on abstractions (services, not implementations)

### Testing Expectations

- Critical business logic in `services/` SHOULD have unit tests
- API endpoints SHOULD have integration tests verifying contracts
- Frontend components with complex logic SHOULD have component tests

## Governance

This constitution establishes the foundational development principles for TrackWatch.

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Changes affecting security principles require explicit security review
3. Version MUST be incremented according to semantic versioning:
   - MAJOR: Principle removal or backward-incompatible redefinition
   - MINOR: New principle or section added
   - PATCH: Clarifications and non-semantic refinements

### Compliance

- All pull requests MUST adhere to these principles
- Violations MUST be justified in PR description with rationale
- Runtime development guidance available in `CLAUDE.md`

**Version**: 1.0.0 | **Ratified**: 2026-01-29 | **Last Amended**: 2026-01-29
