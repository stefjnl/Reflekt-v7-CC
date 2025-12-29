# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reflekt v6 - locally-hosted digital diary with 11+ years history (2,000+ entries). Gemini-inspired UI with collapsible sidebar, TipTap rich text editor, Auth.js credentials auth, PostgreSQL + Drizzle ORM.

## Architecture

**Turborepo monorepo** with pnpm workspaces:
- `apps/web` - Next.js 15 app (App Router, React 19)
- `packages/db` - Drizzle ORM layer (schema, migrations, db client)
- `packages/ui` - Radix UI shared components
- `packages/config` - Shared TypeScript configs

**Key patterns**:
- Auth.js v5 middleware in `apps/web/lib/auth.ts` - credentials provider with bcrypt
- Protected routes under `(dashboard)` route group - requires auth middleware
- Valtio for UI state in `apps/web/lib/store.ts`
- TipTap editor with 1s debounce auto-save
- Server-side pagination for 2,000+ entries

**Database**:
- External PostgreSQL at `192.168.68.112:5432` (existing data, do NOT reset)
- Schema: `packages/db/src/schema/` (users, entries tables)
- Drizzle ORM with `db` export from `@reflekt/db`
- 2,036 entries, 3 users already exist

## Common Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server (port 3005)
pnpm build                  # Build all packages
pnpm lint                   # Lint all packages

# Database (run from root or packages/db)
pnpm db:studio              # Drizzle Studio
pnpm db:generate            # Generate migrations from schema
pnpm db:migrate             # Run migrations
pnpm db:push                # Push schema directly (dev only)

# Monorepo
turbo run build             # Build all packages with cache
turbo run dev               # Run all dev servers

# Package-specific
pnpm --filter web dev       # Run only web app
pnpm --filter @reflekt/db db:studio
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Required vars:
   - `DATABASE_URL` - PostgreSQL connection (default: existing DB at 192.168.68.112)
   - `AUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `AUTH_URL` - `http://localhost:3005`
3. Test connection: `python test_db_connection.py`

## Development Notes

- **Do NOT** drop/reset database - contains 2,036 real entries
- Next.js runs on port **3005** (not 3000)
- Auth uses JWT sessions, not database sessions
- Sidebar groups: Today, Yesterday, Previous 30 Days
- Tailwind CSS 4 with Radix UI primitives
- Deploy via Docker Compose or systemd (see README.md)

## Testing

Run Python test scripts to verify DB connection:
```bash
python test_db_connection.py      # Basic connection test
python test_users_schema.py       # Verify users schema
python check_users.py              # Check existing users
```
