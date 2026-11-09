# STORY-002: Pipeline Board
Ticket: — · Size: S · Data class: INTERNAL

## Why
The agency owner needs to see all leads at a glance, organized by their stage in the sales process, and quickly move leads from one stage to another. This is the primary workflow for managing a pipeline.

## Acceptance criteria

- Given leads exist in the system, When the user navigates to the board view, Then columns are displayed in this exact order: New, Contacted, Quoted, Won, Lost.
- Given leads in multiple stages, When the board renders, Then each column shows only leads belonging to that stage.
- Given a lead card in a column, Then the card displays: Name, Company, and value formatted as "AED 12,500.00".
- Given a lead card, When the user clicks "Move to" on the card, Then a dropdown menu appears with the 5 stage options: New, Contacted, Quoted, Won, Lost.
- Given a lead in New stage, When the user selects "Won" from the "Move to" menu, Then the lead moves to the Won column and its Stage is updated to "Won" in localStorage.
- Given a lead, When its stage is updated (via form or "Move to"), Then the change persists after a page reload.
- Given a lead's value is 12500, Then the card displays the value as "AED 12,500.00" (comma-formatted, 2 decimal places).
- Given the board view is open at 375px (mobile), Then all 5 columns are still visible (no sideways scrolling required).
- Given the board view is open at 1280px (desktop), Then the columns distribute evenly across the available width.
- Given no leads exist, When the board view is open, Then each column is present but empty (not hidden).

## Files likely to touch
- `app/board/page.tsx` (board page)
- `components/BoardColumn.tsx` (single column)
- `components/LeadCard.tsx` (lead card with "Move to" menu)
- `lib/leads.ts` (read/update)

## Out of scope
- Drag-and-drop between columns
- Reordering within a column
- Bulk moving multiple leads at once

## Test notes (edge cases QA must try)
- Verify "Move to" menu shows all 5 stages (including the current one, which should be disabled or marked)
- Move a Won lead back to New → verify it appears in the New column and dashboard updates
- Check AED formatting at edge values: 0 → "AED 0.00", 10000000 → "AED 10,000,000.00"
- Open on mobile viewport (375px) and scroll horizontally — verify no horizontal scroll
- Add a lead via the form, then switch to the board view — verify it appears in the New column
- Open board in two tabs with the same localStorage — each should show the same data after reload
