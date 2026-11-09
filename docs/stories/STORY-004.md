# STORY-004: Detail Page, Activity Log & Dashboard
Ticket: — · Size: M (two days) · Data class: INTERNAL

## Why
The agency owner needs to see a lead's full history, add notes, and view aggregate stats about the pipeline. The detail page gives depth on individual leads; the dashboard gives the big picture.

## Acceptance criteria

### Lead Detail Page
- Given a lead exists, When the user clicks on a lead from the board or list view, Then the lead detail page opens showing all fields: Name, Company, Email, Phone, Source, Service, Estimated value, Stage, Next follow-up date, Notes.
- Given the lead detail page, Then an "Edit" button opens the edit form for that lead.
- Given the lead detail page, Then a "Delete" button is visible.
- Given the user clicks "Delete" on a lead, Then a confirmation dialog appears asking: "Are you sure you want to delete this lead? This action cannot be undone."
- Given the confirmation dialog is open, When the user confirms "Delete", Then the lead is removed from localStorage, the list updates, and the user is redirected to the list view.
- Given the confirmation dialog is open, When the user cancels or dismisses, Then the lead is NOT deleted.

### Activity Log
- Given the lead detail page is open, Then an "Activity log" section is visible below the lead fields.
- Given a note exists for a lead, When the activity log is displayed, Then notes are shown with the newest first.
- Given the activity log is open, When the user types a note and clicks "Add note", Then a dated entry is created with the current date (local date) and the note text, and it appears at the top of the log.
- Given the note "Checked with client" is added, Then the activity entry shows a date (local date) and the text "Checked with client".
- Given multiple notes exist for a lead, Then sorting by date newest-first is correct even if notes were added in different sessions.

### Dashboard
- Given leads exist across stages, When the user navigates to the dashboard, Then "Leads per stage" shows the count for each of: New, Contacted, Quoted, Won, Lost.
- Given leads in New, Contacted, and Quoted stages with values 1000, 2000, 3000, Then the "Open pipeline value" shows "AED 6,000.00".
- Given Won leads in the current month total 5000 AED, Then "Won this month" shows "AED 5,000.00".
- Given 3 Won leads and 1 Lost lead (total 4 closed), Then "Win rate" shows "75%" (3 / 4 × 100).
- Given 0 Won and 1 Lost, Then "Win rate" shows "0%" (0 / 1 × 100).
- Given (Won + Lost) = 0, Then "Win rate" shows "—%" (no division by zero).
- Given a lead whose follow-up date is today's local date (not UTC), When the dashboard is opened, Then the lead appears in the "Follow up today" list even at 1 AM local time.
- Given a lead whose follow-up date is tomorrow, When the dashboard is opened, Then the lead does NOT appear in the "Follow up today" list.
- Given a lead whose follow-up date is yesterday, When the dashboard is opened, Then the lead DOES appear in the "Follow up today" list (it's past due).
- Given 5 leads across all stages, When the dashboard is loaded, Then all totals are correct: per-stage counts, open pipeline, won this month, win rate, and follow-up today list all match the leads data.

### Dashboard Layout
- Given the dashboard is open at 375px, Then all stat tiles fit the viewport with no sideways scrolling.
- Given the dashboard is open at 1280px, Then stat tiles are laid out in a responsive grid.
- Given the dashboard is open at 1280px, Then every button and tile is fully visible (no cropped or overlapping elements).

### Delete confirmation
- Given a lead has notes in its activity log, When the user confirms delete, Then both the lead and all its notes are deleted.

## Files likely to touch
- `app/leads/[id]/page.tsx` (detail page)
- `components/ActivityLog.tsx` (activity log + add note)
- `app/dashboard/page.tsx` (dashboard)
- `components/StatTile.tsx` (dashboard stat tile)
- `components/ConfirmDialog.tsx` (shared delete confirmation dialog)
- `lib/dashboard.ts` (dashboard aggregation logic)

## Out of scope
- Editing notes (add only)
- Marking a lead as won/lost from the detail page (use board Move to or form)
- Dashboard date range picker
- Downloading dashboard as image/PDF

## Test notes (edge cases QA must try)
- Delete a lead immediately after creating it → verify clean removal
- Add 3 notes with the same date (same session) → verify newest first still works
- Open "Follow up today" at a time when the follow-up date is today in UTC but tomorrow in another timezone → verify local date logic is correct
- Win rate with 0 closed leads (0 Won, 0 Lost) → show "—%" not "NaN%" or "0/0"
- Dashboard at 1 AM local time: a lead with follow-up date of today must show up
- Dashboard at 11:59 PM local time: a lead with follow-up date of today must still show up
- Value formatting: 0 → "AED 0.00", 999999.99 → "AED 999,999.99", 10000000 → "AED 10,000,000.00"
- Add 100 notes to a single lead → activity log still renders and newest-first is correct
