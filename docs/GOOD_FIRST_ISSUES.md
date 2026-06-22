# Good First Issues

Create these as GitHub issues after the repository is public. They are intentionally small and well-scoped.

## Documentation

- Add an English README summary.
- Add a short architecture diagram for the data refresh flow.
- Add screenshots for schedule, bracket, cities, and status pages.
- Improve `DATA_SOURCES.md` with per-asset attribution notes.

## Product

- Add copied share text for city schedules.
- Add a “copy match details” action next to the existing share button.
- Add empty states for filters with no matches.
- Add quick filter buttons for “今天”, “未来 3 天”, and “西雅图”.

## Engineering

- Add parser fixture tests for a saved schedule snapshot.
- Add unit tests for query-parameter schedule filters.
- Add API smoke tests for `/api/status`, `/api/matches`, and `/api/concierge`.
- Add a small script that prints current data freshness in CI logs.

## Design

- Create a 1280x640 social preview image variant for light backgrounds.
- Improve mobile spacing on dense match cards.
- Add accessible focus states for all icon buttons.
