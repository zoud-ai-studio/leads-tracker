# PRD: Leads Tracker

**Status:** Draft
**Author:** Product Manager (bmad-prd, headless)
**Created:** 2026-11-09
**Project:** Zoud AI Studio — Leads Tracker
**Repository:** zoud-ai-studio/leads-tracker

---

## 1. Overview

### 1.1 Goal (one sentence)
A private, browser-only app where the agency owner tracks leads from first contact to Won or Lost.

### 1.2 Target User
The agency owner of Zoud AI Studio, working on a laptop and on a phone.

### 1.3 Problem
The agency owner currently has no lightweight way to track sales leads without the overhead of a full CRM. They need something fast, simple, and available right in the browser.

### 1.4 Scope
Build a single-page app that stores all data in the browser's localStorage. No server, no database, no login. The owner manages everything from one browser.

### 1.5 Out of Scope
- Login / authentication
- Server or database
- Sync between devices
- Sending emails or WhatsApp messages
- Importing data from external sources
- Drag-and-drop on the board

---

## 2. Design

### 2.1 Visual Style
- White background, dark text `#172033`
- Accent color: `#2563EB` (blue)
- Won color: `#16A34A` (green)
- Lost color: `#DC2626` (red)
- System font stack
- Clean and simple

### 2.2 Typography & Content
- App title: **Leads Tracker**
- Subtitle: **Zoud AI Studio**
- Main call to action: **Add lead** button, visible on every screen

### 2.3 Money Formatting
Always display as: `AED 12,500.00`

---

## 3. Feature Requirements

### 3.1 FR-001: Lead Management (Add & Edit)
Users can create and edit a lead with the following fields:

| Field | Type | Constraints |
|-------|------|-------------|
| Name | text | Required, 1–500 characters |
| Company | text | Optional, 0–500 characters |
| Email | email | Optional, valid email format if provided |
| Phone | text | Optional, 0–500 characters |
| Source | select | Website, Referral, LinkedIn, WhatsApp, Other |
| Service | select | Website, Web app, AI agent, Other |
| Estimated value | number | 0 to 10,000,000, max 2 decimal places |
| Stage | select | New, Contacted, Quoted, Won, Lost |
| Next follow-up date | date | Optional |
| Notes | textarea | Optional, 0–500 characters |

Validation: invalid values block Save and show a clear inline error message.
Leaving a form with unsaved changes warns before discarding them.

### 3.2 FR-002: Pipeline Board
A Kanban-style board with one column per stage, in this order:

```
New | Contacted | Quoted | Won | Lost
```

Each lead card shows: Name, Company, value (AED).
Each card has a **Move to** dropdown menu to change its stage.
No drag-and-drop required.

### 3.3 FR-003: List View & Filtering
A list view of all leads with:
- **Search** by Name or Company (text match)
- **Filter** by Stage (New, Contacted, Quoted, Won, Lost) and Source (Website, Referral, LinkedIn, WhatsApp, Other)
- **Sort** by Next follow-up date, Estimated value, or Last updated (ascending/descending)

### 3.4 FR-004: Lead Detail & Activity Log
A per-lead detail page showing all fields plus an **Activity log**:
- Add a dated note for each lead
- Notes display newest first

### 3.5 FR-005: Dashboard
A dashboard page showing:
- **Leads per stage** — count of leads in each of the 5 stages
- **Open pipeline value** — sum of Estimated value for leads in New + Contacted + Quoted, shown in AED
- **Won this month** — sum of Estimated value for Won leads in the current month, in AED
- **Win rate** — Won / (Won + Lost) as a percentage
- **Follow up today** — list of leads whose follow-up date is today or earlier (local date, not UTC)

### 3.6 FR-006: Delete
Delete a lead only after a confirmation dialog.

### 3.7 FR-007: CSV Export
Export all leads to a CSV file with:
- A header row with field names
- One row per lead
- Values formatted consistently (AED values as numbers)

---

## 4. Non-Functional Requirements

### 4.1 Data Persistence
Leads, stages, and notes survive a page reload (localStorage).

### 4.2 Responsiveness
Every screen works at 375px (mobile) and 1280px (desktop) with no sideways scrolling. Every button is fully visible on both breakpoints.

### 4.3 Data Integrity
Long text (500+ characters) in names and notes must not break any layout.

### 4.4 Performance
The app should load and respond within 2 seconds on a typical laptop.

---

## 5. Technical Approach

- **Framework:** Next.js with static export (`output: 'export'`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (project defaults)
- **State / Storage:** localStorage via the browser (no server, no DB)
- **Testing:** Jest + React Testing Library for unit tests; Playwright for E2E

---

## 6. Acceptance Criteria (Summary)

1. Every screen works at 375px and 1280px with no sideways scrolling, and every button is visible.
2. An invalid value (empty name, wrong email format, value above 10,000,000 or with 3 decimals) blocks Save and shows a clear message.
3. Leaving a form with unsaved changes asks before throwing them away.
4. Leads, stages, and notes survive a page reload.
5. The dashboard totals match the leads exactly (test with at least 5 leads across all stages).
6. A follow-up date of today shows in "Follow up today" at 1 AM local time.
7. The CSV opens in a spreadsheet with one row per lead and correct AED values.
8. Very long names and notes (500+ characters) do not break any layout.

---

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| OQ-01 | Should "Won this month" filter by the won-date or the follow-up date? | Default assumption: won-date (the date the note "Won" was added). |
| OQ-02 | What timezone for "today"? | Default assumption: the user's local timezone (browser timezone), not UTC. |

---

## 8. TODO (to confirm with the Board)

| # | Item |
|---|------|
| T-01 | Empty-state texts (no leads yet message, no notes yet message) |
| T-02 | Help / onboarding text shown on first visit |
| T-03 | CSV column order and field names |
| T-04 | Sort direction default (ascending or descending) |

---

*This PRD maps to 4 stories in `docs/stories/`.*
