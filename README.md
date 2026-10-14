# BrewLite 1.0

Next.js frontend (`frontend`) and NestJS/Prisma/PostgreSQL backend (`backend`). The current repository implements authentication and a product placeholder. The order, payment and operational order state APIs have not been implemented yet.

## Run locally

1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`. Copy `backend/.env.example` to `backend/.env`, or provide the same variables through the environment. Set `NEXT_PUBLIC_API_URL=http://localhost:3002/api` in `frontend/.env.local`.
2. Start PostgreSQL from the repository root: `docker compose up -d postgres`.
3. In `backend`: `npm ci`, `npx prisma migrate deploy`, `npx prisma generate`, `npm run start:dev`.
4. In `frontend`: `npm ci`, `npm run dev -- -p 3001`.

The backend serves `/api` on port 3002, and the frontend uses port 3001. Set `FRONTEND_ORIGIN` to the actual frontend origin. The browser session uses an HttpOnly, SameSite=Lax cookie; deploy both services under the same site and HTTPS in production. The existing bearer token response remains available for API clients. The frontend keeps only the user profile in memory and calls `/auth/me` on refresh.

## Roles and migration

`CUSTOMER` and `BARISTA` are the only application roles. Public registration always creates `CUSTOMER`; the request DTO rejects a `role` field. JWTs contain the user ID; the JWT strategy reads the current role and active status from PostgreSQL on every protected request. Missing or invalid credentials return 401; a valid customer token on `/api/barista/dashboard` returns 403. Barista pages are protected in the frontend, while the backend guard is authoritative.

The migration in `backend/prisma/migrations/20261014000000_add_rbac` upgrades `users` in place. It renames the original `name` column to `full_name`, adds role/status/phone fields, and defaults existing records to `CUSTOMER` and `ACTIVE`. It does not delete users or change IDs, password hashes or loyalty points. Back up the database before applying the migration in an existing deployment. The migration has not been applied to a live database by this repository change.

## Provision a development Barista

Set `BARISTA_EMAIL`, `BARISTA_PASSWORD` (at least eight characters) and optionally `BARISTA_NAME` in `backend/.env` or the command environment. After migrating and generating Prisma Client, run `npx prisma db seed` from `backend`. The seed refuses to run when `NODE_ENV=production`, creates only a missing Barista account, and refuses to convert an existing customer account. It does not reset the password of an existing Barista. Keep these credentials out of version control.

## Check

Run `npm test -- --runInBand`, `npm run lint`, and `npm run build` in `backend`. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` in `frontend`. The frontend build needs access to Google Fonts because the existing layout uses `next/font/google`.

The `/barista/dashboard`, `/barista/orders`, `/barista/preparing`, `/barista/ready`, and `/barista/history` frontend routes are protected placeholders. They do not yet read or mutate orders. Add server-side role checks to each future order management endpoint when the order module is implemented.
