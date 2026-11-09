# STORY-001: Lead Management (Add & Edit)
Ticket: — · Size: S · Data class: INTERNAL

## Why
The agency owner must be able to create new leads and edit existing ones. Without this, there is nothing to track. This is the foundation that every other feature builds on.

## Acceptance criteria

- Given the app is loaded, When the user clicks "Add lead", Then a form appears with fields: Name (required), Company, Email, Phone, Source, Service, Estimated value, Stage, Next follow-up date, Notes.
- Given the form is open, When the user fills in a valid Name and clicks Save, Then the lead is created, saved to localStorage, and the user sees a confirmation.
- Given an existing lead, When the user clicks Edit on that lead, Then the form pre-fills with the lead's current values and Save updates the lead.
- Given the Name field is empty, When the user clicks Save, Then the Save button is disabled and an inline error message "Name is required" is displayed.
- Given a valid Name but an Email field containing "not-an-email", When the user clicks Save, Then the Save button is disabled and an inline error message "Enter a valid email address" is displayed.
- Given Estimated value set to 10000001 (above 10,000,000), When the user clicks Save, Then the Save button is disabled and an inline error message "Value must be 10,000,000 or less" is displayed.
- Given Estimated value set to 1250.123 (3 decimal places), When the user clicks Save, Then the Save button is disabled and an inline error message "Value must have at most 2 decimal places" is displayed.
- Given the form has unsaved changes, When the user navigates away (browser back button, link click), Then a confirmation dialog appears with the text "You have unsaved changes. Discard them?".
- Given unsaved changes in the form, When the user confirms "Discard" in the dialog, Then the changes are lost and the user is navigated away.
- Given the user selects "Website" from the Source dropdown, Then the Source value is saved as "Website" in localStorage.
- Given the user selects "AI agent" from the Service dropdown, Then the Service value is saved as "AI agent" in localStorage.
- Given a valid lead is saved, Then it appears in the Pipeline Board and the List view after navigation.
- Given a value of 0, When the user enters 0 as Estimated value, Then the value is accepted (0 is valid, 0 to 10,000,000 inclusive).
- Given Estimated value of 10000000 (max), When the user enters 10000000, Then the value is accepted.

## Files likely to touch
- `app/page.tsx` or `app/leads/page.tsx` (list view)
- `app/leads/new/page.tsx` (create form)
- `app/leads/[id]/edit/page.tsx` (edit form)
- `components/LeadForm.tsx` (shared form component)
- `lib/leads.ts` (localStorage CRUD)

## Out of scope
- Delete (covered in STORY-004)
- Board view (STORY-002)
- List filtering and sorting (STORY-003)
- Dashboard (STORY-004)

## Test notes (edge cases QA must try)
- Enter exactly 500 characters in Name → Save succeeds
- Enter 501 characters in Name → Save fails or truncates with clear message
- Enter 0.01 as value → Save succeeds (minimum positive value)
- Enter 1234.50 as value → Save succeeds (2 decimals)
- Clear the Name field after filling it, then tab out → error should appear in real-time or on blur
- Fill form, navigate away without saving, come back, verify form is empty
- Save a lead, refresh the page, verify the lead still exists in the form and list
- Source values: Website, Referral, LinkedIn, WhatsApp, Other — each one saves correctly
- Service values: Website, Web app, AI agent, Other — each one saves correctly
