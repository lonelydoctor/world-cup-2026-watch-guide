# Contributing

Contributions are welcome, especially for schedule parsing, data validation, accessibility, localization, and city/team experience improvements.

## Local Setup

```bash
npm install
npm run dev
```

## Before Opening a Pull Request

Run:

```bash
npm run check:release
```

For data-only updates, at minimum run:

```bash
npm run refresh:data
npm run test:data
```

## Data Changes

- Keep generated schedule changes in `src/data/worldcup.generated.json`.
- Use `src/data/manual-overrides.json` only for intentional corrections.
- Do not add official FIFA logos, mascots, posters, or protected commercial assets.
- Cite new public data sources in `DATA_SOURCES.md`.

## Pull Request Notes

Please describe:

- What changed.
- How you tested it.
- Whether the change affects data freshness, parsing behavior, or public API shape.
