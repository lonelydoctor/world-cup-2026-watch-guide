# Data Sources and Attribution

This project is an unofficial fan-made watch guide. It is not affiliated with, endorsed by, or sponsored by FIFA.

## Primary Schedule Data

- Source: 2026 FIFA World Cup public schedule and results summary
- URL: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup
- Local generated file: `src/data/worldcup.generated.json`
- Parser: `scripts/refresh-worldcup-data.mjs` and `src/lib/server/wiki-parser.ts`

The generated data snapshot is included for demo and development convenience. Refresh it with:

```bash
npm run refresh:data
```

## Official Reference

- FIFA tournament page: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026
- FIFA legal page: https://www.fifa.com/en/legal
- FIFA terms of service: https://www.fifa.com/en/legal/terms-of-service

Do not use FIFA logos, mascots, posters, official marks, or copyrighted media unless you have the required rights.

## Assets

- Flag icons: `flag-icons`, licensed by its upstream package.
- Icons: `lucide-react`, licensed by its upstream package.
- Homepage stadium visual: local stylized asset stored at `public/stadium-hero.svg`.

## Limitations

- This project does not provide live minute-by-minute scores.
- The parser depends on public page structure and can break if the source page changes.
- Manual overrides may be required for disputed scores, delayed matches, renamed venues, or unresolved knockout placeholders.
- The UI displays source freshness so users can judge whether the data is current enough for their use.
