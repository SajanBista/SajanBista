# sajanbista.com portfolio

`portfolio.html` is a single-file static page listing automation/scraper projects as pipeline cards
(trigger → steps → output), searchable and filterable by category.

## Status

The `PROJECTS` array in `portfolio.html` is currently **placeholder data**. It's meant to be replaced
with real public actors from the Apify Store, username `mrdoe` (profile: https://apify.com/mrdoe):

1. Fetch `https://api.apify.com/v2/store?username=mrdoe&limit=1000` (paginate with `offset` if
   `total` exceeds the page size), save the raw response to `data/apify-actors.json`.
2. Convert each actor into the `PROJECTS` schema (see the comment above the array in
   `portfolio.html` for field mapping) and write it to `data/projects.json`.
3. Replace the `PROJECTS` array in `portfolio.html` with that data, then remove the "Sample
   entries" note (`#sampleNote` in the HTML).

This wasn't done yet because the sandbox this was built in has no network access to
`api.apify.com`. Either re-run the fetch from an environment that can reach it, or paste the raw
JSON in and it'll be converted directly.

## Deploy

Static HTML, no build step. Works as-is on Vercel (import this repo, no framework/config needed —
Vercel serves `portfolio.html` as a static site) or GitHub Pages.
