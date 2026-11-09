# STORY-003: List View, Search & Filter
Ticket: — · Size: S · Data class: INTERNAL

## Why
The agency owner needs to find specific leads quickly. Searching by name or company, filtering by stage and source, and sorting by follow-up date, value, or last updated are essential for managing a growing pipeline.

## Acceptance criteria

- Given the list view is opened with leads in the system, Then all leads are displayed as rows in a table or list.
- Given the list view is open and the user types "Acme" in the search box, Then only leads whose Name or Company contains "Acme" (case-insensitive) are displayed.
- Given the list view is open and the user selects "Won" from the Stage filter, Then only leads in the Won stage are displayed.
- Given the list view is open and the user selects "LinkedIn" from the Source filter, Then only leads from LinkedIn are displayed.
- Given stage and source filters are both applied, Then only leads matching both filters are displayed.
- Given leads are shown and the user clicks the "Next follow-up date" sort header, Then leads are sorted by follow-up date ascending (earliest first).
- Given leads are shown and the user clicks the "Estimated value" sort header, Then leads are sorted by value descending (highest first).
- Given leads are shown and the user clicks the "Last updated" sort header, Then leads are sorted by last updated descending (newest first).
- Given the user applies a search term that matches no leads, Then the list displays an empty state message: "No leads found".
- Given a lead's Name is "John" and Company is "Acme Corp", When the user searches "john", Then the lead appears (case-insensitive match).
- Given no filters or search are applied, Then all leads are displayed in the list.
- Given the list view is open at 375px, Then the list fits the viewport width with no sideways scrolling.
- Given the list view is open at 1280px, Then the list displays well and all columns are visible.

## Files likely to touch
- `app/page.tsx` (list view — may be the home page)
- `components/LeadList.tsx` (table/list component)
- `components/SearchBar.tsx` (search input)
- `components/Filters.tsx` (filter dropdowns for Stage and Source)
- `lib/leads.ts` (query function with filter/sort params)
- `components/LeadCard.tsx` or `components/LeadRow.tsx` (list row)

## Out of scope
- Advanced search (e.g., regex, fuzzy matching)
- Saved / preset filters
- Column visibility toggle in the list

## Test notes (edge cases QA must try)
- Search for a string that appears in the Company but not the Name, and vice versa
- Clear all filters one by one — verify the list rebuilds each time
- Sort by follow-up date with leads that have no follow-up date — verify they appear at the bottom or top consistently
- Search for an empty string — verify all leads show
- Source filter: Website, Referral, LinkedIn, WhatsApp, Other — each filter shows only matching leads
- Verify case-insensitive search: "ACME", "acme", "Acme" all match "Acme Corp"
