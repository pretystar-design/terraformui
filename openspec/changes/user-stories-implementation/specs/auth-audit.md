# Spec: Auth & Audit (US-010)

## User Story
As an admin, I want enterprise SSO login and operation logs so that we meet compliance and security requirements.

## Requirements

### R1: Authentication
- Session-based login with email/password
- Mock users for development: admin, developer, viewer roles
- Session tokens with 24-hour TTL
- Cookie-based session for browser, Bearer token for API

### R2: API Key Management
- Create named API keys with 90-day TTL
- List keys (masked: `tfg_abc123...xyz9`)
- Revoke keys immediately
- API keys usable via `X-API-Key` header

### R3: Role-Based Access
- Admin: full access, audit log viewing
- Developer: generate, validate, plan
- Viewer: read-only access to canvas and HCL

### R4: Audit Logging
- All API requests logged: user, action, timestamp, IP, status code
- Admin-only audit log viewing via `/api/audit`
- Persistent log storage (JSON file)
- Log entries include: user ID, action, method, path, status, duration

## Acceptance Criteria
- Login with `admin@tfg.local` / `admin` returns session token
- API key creation returns full key value (shown once)
- Non-admin accessing `/api/audit` returns 403 Forbidden
- Audit log contains entries for all authenticated requests
- Expired session token returns 401 Unauthorized
- Revoked API key returns 401 on next use
