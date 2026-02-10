# Travel Blog (AI Version)

Next.js + TypeScript + Tailwind + Prisma + NextAuth.

## Setup

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL (SQLite or PostgreSQL), NEXTAUTH_SECRET, NEXTAUTH_URL
npx prisma generate
npx prisma migrate dev --name init
npx tsx scripts/seed.ts
npm run dev
```

Open http://localhost:3000 . Login as admin / admin123 to approve users.

## Production (Linux + Nginx)

Build: `npm run build && npm start`. Proxy with Nginx to the Node process (default port 3000). See `deploy/` for config.
