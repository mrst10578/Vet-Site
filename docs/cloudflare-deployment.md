# Petronus Cloudflare deployments

## Current production website

- Public web URL: **https://petronus-dey.pages.dev**
- Cloudflare account: Zh3 / Mr.st10578@gmail.com's Account
- Account ID: `165b50f0f7f8844ee71a744b3a286504`
- Pages project: `petronus`
- GitHub source: `mrst10578/Vet-Site`, branch `main`
- Build command: `npm run build:pages`; artifact directory: `out`
- GitHub integration successfully created using Cloudflare's Pages Git source API.
- First source-based deployment ID: `94543c4f-9eb0-46f3-a5e2-25e9acea22e0`; Cloudflare reported **clone, build and deploy succeeded**.

## Deployment pipeline

Cloudflare Pages is configured with `production_deployments_enabled=true` and `preview_deployment_setting=all`. Initial build was triggered manually from Git branch via API (type `ad_hoc` with the exact main commit SHA). A subsequent real GitHub push is required to verify webhook-triggered automatic deployment.

Code changes merged into `main` should be reflected on the Pages project if the GitHub webhook is working. Do not edit clinical configuration or send any medical data through the public static site.

## Historical site and rollback

Previous Cloudflare account: Zh2, Pages project `petora`, old hostname `https://petora.pages.dev` (rebranded content). Independent Worker preview `https://petronus.zh-st-2.workers.dev` remains available. **Do not delete** until the new Git-backed pipeline has been validated.

## Current feature boundary

`CF_PAGES_STATIC=1` builds a static Next.js export. Marketing pages, owner demo, clinic demo and a non-persistent pet intake preview work. Clinical storage, OTP login, signed-in medical records, clinical prescription writing and alert delivery are not connected to this static deployment. Those features need a separately configured backend, PostgreSQL, HTTPS routing and veterinary validation.

## Security

Never expose SMS credentials, database URLs, private clinical records or OTP secrets in Git or Pages build output. The public deployment uses synthetic demo data only.
