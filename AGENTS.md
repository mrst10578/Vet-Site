# Vet-Site Engineering Instructions

This repository is a veterinary pet-care product, not a generic template. The product serves pet owners and clinics, supports ALL species and defers AI.

## Baseline
- Next.js App Router / React 19 / TypeScript strict / Tailwind
- PostgreSQL source of truth (initial schema in db/migrations)
- Target API architecture: modular NestJS + worker queue
- Persian RTL, mobile-first; Mikhak primary font once licensed assets are supplied

## Clinical and privacy constraints
1. UI demo data is explicitly synthetic; NEVER persist real medical details to localStorage or return real records from open endpoints.
2. Do not enable medical writes until authenticated principals, verified clinic memberships and scoped pet-level grants are enforced on every request.
3. Owner, guardian, clinician and reception permissions are distinct. A guessed pet ID must never confer access.
4. Species are an open catalogue. No automatic species-specific vaccines, medications or dosing advice without vetted clinical protocols.
5. No AI in Phase 1; clinical records remain SQL-backed, audited and human-authored.
6. Build time-aware reminders as persisted worker jobs with retries and idempotency, not browser timers.
7. Do not store raw sensitive file content in logs; use private object storage with authorized expiring links.
8. Store secrets server-side only; never weaken TypeScript, validation or tests to bypass failures.
9. Make real vs prototype state explicit in UI, docs and acceptance criteria.

## Validation
Run: npm run lint, npm run typecheck, npm run test, npm run build, npm run test:e2e.
Preserve the existing import alias @/* and improve accessibility / empty states / responsiveness in every increment.
