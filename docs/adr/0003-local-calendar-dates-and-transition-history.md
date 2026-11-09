# ADR 0003: Preserve date-only values in the local calendar

**Status:** Accepted

## Decision

Represent date-only fields as `YYYY-MM-DD` derived from the browser's local
calendar. `wonAt` is set only by a transition into `Won` and cleared by a
transition out of that stage. Activity ordering uses timestamp then ID.

## Consequences

Follow-up-today and won-this-month calculations do not shift around UTC
boundaries. Dashboard calculations have a stable event date and notes created
within the same millisecond remain deterministically ordered.

## Source

PRD open questions OQ-01/OQ-02 and STORY-004 acceptance criteria.
