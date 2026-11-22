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
  EVALUATION,
  METRO_LINES,
  MILESTONES,
  PLACE_GEO,
  PLACES,
  PRICES,
  PROJECT,
  PROJECT_PIN,
  SITE_PHOTOS,
  weatherText,
} from "../server/src/data";
import {
  buildStaticReadme,
  buildStaticSiteHtml,
  type StaticImages,
  type StaticMapLib,
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
    /* Same freshness rule as the live listFeed action: same Beijing
       calendar day as the newest fetchedAt, and that newest fetch is
       at most 48 hours old at snapshot time. */
    const beijingDay = (d: Date) =>
      d.toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
    let maxFetchedAt: number | null = null;
    for (const r of rows) {
      if (maxFetchedAt === null || r.fetchedAt > maxFetchedAt) maxFetchedAt = r.fetchedAt;
    }
    const nowMs = Date.now();
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
      freshness: (maxFetchedAt !== null &&
      nowMs - maxFetchedAt <= 48 * 3600 * 1000 &&
      beijingDay(new Date(r.fetchedAt)) === beijingDay(new Date(maxFetchedAt))
        ? "new"
        : null) as "new" | null,
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

/* Vendored MapLibre GL dist sources for inlining (null → CDN fallback). */
function readMapLib(): StaticMapLib {
  const dir = join(spaceDir, "client", "src", "assets");
  const jsPath = join(dir, "maplibre-gl.min.js");
  const cssPath = join(dir, "maplibre-gl.css");
  if (!existsSync(jsPath) || !existsSync(cssPath)) return null;
  const js = readFileSync(jsPath, "utf8");
  const css = readFileSync(cssPath, "utf8");
  return js && css ? { js, css } : null;
}

/* Snapshot-moment weather from Open-Meteo (same source/coordinates as
   the live header). Any failure → null and the block is omitted. */
/* Header weather date label from Open-Meteo's current.time
   (e.g. "2026-11-22T02:45" → "11月22日"); falls back to today's
   Asia/Shanghai date when the observation time is missing. */
function weatherDateLabel(observedAt: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(observedAt);
  if (m) return `${Number(m[2])}月${Number(m[3])}日`;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
  }).format(new Date());
}

async function loadWeather(): Promise<StaticSiteData["weather"]> {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=30.6092&longitude=114.4015" +
      "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
      "&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=1";
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      current?: {
        time?: string;
        temperature_2m?: number;
        relative_humidity_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
      daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
    };
    const cur = j.current;
    const high = j.daily?.temperature_2m_max?.[0];
    const low = j.daily?.temperature_2m_min?.[0];
    if (
      !cur ||
      typeof cur.temperature_2m !== "number" ||
      typeof cur.weather_code !== "number" ||
      typeof high !== "number" ||
      typeof low !== "number"
    ) {
      return null;
    }
    const t = weatherText(cur.weather_code);
    return {
      tempC: cur.temperature_2m,
      code: cur.weather_code,
      label: t.label,
      icon: t.icon,
      highC: high,
      lowC: low,
      humidity: cur.relative_humidity_2m ?? 0,
      windKmh: cur.wind_speed_10m ?? 0,
      observedAt: cur.time ?? "",
      dateLabel: weatherDateLabel(cur.time ?? ""),
    };
  } catch {
    return null;
  }
}

const now = new Date();
const feed = loadFeed();
const weather = await loadWeather();
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
      addedOn: p.addedOn ?? null,
      updatedOn: p.updatedOn ?? null,
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
  weather,
  metroLines: METRO_LINES,
  evaluation: EVALUATION,
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
  { name: "index.html", content: buildStaticSiteHtml(data, images, readMapLib()) },
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
