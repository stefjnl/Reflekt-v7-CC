# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reflekt v6 - locally-hosted digital diary with 11+ years history (2,000+ entries). Gemini-inspired UI with collapsible sidebar, TipTap rich text editor, Auth.js credentials auth, PostgreSQL + Drizzle ORM.

## Architecture

**Turborepo monorepo** with pnpm workspaces (pnpm 9.15.4+, Node 20+):
- `apps/web` - Next.js 15.1.6 app (App Router, React 19)
- `packages/db` - Drizzle ORM layer (schema, migrations, db client via postgres.js)
- `packages/ui` - Shared UI components (Radix UI slot, CVA, clsx, tailwind-merge)
- `packages/config` - Shared TypeScript configs

**Key patterns**:
- Auth.js v5 beta (next-auth@5.0.0-beta.25) with credentials provider + bcryptjs
- Middleware exports `auth` from `@/lib/auth` for route protection
- Protected routes under `(dashboard)` route group - includes main page, archive, entry/[id]
- Valtio for UI state (sidebarCollapsed, theme) in `apps/web/lib/store.ts`
- TipTap editor with 1s debounce auto-save to `/api/autosave`
- Sidebar entries API with grouped queries: Today, Yesterday, Previous 30 Days

**Database**:
- External PostgreSQL at `192.168.68.112:5432` (existing data, do NOT reset)
- Schema: `packages/db/src/schema/` (users, entries tables with indexes)
- Drizzle ORM with `db` and `migrationClient` exports from `@reflekt/db`
- Entries table has optimized indexes: createdAt desc, user+createdAt composite, cursor pagination
- 2,036 entries, 3 users already exist

**API Routes**:
- `/api/auth/[...nextauth]` - Auth.js handlers
- `/api/entries` - GET (sidebar grouped entries), POST (create entry)
- `/api/autosave` - POST (debounced content save)

## Common Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server (port 3005)
pnpm build                  # Build all packages
pnpm lint                   # Lint all packages
pnpm clean                  # Clean turbo cache and node_modules

# Database (run from root)
pnpm db:studio              # Drizzle Studio
pnpm db:generate            # Generate migrations from schema
pnpm db:migrate             # Run migrations

# Monorepo
turbo run build             # Build all packages with cache
turbo run dev               # Run all dev servers

# Package-specific
pnpm --filter web dev       # Run only web app
pnpm --filter @reflekt/db db:studio
pnpm --filter @reflekt/db db:push  # Push schema directly (dev only)
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Required vars:
   - `DATABASE_URL` - PostgreSQL connection (default: `postgresql://stefan:stefan_secure_password_2025@192.168.68.112:5432/reflekt-db`)
   - `AUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `AUTH_URL` - `http://localhost:3005`
   - `PORT` - `3005` (optional, defaults in scripts)
3. Test connection: `python test_db_connection.py`

## Development Notes

- **Do NOT** drop/reset database - contains 2,036 real entries
- Next.js runs on port **3005** (not 3000)
- Auth uses JWT sessions, not database sessions
- Sidebar groups: Today, Yesterday, Previous 30 Days (limits: 10, 10, 20 entries)
- Archive page shows first 50 entries with cursor pagination planned
- Tailwind CSS 3.4 + @tailwindcss/postcss 4.0 + Radix UI primitives
- Deploy via Docker Compose or systemd (see README.md, reflekt.service)

## Key Files

- `apps/web/lib/auth.ts` - Auth.js config with credentials provider
- `apps/web/middleware.ts` - Route protection (exports auth middleware)
- `apps/web/components/editor/tiptap-editor.tsx` - Rich text editor with auto-save
- `apps/web/components/sidebar/` - Gemini-style collapsible sidebar
- `packages/db/src/client.ts` - Database connection (postgres.js + drizzle)
- `packages/db/src/schema/` - users.ts, entries.ts with type exports

## Testing

Run Python test scripts to verify DB connection:
```bash
python test_db_connection.py      # Basic connection test
python test_users_schema.py       # Verify users schema
python check_users.py             # Check existing users
```
