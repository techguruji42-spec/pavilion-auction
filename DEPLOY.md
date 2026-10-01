# Pavilion deployment

## Fastest production path: Render/Railway + managed PostgreSQL

1. Push this folder to a private GitHub repository.
2. Create a managed PostgreSQL database (Render Postgres, Railway Postgres, Neon, or Supabase) and copy its connection string.
3. Create a web service from the repository. Use Node 22, install command `pnpm install --frozen-lockfile`, build command `pnpm db:generate && pnpm build`, and start command `pnpm db:push && pnpm db:seed && pnpm start`.
4. Set these environment variables in the host dashboard:

   - `DATABASE_URL` — the managed PostgreSQL connection string
   - `APP_ORIGIN` — the final public HTTPS URL, for example `https://auction.example.com`
   - `PORT` — use the host-provided port, or `3000`
   - `BOOTSTRAP_ADMIN_EMAIL` — the first super-admin email
   - `BOOTSTRAP_ADMIN_PASSWORD` — a unique password with at least 16 characters

5. Deploy once. After the first successful initialization, rotate the bootstrap password and remove it from the host environment if your provider supports one-time secrets. Create additional users from the Super Admin workspace.

Socket.IO needs a long-running Node service. Do not deploy this as a static export or an edge-only/serverless function. If the host has a WebSocket toggle, enable it. Keep one app instance unless you add a shared Socket.IO adapter and shared database locking strategy.

## VPS/Docker

Install Docker and Docker Compose on the VPS, copy the project to it, change every placeholder password in `docker-compose.yml`, then run:

```bash
docker compose up -d --build
```

Put Nginx, Caddy, or a cloud load balancer in front of port 3000 and proxy WebSocket upgrades. Set `APP_ORIGIN` to the final HTTPS origin. Keep PostgreSQL private; only the web service should reach it. Back up the `pavilion_db` volume.

## Local production-like check

```bash
pnpm install
pnpm db:generate
pnpm build
```

For the local fictional demo, use `pnpm dev` and open `http://localhost:3000`. Demo credentials are created in `data/demo-credentials.json`; this file is intentionally ignored and must not be committed.
