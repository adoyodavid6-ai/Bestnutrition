# Deployment, backups & recovery

## Requirements

- Node.js 20+
- Outbound HTTPS from the build machine to Google Fonts (`next/font` downloads Source Serif 4 at build time)

## Option A: Vercel (recommended)

1. Import the repository in Vercel. The framework preset is detected automatically.
2. Set environment variables (Production and Preview):
   - `NEXT_PUBLIC_SITE_URL=https://your-domain`
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` (a long random password, stored only in Vercel)
   - Optional: `NEWSLETTER_WEBHOOK_URL`, `CONTACT_WEBHOOK_URL`, `LISTINGS_WEBHOOK_URL`
3. Deploy. Add your domain and verify it in Google Search Console, then submit `/sitemap.xml`.

## Option B: any Node host or container

```bash
npm ci
npm run build
NODE_ENV=production PORT=3000 npm start
```

Put a TLS-terminating reverse proxy in front of it. If you run more than one instance, replace the in-memory form rate limiter in `src/app/api/forms/[type]/route.ts` with a shared store such as Redis or Upstash.

## Pre-deploy gate

Run these in CI on every pull request:

```bash
npm ci && npm run typecheck && npm run lint && npm test && npm run build
npm start & npx wait-on http://localhost:3000 && npm run e2e
```

## Backups & recovery

| Asset | Where it lives | Backup | Recovery |
| --- | --- | --- | --- |
| Code and all published content | Git repository | Every commit; protect `main` and require reviews | Redeploy any commit; Vercel can instantly roll back to a previous deployment |
| Users' plans, lists and preferences (current release) | Each user's browser | Users can export JSON from `/account` | Not recoverable by NourishWell by design; this is stated in the privacy policy |
| Form submissions | Your webhook destination (CRM, inbox) | Follow that provider's backup settings | Re-send from the provider |
| Database (accounts phase) | Managed Postgres | Enable daily backups plus point-in-time recovery (Supabase Pro or equivalent); test a restore every quarter | Restore to a new project, run a smoke test, switch the connection string |

**Incident steps:**

1. Roll back the deployment.
2. Check `/admin` integration status.
3. For data issues, restore to a staging database first and verify RLS before switching over.
4. Record the incident and the corrective actions.

## Monitoring (recommended)

- Uptime check on `/` and `/sitemap.xml`.
- Error tracking (e.g. Sentry). Scrub request bodies and never send form contents.
- Core Web Vitals from Vercel Analytics or Search Console. Any product analytics must stay consent-gated (see `src/lib/analytics.ts`).
