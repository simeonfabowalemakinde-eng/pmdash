# PMDASH

Operational guidance system for Product Managers, Product Owners, Delivery Managers, and coordination-heavy knowledge workers.

## Core Thesis

**Minimal operational input → maximum operational clarity**

PMDASH helps you answer: *"What should I focus on next?"*

## Features

- **Dashboard**: Calm operational overview with attention items and priorities
- **Roadmap**: Create and manage initiatives with status, dates, and related work
- **Work Tracker**: Lightweight PM delivery tracking (not a Jira replacement)
- **Knowledge Base**: Operational notes with AI summary inclusion controls
- **AI Updates**: Generate stakeholder summaries from real operational data
- **Command Bar**: Searchable operational commands and navigation
- **Settings**: Auth state, database health, user config

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key (for AI updates)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/simeonfabowalemakinde-eng/pmdash.git
   cd pmdash
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase and OpenAI keys
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Run migrations (see Database Setup below)
   - Enable email/password auth

5. Run the dev server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Setup

### Migrations

Run these SQL migrations in Supabase in order:

1. **Auth & User Tables**
   - See `supabase/migrations/001_auth_and_users.sql`

2. **Core Tables**
   - See `supabase/migrations/002_core_tables.sql`

3. **RLS Policies**
   - See `supabase/migrations/003_rls_policies.sql`

4. **AI & Feedback**
   - See `supabase/migrations/004_ai_and_feedback.sql`

### Demo Data

To seed demo data for testing:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url \
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
npx ts-node scripts/seed-demo.ts --email=tester@example.com
```

This will:
- Find the user with that email (must exist)
- Seed 5 initiatives, 18 work items, 12 notes
- Create a realistic PM scenario
- Safe to run multiple times (no uncontrolled duplication)

## Architecture

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Auth**: Supabase Auth (email/password)
- **Database**: PostgreSQL via Supabase
- **State**: Zustand
- **Styling**: Tailwind CSS (via Next.js defaults)
- **Testing**: Playwright
- **AI**: OpenAI API

### Project Structure

```
src/
├── app/              # Next.js app router
│   ├── auth/         # Auth pages (login, signup)
│   ├── dashboard/    # Dashboard
│   ├── roadmap/      # Initiatives
│   ├── work/         # Work items
│   ├── notes/        # Knowledge base
│   ├── updates/      # AI updates
│   └── settings/     # Settings
├── components/       # Reusable UI components
├── lib/              # Utilities
│   ├── supabase.ts   # Supabase client
│   ├── auth.ts       # Auth helpers
│   └── api-calls.ts  # API helpers
├── store/            # Zustand stores
└── types/            # TypeScript types
```

## Data Model

### Core Tables

**initiatives**
- id (uuid)
- user_id (uuid, FK → auth.users)
- name (text)
- summary (text)
- status (enum: planning, active, on_hold, completed, archived)
- target_date (date)
- external_key (text, optional)
- created_at (timestamp)
- updated_at (timestamp)

**work_items**
- id (uuid)
- user_id (uuid, FK → auth.users)
- initiative_id (uuid, FK → initiatives)
- title (text)
- description (text)
- status (enum: backlog, in_progress, blocked, completed, archived)
- priority (enum: low, medium, high, critical)
- source (text, e.g., "roadmap", "customer", "technical_debt")
- external_key (text, optional)
- due_date (date)
- created_at (timestamp)
- updated_at (timestamp)

**notes**
- id (uuid)
- user_id (uuid, FK → auth.users)
- initiative_id (uuid, FK → initiatives, nullable)
- work_item_id (uuid, FK → work_items, nullable)
- title (text)
- body (text)
- source (text)
- note_type (enum: general, meeting, stakeholder, decision, process, lesson_learned, blocker)
- include_in_ai_summary (boolean)
- created_at (timestamp)
- updated_at (timestamp)

**updates**
- id (uuid)
- user_id (uuid, FK → auth.users)
- initiative_id (uuid, FK → initiatives, nullable)
- work_item_id (uuid, FK → work_items, nullable)
- update_type (enum: manual, ai_generated)
- title (text)
- body (text)
- is_ai_generated (boolean)
- created_at (timestamp)
- updated_at (timestamp)

**ai_usage_events**
- id (uuid)
- user_id (uuid, FK → auth.users)
- action_type (text: "generate_update")
- status (enum: success, failed)
- model (text)
- prompt_tokens (int)
- completion_tokens (int)
- total_tokens (int)
- error_message (text, nullable)
- created_at (timestamp)

**feedback**
- id (uuid)
- user_id (uuid, FK → auth.users)
- category (text)
- message (text)
- page_context (text)
- created_at (timestamp)

### User Isolation

All tables enforce user_id ownership at the database level using PostgreSQL RLS policies. Users can only read/write their own records.

## AI Updates

### Allowance System

Each user has a lifetime AI allowance (default: 50 generations).

- Check allowance before generation
- Track successful and failed attempts
- Store token usage from OpenAI
- Display remaining allowance in settings

### Update Generation

AI updates are generated from:
- Real initiatives (status, dates, summaries)
- Real work items (status, priority, blockers)
- Real notes marked `include_in_ai_summary = true`

No fake data is generated or implied.

## Testing

### Smoke Tests

Run Playwright tests:

```bash
npm test
```

Tests verify:
- Auth redirects
- User ownership isolation
- AI allowance enforcement
- Feedback submission

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set environment variables in Vercel project settings.

## Brand & Design

PMDASH is:
- **Calm**: Minimal noise, focused clarity
- **Clear**: Obvious what needs attention
- **Low-noise**: No excessive dashboards
- **Operationally useful**: Real workflows supported
- **Not hype-heavy**: Honest about capabilities

## Feedback

See a bug or have a feature idea? File an issue or use the in-app feedback form.

## License

MIT
