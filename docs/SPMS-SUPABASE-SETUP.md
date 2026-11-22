# Smart Masar SPMS — Supabase PostgreSQL migration (draft)

**Status (2026-11-23):** 15 PostgreSQL tables have been created and verified in the isolated free Supabase development project. **Application connection, migration of existing demo data, Prisma runtime validation, and production deployment have NOT occurred.**

## Verified infrastructure

- Supabase project: **Smart Masar SPMS Dev** (ID `kmwlzsstdniboqysqqol`)
- Region: `eu-central-1` (Frankfurt)
- Subscription at creation: Free, project creation quoted at USD 0/month.
- Private Postgres schema: `spms`, created and verified. Contains 15 application tables, 44 foreign keys and 79 indexes; all 15 tables have RLS enabled. Public `anon`/`authenticated` read privileges and schema USAGE are disabled.
- SQL baseline: `docs/SPMS-POSTGRES-INITIAL-SCHEMA.sql` (migration applied to Supabase under `spms_initial_postgres_schema`).
- Smoke test: inserted a temporary company and organizational unit within a SQL transaction, then rolled back; checked both base tables returned to zero rows.
- `spms` usage revoked from `PUBLIC`, `anon`, and `authenticated`. The app uses Prisma on the server side; do **not** expose DB credentials to the client or open Data API access to this schema.

## Code changes in this branch

- Prisma datasource provider changes from `sqlite` to `postgresql` (Prisma v6.x).
- Removed the implicit SQLite URL fallback from `src/lib/prisma-client.ts`.
- Existing demo Preview remains on its previous branch and SQLite database. No changes to current application's runtime.

## Required configuration (do not commit passwords)

**DATABASE_URL** must be stored as a *server-only secret* in the application's hosting environment. Use the actual **Supabase Session Pooler** connection string displayed under Project > Connect; use port 5432 and append or set `?schema=spms`. The URL's password is private and must never appear in chat messages, screenshots, source control, client-side variables, or `NEXT_PUBLIC_*` values.

Example URL shape, **placeholders only**:

```text
postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres?schema=spms
```

Current Auth.js configuration must keep its separate `AUTH_SECRET` server-only.

## Compatibility, security, and cutover checklist

1. Validate the new PostgreSQL Prisma schema with Prisma **6.14.x** (`npx prisma validate`) and generate a fresh Prisma Client (`npx prisma generate`).
2. Initial PostgreSQL DDL has been applied **only** to the empty `spms` development schema using a Supabase migration. Confirm the checked-in SQL baseline against `prisma migrate diff` / `prisma db pull` before establishing Prisma migration history; do not run a destructive push against the SQLite source.
3. Structural checks passed: 15 tables, 44 foreign keys, 79 indexes, 15 RLS-enabled tables and zero directly publicly readable tables. **Full Prisma migration-drift/runtime verification remains pending.** Supabase advisors flagged 22 potentially unindexed foreign keys (performance only) and 15 RLS-with-no-policy notices (intentional for a private server-only schema). Index tuning should be decided before production use.
4. Keep server-side RBAC and company ownership checks on all data operations. Newly created organizational tables must not inherit broad public API permissions.
5. Create synthetic demo users/roles and sample 2026 objectives in the new database **after** schema validation. Existing SQLite demo data are **not** copied automatically.
6. Test the full application with the DB URL stored in the runtime's server-side Secrets UI. Verify login, create/update an objective, refresh, restart, then reimport the application to confirm persistence in Supabase.
7. Test administrator, manager, employee and unauthenticated access separately before considering the new database ready.
8. Only after acceptance, switch the Google AI Studio test application to this branch/connection. Keep the previous working backup and the old SQLite fixture for rollback.

**Important:** Prisma 6 SQLite files and PostgreSQL are different database engines. Changing `DATABASE_URL` alone is not a migration; the database models need an approved SQL migration and seed.

## Reference

Supabase Prisma integration: https://supabase.com/docs/guides/database/prisma

Smart Masar system requirements: https://docs.google.com/document/d/1gZfZ-ah0GIKuGbZg3wpZge6ZDsrUUbY87Xhq_Jhn4JA/edit
