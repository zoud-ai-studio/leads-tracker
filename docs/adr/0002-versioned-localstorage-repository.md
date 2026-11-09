# ADR 0002: Centralize browser persistence behind a versioned repository

**Status:** Accepted

## Decision

Persist one versioned envelope under `leads-tracker:v1`. Only `lib/leads.ts`
reads or writes `localStorage`; pages and components use repository functions.
The envelope owns leads and their embedded activities. A missing key is empty;
malformed or unknown-version data is preserved and reported as recoverable. The
repository refreshes from `storage` events and uses last-completed-write wins.

## Consequences

Every mutation shares validation, persistence, timestamps, and future migration
behaviour. Deleting a lead also deletes its embedded activity log. Browser data
remains device- and browser-profile-local.

## Source

PRD sections 1.4, 3.4, 4.1, and 6.
