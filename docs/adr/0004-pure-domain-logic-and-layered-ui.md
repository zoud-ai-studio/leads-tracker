# ADR 0004: Keep domain logic pure and UI layered

**Status:** Accepted

## Decision

Place validation, formatting, filtering/sorting, dashboard aggregation, date
helpers, and CSV serialization in pure `lib/` modules. Components render and
invoke those functions; routes compose components.

## Consequences

All views compute values and validation identically and can be tested without a
browser. React Testing Library covers components and Playwright covers complete
browser journeys and responsive layouts.

## Source

PRD sections 3–6 and the project testing rules.
