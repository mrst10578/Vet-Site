# Development setup

## Requirements
- Node.js 22, npm, Docker/Compose
- A private SMS gateway implementing the configured generic HTTP sender contract
- A long random OTP_PEPPER and PostgreSQL credentials kept outside Git

## Database

For **new** local volumes only:
```sh
export POSTGRES_DB=vetcare
export POSTGRES_USER=vetuser
export POSTGRES_PASSWORD='<set-strong-local-password>'
docker compose up -d postgres
```

On first database initialization PostgreSQL executes `001_initial.sql` and `002_identity.sql` in filename order. Do NOT expect Docker init scripts to rerun against an existing volume. Database upgrades need dedicated migrations; do not reset real data.

## API

```sh
cd apps/api
npm install
npm run build
# Export required variables from your secure deployment environment:
npm run start
```

The API starts at `http://127.0.0.1:4000` and requires `DATABASE_URL`, `WEB_ORIGIN`, `OTP_PEPPER` and, for SMS requests, `SMS_ENDPOINT_URL` and `SMS_BEARER_TOKEN`. It **does not** automatically load .env files.

## Web

```sh
# in repository root
npm ci
export INTERNAL_API_URL=http://127.0.0.1:4000
npm run dev
```

`next.config.ts` proxies `/v1/*` to the NestJS API only when `INTERNAL_API_URL` is set. Login at `/login`, then open `/my-pets` to list/create actual owner-scoped pet records. Without a configured backend or SMS sender, these routes show explanatory errors instead of inventing data.

The demo routes `/dashboard` and `/clinic` remain separate and synthetic.

## Production gate

Use HTTPS, secure cookies, same-origin routing, trusted origin checks, durable DB migrations, encrypted backups, revocable clinic grants, private file storage and edge IP throttling before handling real patient data. No real clinical workflows are enabled yet.
