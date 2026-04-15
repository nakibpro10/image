# Cloudflare Workers deploy guide for CloudPix

This project has been prepared for deployment to Cloudflare Workers using the OpenNext adapter.

## What was changed
- Added `wrangler.jsonc`
- Added `open-next.config.ts`
- Added Cloudflare scripts to `package.json`
- Removed `@vercel/analytics`
- Added `.dev.vars` / `.dev.vars.example`
- Added `public/_headers` for static asset caching
- Enabled `initOpenNextCloudflareForDev()` in `next.config.mjs`

## Before deploy
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Keep your local `.env.local` (or shell env) for build-time variables.
   This app uses `NEXT_PUBLIC_*` values in client code, so they must exist when `pnpm deploy` builds the app.

3. Put your runtime environment variables in Cloudflare:
   - Public runtime vars: set in Cloudflare dashboard or `wrangler.jsonc` `vars`
   - Secrets:
     ```bash
     pnpm wrangler secret put NEXT_PUBLIC_SUPABASE_URL
     pnpm wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
     pnpm wrangler secret put NEXT_PUBLIC_APP_URL
     pnpm wrangler secret put NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
     pnpm wrangler secret put IMGBB_API_KEY
     ```

   Only set the variables you actually use.

4. Login to Cloudflare:
   ```bash
   pnpm wrangler login
   ```

## Local preview in Workers runtime
```bash
pnpm preview
```

## Deploy
```bash
pnpm deploy
```

## Notes
- If you want a different worker name, update both:
  - `wrangler.jsonc` -> `name`
  - `wrangler.jsonc` -> `services[0].service`
- This project targets **Cloudflare Workers**, not plain static Cloudflare Pages upload.
- Your middleware avoids Node-only APIs, which is important because Node.js in Next.js middleware is not supported on Cloudflare yet.
- `pnpm install` may update `pnpm-lock.yaml` because the dependency list changed.
