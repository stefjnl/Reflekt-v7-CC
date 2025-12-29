# Reflekt v6

A locally-hosted, premium digital diary designed to handle 11+ years of history (2,000+ entries) with a UX inspired by the Google Gemini web interface.

## Features

- ✨ **Gemini-Inspired UI**: Collapsible sidebar with chronological grouping (Today, Yesterday, Previous 30 Days)
- 📝 **Rich Text Editor**: TipTap editor with auto-save (1s debounce)
- 🗄️ **Historical Archive**: Server-side pagination for 2,000+ entries
- 🔐 **Local Authentication**: Secure auth via Auth.js with credentials provider
- 🎨 **Modern Design**: Vibrant mesh gradients, Radix UI primitives, Light/Dark mode
- 🚀 **Production Ready**: Docker + Systemd deployment on Ubuntu

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Monorepo**: Turborepo with pnpm workspaces
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS 4 + Radix UI
- **State**: Valtio for UI state
- **Editor**: TipTap with auto-save
- **Auth**: Auth.js v5 (credentials provider)
- **Deployment**: Docker Compose + Systemd

## Project Structure

```
Reflekt-v7-CC/
├── apps/
│   └── web/                    # Next.js 15 app
│       ├── app/
│       │   ├── (dashboard)/    # Protected routes
│       │   ├── login/          # Auth
│       │   └── api/            # API routes
│       ├── components/
│       │   ├── sidebar/        # Gemini-style sidebar
│       │   └── editor/         # TipTap editor
│       └── lib/
│           ├── auth.ts         # Auth.js config
│           └── store.ts        # Valtio UI state
│
├── packages/
│   ├── db/                     # Drizzle ORM
│   │   └── src/
│   │       └── schema/         # Database schema
│   ├── ui/                     # Radix UI components
│   │   └── src/
│   │       └── components/     # Button, Input, etc.
│   └── config/                 # Shared TypeScript configs
│
├── Dockerfile                  # Production build
├── docker-compose.yml          # Deployment
└── reflekt.service             # Systemd unit file
```

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (running on 192.168.68.112:5432)

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Test database connection**:
   ```bash
   python test_db_connection.py
   ```

4. **Run development server**:
   ```bash
   pnpm dev
   ```

5. **Open browser**:
   ```
   http://localhost:3000
   ```

### Database Connection

The app connects to an existing PostgreSQL database with the following credentials:

- **Host**: 192.168.68.112
- **Port**: 5432
- **Database**: reflekt-db
- **User**: stefan
- **Password**: stefan_secure_password_2025
- **SSL Mode**: prefer

**Current Data**:
- 2,036 entries
- 3 users

### Available Scripts

```bash
# Development
pnpm dev                    # Start Next.js dev server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm db:studio              # Launch Drizzle Studio
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations

# Monorepo
turbo run build             # Build all packages
turbo run lint              # Lint all packages
```

## Production Deployment

### Option 1: Docker Compose (Recommended)

1. **Build the image**:
   ```bash
   docker-compose build
   ```

2. **Start the container**:
   ```bash
   docker-compose up -d
   ```

3. **Check logs**:
   ```bash
   docker-compose logs -f reflekt
   ```

### Option 2: Systemd Service (Ubuntu)

1. **Copy files to server**:
   ```bash
   sudo mkdir -p /opt/reflekt
   sudo cp -r /path/to/Reflekt-v7-CC/* /opt/reflekt/
   cd /opt/reflekt
   ```

2. **Build Docker image**:
   ```bash
   docker-compose build
   ```

3. **Install Systemd service**:
   ```bash
   sudo cp reflekt.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable reflekt.service
   sudo systemctl start reflekt.service
   ```

4. **Check status**:
   ```bash
   sudo systemctl status reflekt.service
   ```

### Environment Variables (Production)

Create a `.env.production` file:

```env
DATABASE_URL=postgresql://stefan:stefan_secure_password_2025@192.168.68.112:5432/reflekt-db?sslmode=prefer
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
AUTH_URL=http://localhost:3000
NODE_ENV=production
```

## Authentication

The app uses Auth.js v5 with a credentials provider. Users authenticate with email and password, verified against the `users` table in PostgreSQL using bcrypt hashed passwords.

### Default User

Check the existing users in your database:

```sql
SELECT id, email FROM users;
```

## Features Implemented

### Phase 0-6 ✅
- [x] Database connection (PostgreSQL + Drizzle ORM)
- [x] Turborepo monorepo setup
- [x] Packages: db, ui, config
- [x] Next.js 15 app with Auth.js
- [x] Gemini-style sidebar layout
- [x] TipTap editor with auto-save

### Future Enhancements
- [ ] Cursor-based pagination (archive)
- [ ] Full-text search (PostgreSQL ts_vector)
- [ ] Export entries (JSON, Markdown)
- [ ] Tags/categories
- [ ] Dark mode toggle (currently CSS-based)

## Troubleshooting

### Database Connection Issues

If the connection test fails:

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify pg_hba.conf allows connections:
   ```bash
   # On the database server
   sudo nano /etc/postgresql/15/main/pg_hba.conf
   # Add: host reflekt-db stefan 192.168.68.0/24 md5
   sudo systemctl reload postgresql
   ```

3. Test connection:
   ```bash
   python test_db_connection.py
   ```

### Build Errors

If you encounter build errors:

1. Clear caches:
   ```bash
   pnpm clean
   rm -rf node_modules
   pnpm install
   ```

2. Rebuild:
   ```bash
   pnpm turbo run build --force
   ```

## License

Private project - All rights reserved

## Support

For issues or questions, create an issue in the project repository.
