Reflekt v6 - Implementation Plan

 Database Connection

 - Host: 192.168.68.112 (Blackview mini PC)
 - User: reflekt_user
 - Password: reflekt_secure_password_2025
 - Database: reflekt-db
 - Port: 5432
 - Connection String: postgresql://reflekt_user:reflekt_secure_password_2025@192.168.68.112:5432/reflekt-db

 Architecture Overview

 - Monorepo: Turborepo with pnpm workspaces
 - Apps: apps/web (Next.js 15)
 - Packages: packages/db (Drizzle ORM), packages/ui (Radix UI), packages/config (shared configs)
 - Database: Existing PostgreSQL with 1,985+ entries (introspect, don't migrate)
 - Auth: Auth.js v5 with credentials provider
 - State: Valtio for UI state (sidebar, theme)
 - Editor: TipTap rich-text with auto-save
 - Deployment: Docker Compose + Systemd on Ubuntu

 Implementation Phases

 Phase 1: Monorepo Foundation

 Goal: Initialize Turborepo with pnpm, configure TypeScript, establish workspace structure

 Files to Create:
 1. package.json (root) - pnpm workspace definition
 2. pnpm-workspace.yaml - workspace packages
 3. turbo.json - build pipeline
 4. packages/config/typescript/base.json - shared TS config
 5. .gitignore - exclude node_modules, .env, .next

 Commands:
 pnpm init
 pnpm add -D turbo
 pnpm add -w typescript @types/node

 ---
 Phase 2: Database Package

 Goal: Connect to existing PostgreSQL, introspect schema, generate Drizzle types

 Files to Create:
 1. packages/db/package.json - drizzle-orm, postgres, drizzle-kit
 2. packages/db/drizzle.config.ts - connection config
 3. packages/db/src/schema/users.ts - users table schema
 4. packages/db/src/schema/entries.ts - entries table schema (with indexes)
 5. packages/db/src/client.ts - database connection
 6. packages/db/src/index.ts - exports db, schema, types
 7. packages/db/.env - DATABASE_URL

 Key Schema Details:
 - entries table: id, title, content, user_id, created_at, updated_at, import_source, import_date
 - Indexes: idx_entries_created_at, idx_entries_user_created, idx_entries_cursor (for pagination)
 - users table: id, username, email, password_hash, created_at, updated_at

 Commands:
 cd packages/db
 pnpm drizzle-kit introspect:pg
 pnpm drizzle-kit studio  # Verify 1,985+ entries visible

 ---
 Phase 3: UI Package

 Goal: Shared Radix UI components, Tailwind CSS 4 config, mesh gradients

 Files to Create:
 1. packages/ui/package.json - @radix-ui/react-*, tailwindcss, class-variance-authority
 2. packages/ui/tailwind.config.ts - theme tokens, mesh gradients
 3. packages/ui/src/components/button.tsx - Radix Button primitive
 4. packages/ui/src/components/input.tsx - Radix Input
 5. packages/ui/src/styles/globals.css - Tailwind imports
 6. packages/ui/src/index.ts - export all components

 Theme Features:
 - Mesh gradients: bg-mesh-gradient (purple/blue radial gradients)
 - Dark mode: class-based strategy
 - Typography: @tailwindcss/typography for prose

 ---
 Phase 4: Next.js App Scaffold

 Goal: Next.js 15 app with Auth.js, route groups, middleware

 Files to Create:
 1. apps/web/package.json - next@15, react@19, next-auth@beta, valtio
 2. apps/web/next.config.ts - standalone output, transpilePackages
 3. apps/web/tsconfig.json - extends packages/config
 4. apps/web/tailwind.config.ts - extends packages/ui
 5. apps/web/.env.local - DATABASE_URL, AUTH_SECRET, AUTH_URL
 6. apps/web/middleware.ts - Auth.js middleware
 7. apps/web/lib/auth.ts - Auth.js v5 config with credentials provider
 8. apps/web/lib/store.ts - Valtio UI state (sidebar, theme)

 Route Structure:
 app/
 ├── (auth)/
 │   ├── login/
 │   │   └── page.tsx          # Login form
 │   └── layout.tsx
 ├── (dashboard)/
 │   ├── layout.tsx            # Gemini-style layout with sidebar
 │   ├── page.tsx              # Today's entry editor
 │   ├── archive/
 │   │   └── page.tsx          # Historical entries (pagination)
 │   └── entry/
 │       └── [id]/
 │           └── page.tsx      # Individual entry
 └── api/
     ├── auth/[...nextauth]/route.ts
     ├── entries/route.ts      # GET list (sidebar grouping)
     ├── entries/[id]/route.ts # GET/PATCH/DELETE
     └── autosave/route.ts     # POST debounced save

 Auth.js Configuration:
 - Provider: Credentials (username + password)
 - Password hash: bcrypt (verify against users.password_hash)
 - Session: JWT strategy
 - Protected routes: All except /login

 ---
 Phase 5: Gemini-Style UI Layout

 Goal: Collapsible sidebar with chronological grouping, main content area

 Files to Create:
 1. apps/web/app/(dashboard)/layout.tsx - Flex layout (sidebar + main)
 2. apps/web/components/sidebar/sidebar.tsx - Client component (Valtio state)
 3. apps/web/components/sidebar/sidebar-section.tsx - Today/Yesterday/Previous 30 Days sections
 4. apps/web/components/sidebar/sidebar-entry-item.tsx - Individual entry link
 5. apps/web/app/api/entries/route.ts - GET /api/entries?sidebar=true

 Sidebar Logic:
 - Fetch entries grouped by:
   - Today: created_at >= start of today
   - Yesterday: created_at >= start of yesterday AND < start of today
   - Previous 30 Days: created_at >= 30 days ago AND < start of yesterday
 - Collapse/expand state: Valtio uiStore.sidebarCollapsed
 - Translucent background: bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm

 Layout Features:
 - Sidebar: 80px (collapsed) / 280px (expanded)
 - Main area: max-w-4xl mx-auto centered canvas
 - Background: mesh gradient from-purple-50 via-white to-blue-50

 ---
 Phase 6: TipTap Editor & Auto-Save

 Goal: Rich-text editor with bold, italic, headings, auto-save every 1s

 Files to Create:
 1. apps/web/components/editor/tiptap-editor.tsx - Client component
 2. apps/web/components/editor/editor-toolbar.tsx - Bold/Italic/Heading buttons
 3. apps/web/app/api/autosave/route.ts - POST endpoint (updates content + updated_at)

 TipTap Setup:
 - Extensions: StarterKit, Placeholder
 - Placeholder: "What's on your mind today?"
 - Auto-save: onUpdate debounced 1000ms
 - Optimistic UI: No loading states, silent save

 Today's Entry Logic (apps/web/app/(dashboard)/page.tsx):
 1. Server Component fetches entry for today: WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE
 2. If exists: pass entry.content to TipTap
 3. If not: create new entry with empty content, pass to TipTap
 4. TipTap auto-saves on every change

 ---
 Phase 7: Archive & Cursor Pagination

 Goal: /archive page with server-side pagination (50 entries/page)

 Files to Create:
 1. apps/web/app/(dashboard)/archive/page.tsx - Server Component with searchParams
 2. apps/web/components/archive/entry-list.tsx - Client component (entry cards)
 3. apps/web/components/archive/pagination.tsx - Next/Previous buttons

 Cursor Pagination:
 - Cursor format: createdAt_id (e.g., 2024-01-15T10:30:00Z_123)
 - Query: WHERE user_id = ? AND (created_at, id) < (cursor_date, cursor_id) ORDER BY created_at DESC, id DESC LIMIT 51
 - Fetch 51 entries: if length > 50, hasNextPage = true
 - Next cursor: last entry's createdAt_id

 Performance:
 - Index: idx_entries_cursor on (created_at DESC, id DESC)
 - Select columns: id, title, content (truncated), created_at
 - Server Component: zero client JS for list rendering

 ---
 Phase 8: Search & Filtering

 Goal: Search by title/content, filter by date range

 Files to Create:
 1. apps/web/components/archive/search-filters.tsx - Client component (form)
 2. apps/web/app/(dashboard)/archive/page.tsx - Handle searchParams.q, searchParams.from, searchParams.to

 Search Implementation:
 - Basic: WHERE (title ILIKE '%query%' OR content ILIKE '%query%') (uses indexes)
 - URL state: /archive?q=search+term&cursor=...

 Future Enhancement (optional):
 - Full-text search: Add tsvector column, GIN index, ts_rank queries

 ---
 Phase 9: Docker Deployment

 Goal: Docker Compose for production, Systemd service for auto-start

 Files to Create:
 1. Dockerfile - Multi-stage build with standalone output
 2. docker-compose.yml - Service definition
 3. .env.example - Template for DATABASE_URL, AUTH_SECRET
 4. scripts/systemd/reflekt.service - Systemd unit file

 Dockerfile:
 FROM node:20-alpine AS base
 RUN corepack enable && corepack prepare pnpm@latest --activate

 FROM base AS deps
 WORKDIR /app
 COPY pnpm-lock.yaml ./
 RUN pnpm fetch

 FROM base AS builder
 WORKDIR /app
 COPY --from=deps /app/node_modules ./node_modules
 COPY . .
 RUN pnpm install
 RUN pnpm turbo run build --filter=web

 FROM base AS runner
 WORKDIR /app
 ENV NODE_ENV production
 RUN addgroup --system --gid 1001 nodejs
 RUN adduser --system --uid 1001 nextjs
 COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
 COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
 COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
 USER nextjs
 EXPOSE 3000
 CMD ["node", "apps/web/server.js"]

 docker-compose.yml:
 version: '3.8'
 services:
   reflekt:
     build: .
     ports:
       - "3000:3000"
     environment:
       - DATABASE_URL=postgresql://reflekt_user:reflekt_secure_password_2025@192.168.68.112:5432/reflekt-db
       - AUTH_SECRET=${AUTH_SECRET}
       - AUTH_URL=http://localhost:3000
     restart: unless-stopped

 Systemd Setup (/etc/systemd/system/reflekt.service):
 [Unit]
 Description=Reflekt v6 Docker Compose
 Requires=docker.service
 After=docker.service

 [Service]
 Type=oneshot
 RemainAfterExit=yes
 WorkingDirectory=/opt/reflekt
 ExecStart=/usr/bin/docker-compose up -d
 ExecStop=/usr/bin/docker-compose down

 [Install]
 WantedBy=multi-user.target

 Deployment Commands:
 # On Ubuntu server
 sudo mkdir -p /opt/reflekt
 sudo cp -r /path/to/Reflekt-v7-CC/* /opt/reflekt/
 cd /opt/reflekt
 docker-compose build
 docker-compose up -d
 sudo systemctl enable reflekt.service

 ---
 Critical Files Summary

 Monorepo Root

 - package.json - pnpm workspace root
 - pnpm-workspace.yaml - packages/, apps/
 - turbo.json - build pipeline
 - .env.example - environment template
 - Dockerfile - production build
 - docker-compose.yml - deployment config

 packages/db

 - src/schema/users.ts - users table
 - src/schema/entries.ts - entries table with indexes
 - src/client.ts - Drizzle connection
 - src/index.ts - exports
 - drizzle.config.ts - Drizzle Kit config

 packages/ui

 - src/components/button.tsx - Radix Button
 - src/components/input.tsx - Radix Input
 - tailwind.config.ts - theme + mesh gradients
 - src/styles/globals.css - Tailwind base

 apps/web

 - lib/auth.ts - Auth.js v5 config
 - lib/store.ts - Valtio UI state
 - middleware.ts - route protection
 - app/(auth)/login/page.tsx - login form
 - app/(dashboard)/layout.tsx - Gemini layout
 - app/(dashboard)/page.tsx - today's entry
 - app/(dashboard)/archive/page.tsx - paginated list
 - components/sidebar/sidebar.tsx - collapsible sidebar
 - components/editor/tiptap-editor.tsx - rich-text editor
 - app/api/entries/route.ts - sidebar grouping
 - app/api/entries/[id]/route.ts - CRUD
 - app/api/autosave/route.ts - debounced save

 ---
 Implementation Order

 1. Initialize monorepo: package.json, pnpm-workspace.yaml, turbo.json
 2. Setup packages/db: schema, client, verify connection to 192.168.68.112
 3. Setup packages/ui: Radix components, Tailwind config
 4. Setup apps/web: Next.js 15, Auth.js, route structure
 5. Build Gemini layout: sidebar + main area
 6. Integrate TipTap: editor + auto-save
 7. Build archive: cursor pagination
 8. Add search: ILIKE queries
 9. Docker deployment: Dockerfile, docker-compose.yml, Systemd

 ---
 Environment Variables

 apps/web/.env.local:
 DATABASE_URL=postgresql://reflekt_user:reflekt_secure_password_2025@192.168.68.112:5432/reflekt-db
 AUTH_SECRET=<generate-with-openssl-rand-base64-32>
 AUTH_URL=http://localhost:3000
 NODE_ENV=development

 Production (.env.production):
 DATABASE_URL=postgresql://reflekt_user:reflekt_secure_password_2025@192.168.68.112:5432/reflekt-db
 AUTH_SECRET=<production-secret>
 AUTH_URL=http://localhost:3000
 NODE_ENV=production

 ---
 Key Technical Decisions

 - Turborepo: Monorepo orchestration with caching
 - Drizzle ORM: Type-safe queries, introspect existing DB
 - Auth.js v5: JWT sessions, credentials provider
 - Cursor Pagination: Stable, fast pagination for 2,000+ entries
 - Valtio: Proxy-based state for UI (sidebar, theme)
 - TipTap: Headless editor, full control over UX
 - Standalone Output: Minimal Docker image size
 - Server Components: Default to server, client only for interactivity

 ---
 Performance Targets

 - Initial load: < 2s (Server Components)
 - Editor load: < 500ms (code splitting)
 - Auto-save: < 100ms (optimistic UI)
 - Archive page: < 1s (indexed queries, 50 entries)
 - Search: < 500ms (ILIKE with indexes)

 ---
 Migration Notes

 - No data migration required: Existing 1,985+ entries stay in place
 - Introspect schema: Use drizzle-kit introspect:pg to generate types
 - Verify data: Run pnpm --filter @reflekt/db db:studio to browse entries
 - Create admin user: Manually insert into users table with bcrypt hash
 - Backup first: pg_dump reflekt-db > backup.sql before connecting

 ---
 Next Steps After Plan Approval

 1. Initialize Turborepo workspace
 2. Create packages/db and test connection to 192.168.68.112
 3. Generate Drizzle schema from existing tables
 4. Build packages/ui with Radix primitives
 5. Scaffold apps/web with Auth.js
 6. Implement Gemini layout with sidebar
 7. Integrate TipTap editor
 8. Build archive with pagination
 9. Add search functionality
 10. Create Docker deployment files
 11. Deploy to Ubuntu with Systemd