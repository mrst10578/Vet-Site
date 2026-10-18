# PetCare backend (NestJS)

Independent API service under `apps/api`. The Next.js web application continues to run at the repository root.

## Start (local)

1. Provision PostgreSQL 16+ and manually execute `db/migrations/001_initial.sql` followed by `db/migrations/002_identity.sql` **once**, against a fresh database.
2. Create `apps/api/.env` from `apps/api/.env.example` and provision a **real** OTP pepper and trusted SMS sender settings. NestJS does not automatically read .env: export these vars through your shell or deployment platform before starting.
3. `cd apps/api && npm install && npm run build && npm run start`.
4. The API listens on `127.0.0.1:4000` by default, behind a same-origin reverse proxy.

Routes:
- `GET /v1/health` database check
- `POST /v1/auth/request-otp` SMS challenge; provider config required
- `POST /v1/auth/verify-otp` issue HttpOnly session
- `GET /v1/auth/me` authenticate current session
- `POST /v1/auth/logout` revoke session
- `GET /v1/pets` owner-scoped list
- `POST /v1/pets` owner-scoped create
- `GET /v1/pets/:id` owner-scoped details

**Security boundary:** no open clinical endpoints; no clinic-access endpoints until vet verification and grants are complete. Never put the API behind an unauthenticated public write proxy. Require `WEB_ORIGIN` for all mutating requests, enforce request limits at the reverse proxy, and use HTTPS with secure cookies in production. The generic SMS adapter expects a sender gateway that accepts `POST {to,message}` and Authorization Bearer token. Do not assume any specific provider implements this wire protocol unchanged.

### Current limitation

Production requires production-quality provisioning, SMS verification, API deployment, CSRF/origin and IP-based rate-limit review, permission policies, migrations and backup tests. There is no user data connected to the web demo yet.
