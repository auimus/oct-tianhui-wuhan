/**
 * Generates the self-contained static-site/ snapshot from the same data
 * the live artifact serves (server/src/data.ts + app.db feed rows).
 *
 * Usage (from the project root):
 *   bun scripts/generate-static-site.ts
 *
 * The runtime equivalent is the exportStaticSite action (used by the
 * daily GitHub sync); both paths share server/src/static_template.ts,
 * so their output is identical in structure. Output is text-only:
 * index.html (images base64-embedded), README.md, .nojekyll.
 */
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  MILESTONES,
  PLACE_GEO,
  PLACES,
  PRICES,
  PROJECT,
  PROJECT_PIN,
  SITE_PHOTOS,
} from "../server/src/data";
import {
  buildStaticReadme,
  buildStaticSiteHtml,
  type StaticImages,
  type StaticSiteData,
} from "../server/src/static_template";

const spaceDir = join(import.meta.dir, "..");

type FeedRow = {
  id: number;
  title: string;
  category: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  publishedDate: string | null;
  fetchedAt: number;
};

function loadFeed(): {
  feedItems: StaticSiteData["feedItems"];
  feedCount: number;
  bookmarkCount: number;
  lastRefreshAt: string | null;
} {
  const dbPath = join(spaceDir, "app.db");
  if (!existsSync(dbPath)) {
    return { feedItems: [], feedCount: 0, bookmarkCount: 0, lastRefreshAt: null };
  }
  const db = new Database(dbPath, { readonly: true });
  try {
    const rows = db
      .query(
        "SELECT id, title, category, summary, source_name AS sourceName, source_url AS sourceUrl, published_date AS publishedDate, fetched_at AS fetchedAt FROM feed_items ORDER BY id DESC LIMIT 200",
      )
      .all() as FeedRow[];
    const bm = db
      .query("SELECT feed_item_id AS feedItemId FROM bookmarks")
      .all() as { feedItemId: number }[];
    const bookmarkedIds = new Set(bm.map((b) => b.feedItemId));
    const logs = db
      .query("SELECT created_at AS createdAt FROM refresh_logs ORDER BY id DESC LIMIT 1")
      .all() as { createdAt: number }[];
    rows.sort((a, b) => {
      const da = a.publishedDate ?? "";
      const dbd = b.publishedDate ?? "";
      if (da !== dbd) return dbd.localeCompare(da);
      return b.id - a.id;
    });
    const feedItems = rows.slice(0, 100).map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      summary: r.summary,
      sourceName: r.sourceName,
      sourceUrl: r.sourceUrl,
      publishedDate: r.publishedDate,
      fetchedAt: new Date(r.fetchedAt).toISOString(),
      bookmarked: bookmarkedIds.has(r.id),
    }));
    const last = logs[0];
    return {
      feedItems,
      feedCount: rows.length,
      bookmarkCount: bm.length,
      lastRefreshAt: last
        ? new Date(last.createdAt).toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
            hour12: false,
          })
        : null,
    };
  } finally {
    db.close();
  }
}

function readImage(name: string, mime: string): string | null {
  const path = join(spaceDir, "client", "src", "assets", name);
  if (!existsSync(path)) return null;
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

const now = new Date();
const feed = loadFeed();
const data: StaticSiteData = {
  snapshotAt: now.toISOString(),
  snapshotText: now.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  }),
  project: PROJECT,
  places: PLACES.map((p) => {
    const geo = PLACE_GEO[p.name];
    return {
      ...p,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
      polygon: geo?.polygon ?? null,
      pinNote: geo?.pinNote ?? null,
    };
  }),
  milestones: MILESTONES,
  prices: PRICES,
  projectPin: PROJECT_PIN,
  sitePhotos: SITE_PHOTOS,
  feedItems: feed.feedItems,
  feedCount: feed.feedCount,
  bookmarkCount: feed.bookmarkCount,
  lastRefreshAt: feed.lastRefreshAt,
};

const images: StaticImages = {
  mapStatic: readImage("map-static.png", "image/png"),
  aerial: readImage("site-aerial-202603.png", "image/png"),
  visit: readImage("site-visit-202603.jpg", "image/jpeg"),
  sample: readImage("site-sample-202603.png", "image/png"),
};

const outDir = join(spaceDir, "static-site");
mkdirSync(outDir, { recursive: true });
const files = [
  { name: "index.html", content: buildStaticSiteHtml(data, images) },
  { name: "README.md", content: buildStaticReadme(data) },
  { name: ".nojekyll", content: "" },
];
let total = 0;
for (const f of files) {
  writeFileSync(join(outDir, f.name), f.content, "utf8");
  total += Buffer.byteLength(f.content, "utf8");
}
console.log(
  `static-site/ generated: ${files.length} files, ${(total / 1024).toFixed(0)} KB, snapshot ${data.snapshotText}, feed ${data.feedItems.length} items, places ${data.places.length}`,
);
