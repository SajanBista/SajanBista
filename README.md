# sajanbista.com portfolio

`portfolio.html` is a single-file static page listing automation/scraper projects as pipeline cards
(trigger → steps → output), searchable and filterable by category.

## Status

The `PROJECTS` array in `portfolio.html` is real data from the Apify Store (username `mrdoe`,
profile: https://apify.com/mrdoe) — but a **partial sample: 13 of 363 public actors**. The stats
bar (`REAL_STATS` near the top of the inline `<script>`) shows the real profile-wide totals
regardless, since those were given directly rather than computed from the partial list.

`api.apify.com` is unreachable from the sandbox this was built in, so the full paginated fetch
has never run. To refresh with the complete list:

1. From a machine that can reach it: `curl "https://api.apify.com/v2/store?username=mrdoe&limit=1000"`,
   paginating with `&offset=1000`, `&offset=2000`, etc. if `total` in the response exceeds what one
   page returns. Save the combined `items` array into `data/apify-actors.json`, replacing the
   `items` list there (keep the `_note`/`capturedAt` fields or update them).
2. Run `node scripts/build-projects.mjs` — writes `data/projects.json` from that file.
3. Run `node scripts/build-projects.mjs --inline` — prints a ready-to-paste `const PROJECTS = [...]`
   block. Replace the one in `portfolio.html`'s `<script>` with it.
4. Update `REAL_STATS` in `portfolio.html` if the profile-wide numbers changed, and update/remove
   the `#sampleNote` div once it's no longer a partial sample.
5. `scripts/build-projects.mjs`'s `SITE_OVERRIDES` map has hand-picked "site name" labels for a
   few actors the title-parsing heuristic gets wrong (generic titles, mismatched slugs). Extend it
   for any new actors that come out oddly once the full list is converted.

## Deploy

Static HTML, no build step. Works as-is on Vercel (import this repo, no framework/config needed —
Vercel serves `portfolio.html` as a static site) or GitHub Pages.
