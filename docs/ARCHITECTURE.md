# Leads Tracker architecture

Leads Tracker is a static Next.js application. It runs entirely in the browser:
the browser owns the lead data in `localStorage`; there is no API, server,
database, authentication, or cross-device synchronisation.

## Build rules

- Use the App Router with `output: 'export'`. Do not add API routes, server
  actions, middleware, or any other runtime-server dependency.
- Pages that read or write leads are client components. They call only the
  storage repository in `lib/`; React components must not access
  `localStorage` directly. Read storage only from browser effects or event
  handlers, never during module evaluation or the static render.
- Browser-created lead IDs use static URLs: `/leads/view?id=<id>` and
  `/leads/edit?id=<id>`. Do not use dynamic `[id]` route segments, whose values
  cannot be emitted by the static build.
- Treat the storage envelope as the single source of truth. All lead updates,
  stage moves, notes, and deletes go through repository functions so they are
  validated, timestamped, and persisted consistently.
- Store date-only values (`nextFollowUpDate`, `wonAt`, and activity
  `occurredOn`) as `YYYY-MM-DD` in the browser's local calendar. Never derive
  those values with UTC date serialization.
- Use `Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' })` for
  every displayed money value. CSV exports contain the raw decimal number, not
  a formatted currency string.
- Keep domain rules in pure `lib/` functions: validation, list query/sort,
  dashboard aggregation, CSV serialization, and date helpers. Components only
  render or invoke those functions.
- Export UTF-8 CSV with the fixed header order `Name,Company,Email,Phone,Source,
  Service,Estimated value,Stage,Next follow-up date,Notes,Created at,Updated at,
  Won at`. Escape commas, quotes, and line breaks with RFC 4180-style quoted
  cells; prefix a leading `=`, `+`, `-`, or `@` in textual cells with an
  apostrophe to prevent spreadsheet formula execution.
- Write unit tests from each story's Given/When/Then before the associated
  implementation. Playwright owns end-to-end flows and both 375px and 1280px
  viewport checks.

## Source layout

```text
app/                 routes and page composition
components/          reusable UI components
lib/                 types, storage repository, validation, formatting, queries,
                     aggregates, dates, CSV
__tests__/           unit/component tests
e2e/                 Playwright user journeys and responsive checks
```

## Shared storage contract

Use one versioned key: `leads-tracker:v1`.

```ts
type Stage = 'New' | 'Contacted' | 'Quoted' | 'Won' | 'Lost';
type Source = 'Website' | 'Referral' | 'LinkedIn' | 'WhatsApp' | 'Other';
type Service = 'Website' | 'Web app' | 'AI agent' | 'Other';

type Activity = {
  id: string;
  body: string;
  occurredOn: string; // local YYYY-MM-DD, shown to the user
  createdAt: string; // ISO timestamp, used for ordering
};
type Lead = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: Source;
  service: Service;
  estimatedValue: number;
  stage: Stage;
  nextFollowUpDate?: string;
  notes?: string; // editable lead memo; distinct from immutable activity entries
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
  wonAt?: string;
};
type StoredLeads = { version: 1; leads: Lead[] };
```

`createdAt` and `updatedAt` are ISO timestamps. `wonAt` is set to the local
date only when a lead transitions into `Won`, and is cleared when it transitions
out. The form Notes field is an editable lead memo, displayed separately from
the activity log. The repository creates activities with both an ISO timestamp
and local `occurredOn`; activities sort by `createdAt` descending, then `id`
descending.

An absent key loads an empty envelope. Malformed or unknown-version data is
preserved and returned as a recoverable storage error, never silently
overwritten. Writes replace the full validated envelope; tabs refresh their
view from the `storage` event, so the latest completed write wins.

## Routes

| Route | Responsibility |
| --- | --- |
| `/` | searchable, filterable, sortable lead list |
| `/leads/new` | create form |
| `/leads/view?id=<id>` | detail, activity log, delete |
| `/leads/edit?id=<id>` | edit form |
| `/board` | five-stage responsive pipeline board |
| `/dashboard` | derived pipeline statistics and follow-up list |

## Deferred

- The PRD's empty states, first-visit onboarding, and global default sort
  direction remain product decisions. Builders may use clear, conventional
  defaults without expanding the data contract.
- Deployment hosting is not selected. Any static-file host is valid so long as
  it serves the generated `out/` directory.
