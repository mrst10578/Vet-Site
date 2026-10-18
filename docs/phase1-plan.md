# PetCare / Vet-Site — Phase 1 build plan

## Product boundary

**Audiences:** pet owners, veterinary professionals and clinics.
**Species:** every species (open label, not a fixed dog/cat schema).
**AI:** deferred until after verified clinical workflows are stable.

### Implemented in the initial feature branch

- Persian RTL landing page and responsive visual foundation
- Owner and clinic *demo* dashboards
- Pet intake preview covering common and custom species
- Date-based reminder classification helper with unit tests
- Initial PostgreSQL relational schema for ownership, sharing, visits, prescriptions, vaccinations, care plans, journal, documents and audit events
- Health status and species-list endpoints

Demo records are synthetic. The checkbox and intake interactions do **not** persist and are not connected to clinical data.

## Delivery sequence (indicative, assumes parallel engineering)

| Milestone | Duration | Deliverables |
| --- | --- | --- |
| Foundation | Weeks 1–2 | Design system, routes, schema, CI |
| Account & identity | Weeks 3–5 | SMS OTP, role verification, session lifecycle, access controls |
| Clinical workflow | Weeks 6–9 | Pet records, encounter forms, prescription, vaccine, upload workflows |
| Reminders & journaling | Weeks 10–12 | Reliable background jobs, notification log, schedules, owner tracking |
| Pilot hardening | Weeks 13–14 | Security, backups, accessibility, acceptance tests, staging deployment |

## Implementation gates

1. Provision a PostgreSQL database and run migrations in a staging environment.
2. Choose SMS provider, message budget and rate-limiting/captcha policy.
3. Implement server-side identity and authorization before enabling any medical reads/writes.
4. Connect API DTO validation, transactional persistence, audit events, and file access policies.
5. Require veterinary review of any species-specific vaccination schedule, dosing rules or risk advice.
6. Verify notifications with job retries, idempotency and a timezone-aware scheduler.
7. Enforce test coverage and end-to-end owner-to-clinic permission tests prior to first real pilot.

## Non-goals for this branch

No real medical record storage, no live prescriptions, no actual reminders, no SMS, no AI, no external services or paid API usage. The browser only demonstrates intended workflows.

## Definition of done for production Phase 1

- Verified users can authenticate, manage multiple pets and revoke shared access.
- All clinical writes require verified clinician role **and** explicit live grant.
- Prescriptions and vaccines are immutable/auditable clinical events with corrections tracked.
- Owners receive trackable reminders and can record adherence.
- Documents are private by default with expiring authorized access links.
- All critical paths pass automated tests, accessibility checks and security review.
