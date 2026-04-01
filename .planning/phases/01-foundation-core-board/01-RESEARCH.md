# Phase 1: Foundation & Core Board - Research

**Researched:** 2026-04-01
**Domain:** TanStack Start + Supabase (Auth, Postgres, Realtime) + Vercel deployment
**Confidence:** HIGH (core stack), MEDIUM (TanStack Start Vitest integration)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Display tasks as a **single scrollable list feed** (not card grid, not kanban columns).
**D-02:** Default sort order: **oldest first (FIFO queue)** — earliest unhandled tasks surface at the top.
**D-03:** Each list row shows: **client name, phone number, request type, and status badge** (the 4 fields staff need to act).
**D-04:** Completed (Done) tasks **stay visible but visually dimmed** — reduced opacity or subtle strikethrough. Not hidden, not auto-archived.
**D-05:** Create a **`staff` table** mirroring `auth.users`: columns `id` (UUID, FK to `auth.users.id`), `display_name` (TEXT), `email` (TEXT). Tasks reference `staff.id` for `created_by` and `last_updated_by`.
**D-06:** Use **Postgres enums** for `task_status` and `request_type`:
  - `CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'done');`
  - `CREATE TYPE request_type AS ENUM ('new_booking', 'change_time', 'change_therapist', 'other');`
  - TypeScript types generated from these via Supabase CLI.
**D-07:** Store preferred booking time as a **single `preferred_datetime TIMESTAMPTZ` column**, nullable (NULL = not specified / ASAP).
**D-08:** RLS policy for `tasks` table: **any authenticated staff can INSERT, UPDATE, DELETE any row** — flat team model, no ownership restrictions.
**D-09:** Login page: **minimal centered card** — app name/logo, email field, password field, submit button. No full-screen backgrounds.
**D-10:** After successful login: **redirect directly to the task board** (`/`). No intermediate welcome screen.
**D-11:** On session expiry: **redirect to `/login` with message** "Your session expired. Please sign in again." — triggers on next auth-required action.
**D-12:** Login error message: **generic** — "Invalid email or password" (does not confirm whether email exists).
**D-13:** Sign out: **top-right avatar/initials icon → dropdown → Sign Out**. Not an always-visible button.

### Claude's Discretion

- Task form layout details (field ordering, modal vs inline positioning) — planner decides based on conventions
- Empty state for the board when no tasks exist — planner designs
- Loading skeleton vs spinner while fetching tasks — planner decides
- Exact Tailwind color tokens for status badges (use semantic naming from CONVENTIONS.md)
- Task edit interaction (in-place edit vs dedicated edit view) — planner decides, must be mobile-friendly

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 1 scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Staff can sign in with email and password | Supabase Auth `signInWithPassword`, `@supabase/ssr` cookie sessions |
| AUTH-02 | Session persists across browser refresh and app reopen | `@supabase/ssr` cookie-based session; PKCE flow auto-configured |
| AUTH-03 | Protected routes redirect unauthenticated users to login | TanStack Router `beforeLoad` + `throw redirect('/login')` in `_auth.tsx` layout route |
| TASK-01 | Create task via manual form with all fields | `createServerFn` POST handler + Zod schema validation; `react-hook-form` with `zodResolver` |
| TASK-02 | Request type: New Booking, Change Time, Change Therapist, Other | Postgres enum `request_type`; TypeScript `const` object from generated types |
| TASK-03 | Task board shows all open tasks shared across all staff | Route loader fetches tasks server-side; Supabase `.select()` with explicit columns ordered by `created_at` ASC |
| TASK-04 | Status transitions: Open → In Progress → Done | `createServerFn` PATCH handler; Postgres enum `task_status` enforces valid values |
| TASK-05 | Staff can edit a task after creation | Edit form (same fields as create); `createServerFn` UPDATE handler |
| TASK-06 | Staff can delete or archive a task | `createServerFn` DELETE handler; RLS policy permits all authenticated staff |
| TASK-07 | Task shows last updated by + timestamp | `last_updated_by` FK to `staff.id`, `updated_at` TIMESTAMPTZ; join `staff` table for display_name |
| TASK-08 | Form validates required fields (client name, phone) | Zod schema: `client_name: z.string().min(1)`, `phone: z.string().min(1)`; field-level error messages via react-hook-form |
| RT-01 | Task board updates in real time without page refresh | Supabase Realtime `postgres_changes` channel; `useEffect` with cleanup |
| RT-02 | New tasks appear instantly on all connected sessions | INSERT event on `tasks:all` channel triggers local state update |

</phase_requirements>

---

## Summary

Phase 1 is a greenfield build targeting a fully working shared task board. The stack is locked: TanStack Start 1.x (Vite-based, file-based routing, `createServerFn`), Supabase (Postgres + Auth + Realtime), Tailwind CSS, Vercel deployment via Nitro preset. No source code exists yet — the entire project must be scaffolded from scratch.

The primary technical risk is TanStack Start scaffolding: the framework recently migrated from Vinxi to a Vite plugin model, eliminating the old `app.config.ts` file in favor of a `vite.config.ts` that imports `tanstackStart` from `@tanstack/react-start/plugin/vite`. Vercel deployment now uses a Nitro preset (`server: { preset: 'vercel' }`) rather than a separate adapter package. These are breaking changes from pre-1.0 documentation — any tutorial older than late 2025 will be incorrect.

Supabase integration is straightforward: `@supabase/ssr` handles cookie-based session management for SSR, `@supabase/supabase-js` covers database queries and Realtime subscriptions, and the Supabase CLI generates typed `database.types.ts` from the schema. The key operational step for Realtime is enabling the `tasks` table in the `supabase_realtime` publication — without this toggle, `postgres_changes` events will not fire.

**Primary recommendation:** Scaffold with `@tanstack/react-start` 1.167.x + Nitro Vercel preset, provision Supabase project immediately for type generation, use `@supabase/ssr` for session cookies, and `react-hook-form` + `@hookform/resolvers` with Zod for form validation.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-start` | 1.167.16 | Full-stack React framework (routing, SSR, server functions) | Project decision; Vite-based, type-safe `createServerFn` |
| `@tanstack/react-router` | 1.168.10 | File-based routing (bundled with react-start) | Included as dependency; powers all routing |
| `@supabase/supabase-js` | 2.101.1 | Supabase client: DB queries, Auth, Realtime | Project decision; single client for all Supabase services |
| `@supabase/ssr` | 0.10.0 | Cookie-based session for SSR | Required for session persistence in SSR (AUTH-02) |
| `tailwindcss` | 4.2.2 | Utility-first CSS | Project decision; mobile-first responsive layout |
| `zod` | 4.3.6 | Schema validation (server + client) | TypeScript-first; used for `createServerFn` input and form validation |
| `react-hook-form` | 7.72.0 | Form state management | Low re-render, uncontrolled inputs; pairs with zodResolver |
| `@hookform/resolvers` | 5.2.2 | Bridge between react-hook-form and Zod | Required to use Zod schemas with react-hook-form |
| `nitro` | 3.0.x (beta) | Deployment adapter abstraction | Required for Vercel preset (replaces tanstack-start-server-fn-vercel) |
| `clsx` | 2.1.1 | Conditional class merging | CONVENTIONS.md prescribes `cn()` utility |
| `tailwind-merge` | 3.5.0 | Merges conflicting Tailwind classes | Part of `cn()` utility pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tanstack/zod-adapter` | 1.166.9 | Connects Zod schemas to `createServerFn` `.inputValidator()` | Use when Zod schema is passed to server function validator |
| `vitest` | 4.1.2 | Unit testing | Phase 1 testing layer; works with Vite config |
| `@testing-library/react` | 16.3.2 | Component testing | DOM-based component tests |
| `@vitejs/plugin-react` | latest | React refresh in Vite | Required in `vite.config.ts` (after tanstackStart) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-hook-form` | `@tanstack/react-form` | TanStack Form is tighter in the ecosystem but less mature; react-hook-form has broader community patterns |
| `nitro` Vercel preset | Vercel's `@vercel/nft` approach | Nitro is the TanStack-recommended path; no alternative currently documented |
| `@supabase/ssr` | Manual cookie handling | `@supabase/ssr` is the official Supabase solution; manual handling risks session bugs |

**Installation:**
```bash
npm create tsrouter-app@latest maison-plan -- --framework react --template start-bare
# Then add:
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod @tanstack/zod-adapter
npm install clsx tailwind-merge
npm install nitro
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Version verification (confirmed 2026-04-01):**
```
@tanstack/react-start:   1.167.16  (published 2026-03-30)
@tanstack/react-router:  1.168.10
@supabase/supabase-js:   2.101.1
@supabase/ssr:           0.10.0
zod:                     4.3.6
tailwindcss:             4.2.2
react-hook-form:         7.72.0
@hookform/resolvers:     5.2.2
clsx:                    2.1.1
tailwind-merge:          3.5.0
vitest:                  4.1.2
```

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── routes/
│   ├── __root.tsx           # Root layout: <html>, <head>, <Scripts>
│   ├── _auth.tsx            # Pathless layout route: auth guard (beforeLoad)
│   ├── _auth/
│   │   └── index.tsx        # Task board (protected, mounted at /)
│   └── login.tsx            # Login page (public)
├── components/
│   ├── TaskBoard.tsx        # Board list container + realtime subscription
│   ├── TaskRow.tsx          # Single row: name, phone, request type, status
│   ├── TaskForm.tsx         # Create/edit form (shared)
│   ├── StatusBadge.tsx      # Status pill with semantic color
│   └── UserMenu.tsx         # Avatar/initials + dropdown (sign out)
├── server/
│   ├── tasks.ts             # createServerFn: createTask, updateTask, deleteTask
│   └── auth.ts              # createServerFn: getCurrentUser
├── lib/
│   ├── supabase.client.ts   # createBrowserClient<Database>
│   ├── supabase.server.ts   # createServerClient<Database>
│   ├── database.types.ts    # Generated by Supabase CLI
│   └── utils.ts             # cn() utility
├── styles/
│   └── globals.css          # Global resets + Tailwind @layer
supabase/
├── migrations/
│   └── 0001_initial.sql     # Enums, tables, RLS policies, trigger
└── seed.sql                 # Dev seed data (optional)
vite.config.ts               # tanstackStart + nitro + viteReact
tailwind.config.ts           # Semantic color tokens
tsconfig.json                # strict: true, ~ path alias
```

### Pattern 1: TanStack Start Vite Config (current approach)
**What:** Single `vite.config.ts` replaces the old `app.config.ts` (Vinxi era). `tanstackStart()` MUST come before `viteReact()`.
**When to use:** All TanStack Start 1.x projects.
```typescript
// vite.config.ts
// Source: https://vercel.com/docs/frameworks/full-stack/tanstack-start
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [tanstackStart(), nitro(), viteReact()],
})
```

For Vercel deployment, set Nitro preset in `app.config` or via tanstackStart config:
```typescript
// app.config.ts (TanStack Start config layer, NOT the old Vinxi one)
// Source: https://tanstack.com/blog/why-tanstack-start-is-ditching-adapters
import { defineConfig } from '@tanstack/react-start/config'

export default defineConfig({
  server: {
    preset: 'vercel',
  },
})
```

### Pattern 2: Root Route
**What:** `__root.tsx` renders the full HTML document shell.
**When to use:** Every TanStack Start project — exactly one root route.
```typescript
// app/routes/__root.tsx
// Source: WebSearch verified against official TanStack Start docs
import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '~/styles/globals.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="ko">
      <head><HeadContent /></head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

### Pattern 3: Protected Layout Route
**What:** `_auth.tsx` is a pathless layout route that wraps all protected pages. `beforeLoad` checks session and throws `redirect` if unauthenticated.
**When to use:** AUTH-03 requirement.
```typescript
// app/routes/_auth.tsx
// Source: TanStack Router authenticated routes docs + Supabase SSR
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSupabaseServerClient } from '~/lib/supabase.server'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const supabase = getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
  component: () => <Outlet />,
})
```

### Pattern 4: createServerFn with Zod Validation
**What:** Type-safe RPC from client to server. Input validated with Zod via `@tanstack/zod-adapter`.
**When to use:** All task mutations (TASK-01, TASK-04, TASK-05, TASK-06).
```typescript
// app/server/tasks.ts
// Source: WebSearch verified against TanStack Start server functions docs
import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { getSupabaseServerClient } from '~/lib/supabase.server'

const createTaskSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  service: z.string().optional(),
  preferred_datetime: z.string().datetime().nullable().optional(),
  notes: z.string().optional(),
  request_type: z.enum(['new_booking', 'change_time', 'change_therapist', 'other']),
})

export const createTask = createServerFn({ method: 'POST' })
  .validator(zodValidator(createTaskSchema))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ ...data })
      .select('id, client_name, status, created_at')
      .single()
    if (error) throw new Error(error.message)
    return task
  })
```

### Pattern 5: Supabase Realtime Subscription
**What:** Subscribe to all change events on `tasks` table; update local state without re-fetching.
**When to use:** RT-01, RT-02.
```typescript
// Inside TaskBoard component
// Source: CONVENTIONS.md prescribed pattern + Supabase docs
import { useEffect, useState } from 'react'
import { supabaseBrowserClient } from '~/lib/supabase.client'
import type { Task } from '~/lib/database.types'

function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)

  useEffect(() => {
    const channel = supabaseBrowserClient
      .channel('tasks:all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new as Task])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => { supabaseBrowserClient.removeChannel(channel) }
  }, [])

  // render tasks sorted by created_at ASC (FIFO — D-02)
}
```

### Pattern 6: Auth Trigger for Staff Table
**What:** Postgres function + trigger that auto-inserts into `staff` when a user signs up via Supabase Auth.
**When to use:** D-05 (staff table), one-time migration setup.
```sql
-- supabase/migrations/0001_initial.sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.staff (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Pattern 7: react-hook-form with Zod
**What:** Client-side form validation with field-level error display.
**When to use:** Task creation form (TASK-01, TASK-08) and edit form (TASK-05).
```typescript
// Source: react-hook-form docs + @hookform/resolvers docs
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  phone: z.string().min(1, 'Phone is required'),
  // ... other fields
})

type FormData = z.infer<typeof schema>

function TaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await createTask({ data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('client_name')} />
      {errors.client_name && <p className="text-red-500 text-sm">{errors.client_name.message}</p>}
    </form>
  )
}
```

### Anti-Patterns to Avoid

- **Using `app.config.ts` (Vinxi era):** The old TanStack Start used Vinxi and `app.config.ts`. Version 1.x uses `vite.config.ts` with the `tanstackStart()` plugin. Any scaffolding guide referencing Vinxi is outdated.
- **Using `createServerFn('POST', async (input) => {...})` signature:** Old API. New API is `createServerFn({ method: 'POST' }).validator(...).handler(...)`.
- **`select('*')` in queries:** CONVENTIONS.md prohibits this. Always list explicit columns.
- **Importing `supabase.server.ts` in client components:** Server client holds service role key. Use `supabase.client.ts` in browser code only.
- **Subscribing to Realtime without cleanup:** Every `useEffect` subscription MUST return `() => { supabase.removeChannel(channel) }`.
- **Subscribing to `postgres_changes` without enabling table publication:** The `tasks` table must be added to `supabase_realtime` publication or events will not arrive.
- **`position: fixed` inside scrollable containers:** iOS Safari bug. Described in CONVENTIONS.md iOS constraints.
- **Using TypeScript `enum`:** CONVENTIONS.md prescribes `const` object + `as const` pattern instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie session management in SSR | Custom cookie parsing/setting | `@supabase/ssr` `createServerClient` / `createBrowserClient` | Session refresh, PKCE, secure httpOnly handling — complex to get right |
| Form state and validation | Custom `useState` + manual error tracking | `react-hook-form` + `zodValidator` | Uncontrolled input performance, nested error paths, dirty/touched state |
| Zod validation on server functions | Manual `schema.parse()` in handler body | `.validator(zodValidator(schema))` on `createServerFn` | Type inference flows through to handler `data`; errors surface automatically |
| TypeScript types for DB | Manual type definitions | `supabase gen types typescript` CLI | Types stay in sync with schema; enum types, nullable columns, FK shapes all auto-generated |
| Conditional Tailwind class merging | String concatenation | `cn()` from `clsx` + `tailwind-merge` | Handles conflicting classes (e.g., `p-2` vs `p-4`); `tailwind-merge` prevents bloat |
| Route protection middleware | Wrapping every route component | Pathless `_auth.tsx` layout route with `beforeLoad` | One location enforces auth for all child routes; no per-route boilerplate |

**Key insight:** Supabase's SSR session handling has significant complexity around cookie refresh timing and PKCE. `@supabase/ssr` encapsulates this entirely — a custom implementation will have subtle auth bugs (AUTH-02).

---

## Common Pitfalls

### Pitfall 1: Outdated TanStack Start Documentation
**What goes wrong:** Guides from 2024/early 2025 show `app.config.ts` with `defineConfig` from `@tanstack/start` (Vinxi-based). Using this pattern will fail in 1.x.
**Why it happens:** Framework migrated from Vinxi to Vite plugin architecture between beta and 1.0.
**How to avoid:** Use `vite.config.ts` with `tanstackStart()` from `@tanstack/react-start/plugin/vite`. Plugin order is critical: `tanstackStart()` before `viteReact()`.
**Warning signs:** `Cannot find module 'vinxi'`, build fails, routes not recognized.

### Pitfall 2: `createServerFn` Old API Signature
**What goes wrong:** Old API: `createServerFn('POST', async (input: unknown) => {...})`. New API uses method chaining: `.validator().handler()`.
**Why it happens:** Breaking change between beta and 1.0.
**How to avoid:** Always use `createServerFn({ method: 'POST' }).validator(zodValidator(schema)).handler(async ({ data }) => {...})`.
**Warning signs:** TypeScript type errors on `createServerFn` call, `data` not typed.

### Pitfall 3: Realtime Events Not Firing
**What goes wrong:** `postgres_changes` subscription set up correctly in code but events never arrive.
**Why it happens:** The `tasks` table is not added to the `supabase_realtime` Postgres publication. This step is done in Supabase Dashboard → Database → Replication → supabase_realtime (or via SQL).
**How to avoid:** In the initial migration, include: `alter publication supabase_realtime add table tasks;`
**Warning signs:** Subscription confirms connected (`.subscribe()` callback fires) but no change events received.

### Pitfall 4: SSR Hydration Mismatch with Auth State
**What goes wrong:** Server renders one auth state; client hydrates with different state, causing React hydration errors or flash of unauthenticated content.
**Why it happens:** Browser localStorage vs cookie mismatch; `@supabase/ssr` client not used on server.
**How to avoid:** Use `createServerClient` (from `@supabase/ssr`) in route loaders/beforeLoad; use `createBrowserClient` in client components. Never mix them. Pass authenticated user via route context, not client-only state.
**Warning signs:** "Hydration failed" console error, brief flash of login page on protected routes.

### Pitfall 5: Supabase Trigger Blocking Signups
**What goes wrong:** Auth trigger (`handle_new_user`) throws an error — all user signups fail silently or with a generic error.
**Why it happens:** Trigger runs `SECURITY DEFINER` — if the function errors (e.g., duplicate key, missing column), the entire `auth.users` INSERT transaction rolls back.
**How to avoid:** Add exception handling in the trigger function. Test the trigger SQL against the exact schema before deploying. Seed initial staff accounts carefully.
**Warning signs:** Supabase Auth signup returns success but no user appears in `auth.users` or `staff`.

### Pitfall 6: Missing Explicit Column Select
**What goes wrong:** `supabase.from('tasks').select('*')` returns all columns including future ones; breaks TypeScript inference when schema evolves.
**Why it happens:** Convenience habit.
**How to avoid:** CONVENTIONS.md mandates explicit column lists: `.select('id, client_name, phone, status, request_type, created_at, updated_at, last_updated_by')`.
**Warning signs:** TypeScript types become `any` on returned data; schema drift not detected.

### Pitfall 7: Vitest Plugin Conflict with TanStack Start
**What goes wrong:** `tanstackStart()` Vite plugin applies `optimizeDeps` configuration unconditionally, including in Vitest's test environment, causing React to resolve as `null` during tests.
**Why it happens:** Known issue with TanStack Start's Vite plugin and Vitest.
**How to avoid:** Conditionally disable the plugin in test environment:
```typescript
// vite.config.ts
plugins: [
  process.env.VITEST !== 'true' && tanstackStart(),
  nitro(),
  viteReact(),
].filter(Boolean)
```
**Warning signs:** `Cannot read properties of null (reading 'useState')` in test runs.

### Pitfall 8: iOS Safari 44px Touch Target Violations
**What goes wrong:** Staff on mobile can't reliably tap status buttons or task rows.
**Why it happens:** Default button/link sizes are smaller than 44x44px.
**How to avoid:** CONVENTIONS.md mandates `min-h-[44px] min-w-[44px]` on all interactive elements. Status badge must be a tappable button meeting this minimum.
**Warning signs:** Tap requires multiple attempts on iPhone; usability testing fails.

---

## Code Examples

### Database Migration (complete initial schema)
```sql
-- supabase/migrations/0001_initial.sql

-- Enums (D-06)
create type task_status as enum ('open', 'in_progress', 'done');
create type request_type as enum ('new_booking', 'change_time', 'change_therapist', 'other');

-- Staff table (D-05)
create table public.staff (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  display_name text not null,
  created_at  timestamptz not null default now()
);

alter table public.staff enable row level security;
create policy "staff can read all staff"
  on public.staff for select
  to authenticated
  using (true);

-- Tasks table
create table public.tasks (
  id                 uuid primary key default gen_random_uuid(),
  client_name        text not null,
  phone              text not null,
  service            text,
  preferred_datetime timestamptz,            -- D-07: nullable = ASAP
  notes              text,
  request_type       request_type not null,
  status             task_status not null default 'open',
  created_by         uuid not null references public.staff(id),
  last_updated_by    uuid not null references public.staff(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.tasks enable row level security;

-- D-08: flat team model — any authenticated staff can do anything
create policy "authenticated staff can select tasks"
  on public.tasks for select to authenticated using (true);
create policy "authenticated staff can insert tasks"
  on public.tasks for insert to authenticated with check (true);
create policy "authenticated staff can update tasks"
  on public.tasks for update to authenticated using (true);
create policy "authenticated staff can delete tasks"
  on public.tasks for delete to authenticated using (true);

-- Enable realtime
alter publication supabase_realtime add table tasks;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure update_updated_at();

-- Auto-create staff record on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.staff (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Supabase Client Setup
```typescript
// app/lib/supabase.client.ts
// Source: @supabase/ssr docs
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export const supabaseBrowserClient = createBrowserClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

```typescript
// app/lib/supabase.server.ts
// Source: @supabase/ssr docs — server-side with cookie handling
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import type { Database } from './database.types'

export function getSupabaseServerClient(requestHeaders?: Headers) {
  const cookies = parseCookieHeader(requestHeaders?.get('cookie') ?? '')
  return createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookies,
        setAll: () => {}, // headers set at response layer
      },
    }
  )
}
```

### TypeScript Enum Pattern (CONVENTIONS.md)
```typescript
// app/lib/constants.ts
export const TASK_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS]

export const REQUEST_TYPE = {
  NEW_BOOKING: 'new_booking',
  CHANGE_TIME: 'change_time',
  CHANGE_THERAPIST: 'change_therapist',
  OTHER: 'other',
} as const
export type RequestType = typeof REQUEST_TYPE[keyof typeof REQUEST_TYPE]
```

### cn() Utility
```typescript
// app/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Type Generation Command
```bash
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" > app/lib/database.types.ts
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `app.config.ts` + Vinxi | `vite.config.ts` + `tanstackStart()` Vite plugin | TanStack Start 1.0 (late 2025) | All old setup guides are wrong — must use new Vite plugin approach |
| `createServerFn('POST', handler)` | `createServerFn({ method }).validator().handler()` | TanStack Start 1.0 | Breaking API change; chained builder pattern |
| TanStack Start adapter packages (e.g., `@tanstack/start-server-fn-vercel`) | Nitro preset (`server: { preset: 'vercel' }`) | TanStack Start 1.0 | Single `nitro` package replaces per-platform adapters |
| `@supabase/auth-helpers-*` | `@supabase/ssr` | ~2024 | Auth helpers deprecated; `@supabase/ssr` is the current package for SSR session management |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`, `@supabase/auth-helpers-react`: Replaced by `@supabase/ssr`
- Vinxi-based `app.config.ts`: Replaced by Vite plugin in TanStack Start 1.x
- `createServerFn` string signature: Replaced by builder pattern

---

## Open Questions

1. **`@supabase/ssr` cookie integration with TanStack Start request context**
   - What we know: `@supabase/ssr` requires access to request headers (for `getAll`) and response headers (for `setAll`) to manage session cookies.
   - What's unclear: The exact mechanism for accessing TanStack Start's request/response headers inside `createServerFn` handlers and route loaders. TanStack Start provides `getHeaders()` / `setHeader()` from `@tanstack/react-start/server` for this purpose.
   - Recommendation: Planner should include a task for implementing and testing the server client cookie wiring before auth-dependent tasks.

2. **Supabase CLI availability on dev machine**
   - What we know: `supabase` CLI is not currently in PATH on the developer machine (verified 2026-04-01). It is available via `npx supabase`.
   - What's unclear: Whether local Supabase stack (Docker-based) should be used for development or if the remote Supabase project should be used directly.
   - Recommendation: Use remote Supabase project for Phase 1 simplicity (`npx supabase gen types` still works against remote project). Install CLI globally if local dev becomes needed.

3. **Nitro beta stability for production**
   - What we know: `nitro` package is at `3.0.x-beta` on npm. TanStack Start's official docs and Vercel's docs both reference Nitro as the deployment approach.
   - What's unclear: Whether the beta designation indicates instability for production use.
   - Recommendation: Use the latest `nitro` beta as directed by official docs — both TanStack and Vercel documentation prescribe this approach, and it is in active production use.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | TanStack Start, npm, all tooling | Yes | v25.2.1 | — |
| npm | Package management | Yes | 11.6.2 | pnpm (also available) |
| pnpm | Alternative package manager | Yes | 8.13.1 | npm |
| npx | Running CLI tools (supabase, create-tsrouter-app) | Yes | (via npm) | — |
| Supabase CLI (global) | `supabase gen types`, migrations | No | — | `npx supabase` works without global install |
| Docker | Supabase local dev stack | Not checked | — | Use remote Supabase project for Phase 1 |
| Git | Version control | Yes (repo exists) | — | — |

**Missing dependencies with no fallback:**
- None that block execution.

**Missing dependencies with fallback:**
- `supabase` CLI (global): Use `npx supabase` for all CLI commands. Functionally equivalent.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vitest.config.ts` (Wave 0 — does not exist yet) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | `signInWithPassword` called with credentials; session set on success | integration (manual smoke test against Supabase) | `npx vitest run tests/auth.test.ts` | Wave 0 |
| AUTH-02 | Session cookie persists across page reload | manual-only (browser behavior) | — | N/A |
| AUTH-03 | `beforeLoad` on `_auth.tsx` redirects unauthenticated user to `/login` | unit | `npx vitest run tests/routes/auth.test.ts` | Wave 0 |
| TASK-01 | `createTask` server fn inserts row; returns task id | unit (mock Supabase) | `npx vitest run tests/server/tasks.test.ts` | Wave 0 |
| TASK-02 | Request type enum rejects invalid values | unit | included in TASK-01 test file | Wave 0 |
| TASK-03 | Task board renders rows sorted by created_at ASC | unit (component) | `npx vitest run tests/components/TaskBoard.test.tsx` | Wave 0 |
| TASK-04 | `updateTaskStatus` transitions to valid status; rejects invalid | unit | `npx vitest run tests/server/tasks.test.ts` | Wave 0 |
| TASK-05 | `updateTask` server fn updates all fields | unit | included in TASK-01 test file | Wave 0 |
| TASK-06 | `deleteTask` server fn removes row | unit | included in TASK-01 test file | Wave 0 |
| TASK-07 | Task row displays `staff.display_name` for last_updated_by | unit (component) | `npx vitest run tests/components/TaskRow.test.tsx` | Wave 0 |
| TASK-08 | Form shows field error when client_name or phone is empty | unit (component) | `npx vitest run tests/components/TaskForm.test.tsx` | Wave 0 |
| RT-01 | Realtime channel subscribed on mount; removed on unmount | unit (component, mock channel) | included in TaskBoard test | Wave 0 |
| RT-02 | INSERT event updates task list without refetch | unit (component, mock channel) | included in TaskBoard test | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose tests/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — configure `jsdom` environment, `tanstackStart` plugin disabled in tests, setupFiles
- [ ] `tests/setup.ts` — `@testing-library/jest-dom` import
- [ ] `tests/server/tasks.test.ts` — covers TASK-01, TASK-02, TASK-04, TASK-05, TASK-06
- [ ] `tests/routes/auth.test.ts` — covers AUTH-03
- [ ] `tests/components/TaskBoard.test.tsx` — covers TASK-03, RT-01, RT-02
- [ ] `tests/components/TaskRow.test.tsx` — covers TASK-07
- [ ] `tests/components/TaskForm.test.tsx` — covers TASK-08
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` — if not yet installed

---

## Sources

### Primary (HIGH confidence)
- `npm view @tanstack/react-start` — version 1.167.16, published 2026-03-30 (verified live)
- `npm view @supabase/supabase-js` — version 2.101.1 (verified live)
- `npm view @supabase/ssr` — version 0.10.0 (verified live)
- `npm view zod`, `react-hook-form`, `@hookform/resolvers`, `tailwindcss`, `clsx`, `tailwind-merge`, `vitest`, `@testing-library/react` — all versions verified live 2026-04-01
- [TanStack Start on Vercel](https://vercel.com/docs/frameworks/full-stack/tanstack-start) — Nitro config for Vercel deployment
- [Why TanStack Start is Ditching Adapters](https://tanstack.com/blog/why-tanstack-start-is-ditching-adapters) — Nitro preset approach, `server: { preset: 'vercel' }` config
- `.planning/codebase/CONVENTIONS.md` — all naming, Supabase, Tailwind, and error handling patterns

### Secondary (MEDIUM confidence)
- [TanStack Router — Authenticated Routes](https://tanstack.com/router/v1/docs/framework/react/guide/authenticated-routes) — `beforeLoad` redirect pattern
- WebSearch results for `createServerFn` new builder API — multiple sources agree on `.validator().handler()` pattern; consistent with official docs URL
- WebSearch for Supabase RLS separate-policy-per-operation requirement — consistent with official Supabase RLS docs
- WebSearch for Supabase Realtime publication requirement — aligns with official Supabase Realtime docs
- Supabase auth trigger pattern — multiple consistent community examples matching official guidance

### Tertiary (LOW confidence)
- Vitest plugin conflict workaround (`process.env.VITEST !== 'true'`) — from GitHub issue #6246; single source but specific and recent. Flag for validation during Wave 0 test setup.
- `nitro` beta stability assessment — inferred from official TanStack/Vercel docs prescribing it; beta label not further explained.

---

## Project Constraints (from CONVENTIONS.md)

All downstream planning and implementation MUST follow these conventions:

1. **File naming:** Routes in `app/routes/` (file-based); PascalCase components; camelCase utilities with `.types.ts` suffix for type files.
2. **Functions:** `createServerFn` server functions are verb-noun camelCase; React components PascalCase; event handlers `handle` prefix.
3. **TypeScript:** `strict: true` enforced; no `as` assertions except with comment; no explicit `any`.
4. **Enums:** Use `const` object + `as const`, not TypeScript `enum`.
5. **Imports:** `~` alias for `app/`; import order: builtins → external → internal (`~/`) → relative → type-only imports last.
6. **Supabase:** Browser client in `app/lib/supabase.client.ts`; server client in `app/lib/supabase.server.ts`; never import server client from client code.
7. **Queries:** Never `select('*')`; always explicit column lists; always handle `error` return.
8. **Realtime:** Channel `tasks:all`; useEffect with `supabase.removeChannel(channel)` cleanup.
9. **Styling:** Utility-first Tailwind; `cn()` for conditional classes; no custom CSS files except `globals.css`; semantic color tokens in `tailwind.config.ts`.
10. **Touch targets:** Minimum 44x44px on all interactive elements (`min-h-[44px] min-w-[44px]`).
11. **iOS Safari:** No `position: fixed` inside scrollable containers; no hover-only interaction affordances.
12. **Error handling:** Field-level errors next to inputs (not banner-only); server errors to error boundaries; no stack traces to client.
13. **Logging:** No `console.log` in committed code; `console.error` for caught errors only; structured server logs.
14. **Formatting:** Prettier with single quotes, trailing commas `all`, 100-char width, 2-space indent.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified live against npm registry (2026-04-01)
- Architecture: HIGH — based on locked CONTEXT.md decisions + CONVENTIONS.md + verified official docs
- TanStack Start scaffolding: HIGH — verified via official Vercel docs and TanStack blog (post-Vinxi migration)
- Realtime: HIGH — Supabase pattern well-documented; publication requirement is a known gotcha now documented
- Vitest/testing: MEDIUM — plugin conflict workaround is single-source (GitHub issue); test file structure is inferred from patterns, not official TanStack testing guide

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable stack), MEDIUM-risk areas (Nitro beta, Vitest workaround) should be re-verified if plan execution is delayed beyond 2 weeks
