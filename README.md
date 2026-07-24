# Aulonaclothing

TanStack Start storefront + admin panel, deployed on Vercel with Supabase as the backend
(Postgres + Auth + Storage).

## Development

```sh
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

## One-time Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql) once — it
   creates all tables, Row Level Security policies, the `product-images` storage bucket,
   and seeds the starter catalog/shipping rates.
3. Under Authentication → Users, add one user by hand (this is the store's admin login —
   there's no self-signup). Use the email set as `ADMIN_EMAIL` in
   [`src/lib/supabase.ts`](src/lib/supabase.ts).
4. Copy the project's URL and anon/public key (Project Settings → API) into `.env.local`.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Set the same env vars from `.env.local` in the Vercel project (Production + Preview),
   plus a random `CRON_SECRET` value.
3. Vercel builds this as a TanStack Start / Nitro app targeting the `vercel` preset
   (configured in `vite.config.ts`).
4. A daily cron job (`vercel.json` → `/api/cron-keepalive`) pings Supabase so the free-tier
   project never accumulates 7 days of inactivity and gets auto-paused. Vercel's own free
   tier has no inactivity pause, so nothing else needs to be kept warm.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)
