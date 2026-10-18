# Vet-Site technical architecture

## Baseline

The existing repository is a Next.js 16/React 19 starter. This branch keeps its existing CI, linting and unit/E2E scripts instead of swapping tooling without a migration plan.

## Target architecture

- **Web:** Next.js App Router / TypeScript / Tailwind, Persian RTL by default, responsive owner and clinic interfaces.
- **API:** NestJS TypeScript modular backend, to be introduced once identity and data contracts are finalized. During bootstrap, Next.js only serves non-sensitive demo endpoints.
- **Data:** PostgreSQL as the source of truth, migrations in `db/migrations`.
- **Workers:** Redis + BullMQ for scheduled medication/care reminders. An app process must not be responsible for delayed tasks.
- **Files:** S3-compatible private bucket, encrypted at rest, short-lived signed access URLs; object references in SQL.
- **AI:** postponed. Future isolated service may use RAG, but cannot write clinical records without user confirmation and authorization.

## Modules / target ownership

- `identity`: SMS OTP, anti-abuse, sessions, account lifecycle
- `pets`: open species, owner and guardian relationships
- `clinics`: verified licenses, membership, clinic access grants
- `records`: encounters, allergy/medical history, document links
- `prescriptions`: clinical authorship, medicines, doses, change history
- `care`: care plans, tasks, journal, adherence
- `notifications`: timezone-aware schedules, delivery attempts, idempotency
- `audit`: append-only activity and access audit

## Access control contract

Every API request needs a verified principal. Owner access must be verified against pet ownership or an active guardian grant. Clinic access must be checked against verified clinic membership **and** an explicit, unexpired, non-revoked pet grant with adequate scope. Never trust a pet ID or clinician role asserted by the browser. Shared SQL access alone is not authorization.

## Data precautions

Clinical and contact data are sensitive. Encrypt transport, restrict database credentials to backend services, use private object storage and backups, retain event audit logs, and document retention/deletion policy. No clinical payload may be logged into analytics. Permissions and backup recovery must be tested before a real pilot.

## Reminder rules

The initial helper classifies calendar dates in a caller-provided timezone context for vaccine/care milestones (14, 7, 1, 0 days) and overdue items. It is deliberately **not** a medication dosing scheduler. Medication schedules require exact prescribed times, timezone/DST handling, clinic-approved changes, a persistent job queue and durable delivery receipts.

## Persian typography

Mikhak is the primary CSS font family per project preference. A correctly licensed font asset must be deployed before production; browser fallbacks are used until then.
