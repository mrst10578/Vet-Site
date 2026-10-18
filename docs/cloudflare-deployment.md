# Petora / Cloudflare deployment

## Live first-stage preview

- Public URL: https://petora.pages.dev
- Provider: Cloudflare Pages **Direct Upload**
- Account: Zh St #2 (`5c08f03802249fd7a8539c855e9eac1b`)
- Pages project name: `petora`
- Production branch setting: `main`
- Deployment content: standalone `cloudflare/petora-preview.mjs` as Pages `_worker.js`
- Fallback Worker: `petora.zh-st-2.workers.dev`
- Real clinical data, OTP, database and API: **NOT connected** to this public preview

## Important distinction

Cloudflare GitHub App installation returned an API error when trying to enable automatic Git deployment. Consequently this Pages project was created using Direct Upload. **Pushing to GitHub does not automatically update the live site.**

The current Pages URL serves a deliberately isolated interactive marketing/demo site. It includes home, owner demo, clinic demo and pet profile preview, with zero patient data storage. It does not run the full Next.js server or the NestJS clinical API.

## Re-deploy this exact preview

1. Review source file `cloudflare/petora-preview.mjs` and merge changes through PR.
2. Upload that file as `_worker.js` to the Pages project's deployments endpoint, using a direct upload with `manifest={}` and production branch `main`.
3. Verify Cloudflare deployment status is `deploy: success` and check pages directly in a browser.

Alternatively the file can be uploaded as a Cloudflare Worker module named `petora` and served under `petora.zh-st-2.workers.dev`.

## Next.js static export (separate from deployed preview)

`npm run build:pages` sets `CF_PAGES_STATIC=1` and generates `out/`. This command is validated in an independent GitHub Actions workflow. It is preparation for replacing the standalone preview with the actual Next.js frontend. Static export does not support the dynamic NestJS backend, authenticating patients, medication changes, live prescriptions or SMS.

## Future complete app deployment

To run the complete product, provision HTTPS/same-origin routing and a separately deployed NestJS API, PostgreSQL, verified SMS OTP, restricted access grants and backups. Move to a Cloudflare Workers-compatible Next.js full-stack adapter or reverse-proxy secure origin for non-static routes. Medical workflows must remain disabled until security and veterinary validation are complete.

## Branding

Public brand: **پتورا / Petora**.
Palette: eucalyptus green / mint / warm off-white.
Primary Persian font family declared: Mikhak, with local fallback until a licensed web font asset is available.

## Keeping secrets safe

Do not commit API tokens, OTP peppers, database credentials or patient data into this repository or the Pages preview. Direct Upload authentication must be provided only by a credential managed in an external secret store when automated deployment becomes available.
