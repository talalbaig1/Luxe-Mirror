# Luxe Mirror — AI Personal Stylist & Skincare Advisor

An AI-powered personal styling app that analyzes your face and wardrobe, generates visual try-on previews, recommends skincare routines, and lets you chat with an AI stylist — all from a single dashboard.

---

## Features

### Personal Dashboard
- **Face Analysis** — Upload a selfie or use the webcam; GPT-4o Vision detects face shape, skin type, tone, concerns, and symmetry
- **Hairstyle Previews** — AI-generates a "try-on" image applying each suggested hairstyle to your photo
- **Eyewear Previews** — See how recommended frames look on your actual face
- **Grooming Looks** — Visual grooming suggestions applied to your photo
- **Wardrobe Analysis** — Upload a full-body photo; AI recommends outfits with previews showing you wearing each look
- **Skincare Regime** — Personalized AM/PM skincare routine based on your analysis
- **Progress Timeline** — Every analysis is saved; track how your style and skin evolve over time
- **AI Stylist Chat** — Streaming chat with a personal AI stylist that has context about your profile

### B2B Portal
- Client roster management
- Per-client analysis view
- PDF report generation
- Team management (via Clerk Organizations)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Clerk |
| Database | Supabase Postgres (via Prisma 7) |
| Storage | Supabase Storage (private buckets + signed URLs) |
| AI | OpenAI GPT-4o Vision (analysis) + `gpt-image-1` (visual try-on) |
| Animation | Framer Motion |
| Email | Resend |
| Analytics | PostHog |

---

## Project Structure

```
luxe-mirror/
├── app/
│   ├── (auth)/            # Sign-in, sign-up, onboarding
│   ├── (dashboard)/       # Main user dashboard + all features
│   ├── (business)/        # B2B portal (clients, team, reports)
│   ├── (marketing)/       # Landing page
│   └── api/               # API routes (analyze, wardrobe, chat, onboarding, profile)
├── components/
│   ├── analysis/          # Face analysis UI components
│   ├── wardrobe/          # Wardrobe analysis UI
│   ├── chat/              # AI stylist chat
│   └── shared/            # Sidebar, AccountMenu, StoredImage, etc.
├── lib/
│   ├── ai/                # GPT-4o analysis, wardrobe, chat, visual try-on
│   ├── db/                # Prisma + in-memory DB layer
│   └── utils/             # Photo URL signing, image helpers
├── prisma/
│   └── schema.prisma      # Database schema
└── supabase/
    └── migrations/        # RLS policies + storage bucket SQL
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Clerk](https://clerk.com) application
- An [OpenAI](https://platform.openai.com) API key with access to `gpt-4o` and `gpt-image-1`

### 1. Clone and install

```bash
git clone <repo-url>
cd luxe-mirror
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as above |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (Transaction pooler) |
| `DIRECT_URL` | Same page (Direct connection) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Same as above |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |

### 3. Apply database migrations

The schema and RLS policies are applied via Supabase MCP (see [MCP Setup](#mcp-setup)) or manually:

```bash
# Run the SQL files in Supabase SQL Editor in order:
# 1. supabase/migrations/001_rls_policies.sql
```

Prisma schema is in `prisma/schema.prisma` — tables were created directly via MCP migrations.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## MCP Setup (optional, for Cursor AI)

The app was built using Supabase and Clerk MCP servers in Cursor. To enable them, add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=<your-project-ref>&features=account,database,storage,docs"
    },
    "clerk": {
      "url": "https://mcp.clerk.com/mcp"
    }
  }
}
```

Authenticate each server in **Cursor Settings → Tools & MCP**.

---

## Feature Flags

These flags in `.env` control which services are active:

| Flag | Default | Effect when `false` |
|---|---|---|
| `DATABASE_ENABLED` | `true` | Uses in-memory store (no Supabase needed) |
| `STORAGE_ENABLED` | `true` | Photos stored as base64 data URLs |
| `VISUAL_PREVIEWS_ENABLED` | _(auto)_ | Set to `false` to skip AI image generation (faster) |

Set `DATABASE_ENABLED=false` and `STORAGE_ENABLED=false` for fully offline UI development without any external services.

---

## Architecture

```
Browser
  └─► Next.js App Router (proxy.ts — Clerk middleware)
        ├─► Server Components  ──► Prisma ──► Supabase Postgres
        ├─► API Routes         ──► OpenAI GPT-4o (analysis + chat)
        │                      ──► OpenAI gpt-image-1 (visual try-on)
        │                      ──► Supabase Storage (photo upload)
        └─► Client Components  ──► Clerk (auth UI)
```

### Storage flow

Photos are stored in private Supabase Storage buckets (`face-photos`, `wardrobe-photos`, `avatars`). The database saves a `supabase://bucket/path` reference. On read, the server generates a 24-hour signed URL before sending it to the client.

### Auth flow

1. User signs up via Clerk → redirected to `/onboarding`
2. Onboarding uploads selfie → GPT-4o runs analysis → profile saved in Supabase
3. Subsequent visits: Clerk session → dashboard (or onboarding if no profile)
4. All API routes verify Clerk session via `getAuthUserId()`
5. RLS policies on Supabase use the Clerk user ID from the JWT `sub` claim

---

## Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
npx prisma generate   # Regenerate Prisma client after schema changes
```

---

## Supabase Storage Buckets

| Bucket | Public | Max file size |
|---|---|---|
| `face-photos` | Private | 10 MB |
| `wardrobe-photos` | Private | 10 MB |
| `avatars` | Public read | 5 MB |

---

## License

Private — all rights reserved.
