# Petronus / Cloudflare deployment

## Public launch (verified via Cloudflare deployment API)

**Brand:** پترونوس / Petronus
**Primary demo URL:** https://petronus.zh-st-2.workers.dev
**Existing Pages URL:** https://petora.pages.dev (legacy hostname, now serving Petronus branding)
**Account:** Cloudflare Zh2, ID `5c08f03802249fd7a8539c855e9eac1b`
**Worker script:** `petronus`, workers.dev enabled
**Pages project:** `petora`; latest Direct Upload succeeded after branding change
**Patient records, SMS OTP and clinical API:** not connected to these public demos.

Note: Renaming the Cloudflare Pages project does NOT rename its `pages.dev` subdomain. Creating a new `petronus.pages.dev` project was not possible through the authorized tool in this session. Do not advertise that Pages URL as live.

## Preview source

- Legacy source template: `cloudflare/petora-preview.mjs`.
- Canonical Petronus preview source is generated from the template with `node scripts/build-petronus-preview.mjs`.
- Generated file: `.deploy/petronus-worker.mjs` (do not commit generated output).
- Generator performs the approved string substitutions `Petora -> Petronus`, `petora -> petronus`, `پتورا -> پترونوس`.
- Upload the generated JavaScript as Worker `petronus` or as Pages `_worker.js` Direct Upload with `manifest={}` and production branch `main`.

The current deployed demo contains four public sample pages: `/`, `/dashboard`, `/clinic`, and `/pets/new`. It is separate from the complete Next.js/NestJS app and stores no real pet data.

## Next.js export and tests

`npm run build:pages` uses `CF_PAGES_STATIC=1` and creates the `out/` directory. GitHub Actions verifies the export. A static export has no functioning SMS, login, access-controlled medical API or live database. Full clinical functionality will require a separate secured backend and API integration.

## Automatic deployments

Cloudflare Pages GitHub App linking previously returned error 8000011. The public demo is therefore manually deployed via API and does **not** automatically update when GitHub changes. Keep this distinction explicit.

## Privacy

Never include API tokens, clinical records, patient uploads, session secrets or database credentials in this public preview. The CSS declares Mikhak as the preferred Persian font with system fallback.
