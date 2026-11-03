#!/usr/bin/env node
// Converts data/apify-actors.json (Apify Store API items for username "mrdoe") into
// data/projects.json, matching the PROJECTS schema embedded in portfolio.html.
// Re-run this whenever data/apify-actors.json is refreshed, then paste the output of
// `node scripts/build-projects.mjs --inline` into the PROJECTS array in portfolio.html.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const raw = JSON.parse(readFileSync(join(ROOT, "data/apify-actors.json"), "utf8"));

// Apify category enum -> one of the 8 friendly buckets. First match wins per actor.
const CAT_MAP = {
  TRAVEL: "Travel",
  ECOMMERCE: "E-commerce",
  SOCIAL_MEDIA: "Social media",
  LEAD_GENERATION: "Lead generation",
  BUSINESS: "Business data",
  REAL_ESTATE: "Real estate",
  JOBS: "Jobs",
  HEALTHCARE: "Healthcare",
};

function mapCategory(categories = []) {
  for (const c of categories) if (CAT_MAP[c]) return CAT_MAP[c];
  return "Other";
}

function trimDesc(s, max = 140) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd() + "…";
}

// Hand-picked site names for actors the heuristic below gets wrong or that have no
// single real-world site (keyed by actor slug / "name"). Extend as new actors are added.
const SITE_OVERRIDES = {
  "expedia-hotel-scraper": "Expedia",
  "viral-clips-downloader": "Video link",
  "reelFarm": "Reel.farm",
  "realself-scraper": "RealSelf",
  "ebay-product-scraper": "eBay",
  "open-food-facts-product-scraper": "Open Food Facts",
  "japan-jgb-yields-panel": "G2", // actor's internal slug doesn't match its public title
  "seven-eleven-australia-scraper": "7-Eleven AU",
  "wine-searcher-data-scraper": "Wine-Searcher",
};

// "AliExpress Product Scraper" -> "AliExpress", "Screwfix Product Scraper" -> "Screwfix", etc.
// Strips common suffixes; falls back to the first couple of words if nothing else fits.
function siteNameFromTitle(name, title) {
  if (SITE_OVERRIDES[name]) return SITE_OVERRIDES[name];
  const cleaned = title.replace(/[^\p{L}\p{N}\s.&'-]/gu, " ").replace(/\s+/g, " ").trim();
  const stripped = cleaned.replace(/\b(product|data|store|listings?|postings?|price|player|weekly|slideshow)\b/gi, "")
    .replace(/\b(scraper|monitor|tracker|downloader|projections?|intelligence|reviews?)\b.*$/i, "")
    .replace(/\s+/g, " ").trim().replace(/[&-]+$/, "").trim();
  return stripped || cleaned.split(" ").slice(0, 2).join(" ");
}

const projects = raw.items.map((a) => ({
  name: a.title,
  cat: mapCategory(a.categories),
  status: "live",
  date: (a.stats?.lastRunStartedAt || raw.capturedAt).slice(0, 10),
  users: a.stats?.totalUsers30Days ?? 0,
  desc: trimDesc(a.description || ""),
  pipe: [siteNameFromTitle(a.name, a.title), "Extract", "CSV / JSON"],
  ai: [],
  link: a.url,
}));

writeFileSync(join(ROOT, "data/projects.json"), JSON.stringify(projects, null, 2) + "\n");

if (process.argv.includes("--inline")) {
  const lines = projects.map((p) =>
    `  {name:${JSON.stringify(p.name)}, cat:${JSON.stringify(p.cat)}, status:${JSON.stringify(p.status)}, date:${JSON.stringify(p.date)}, users:${p.users},\n` +
    `   desc:${JSON.stringify(p.desc)},\n` +
    `   pipe:${JSON.stringify(p.pipe)}, ai:[], link:${JSON.stringify(p.link)}}`
  );
  console.log("const PROJECTS = [\n" + lines.join(",\n") + "\n];");
} else {
  console.log(`Wrote data/projects.json (${projects.length} actors).`);
}
