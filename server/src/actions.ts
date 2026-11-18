import { defineAction, z, type ActionsModule } from "@hatch/space-sdk";
import { privileged } from "@space/privileged";
import { desc, eq, inArray } from "drizzle-orm";
import * as schema from "./schema";

/* ------------------------------------------------------------------ */
/* Researched reference data (see DATA-PLAN.md for provenance).        */
/* Distances are straight-line reference values from the cited sources */
/* and are labeled as such in the UI.                                  */
/* ------------------------------------------------------------------ */

import {
  EVALUATION,
  MILESTONES,
  PLACE_GEO,
  PLACES,
  PRICES,
  PROJECT,
  PROJECT_PIN,
  SEED_FEED,
  SITE_PHOTOS,
  weatherText,
} from "./data";

/* ------------------------------------------------------------------ */
/* Weather (Open-Meteo, no key) for the project pin location. Fetched  */
/* server-side with a ~20-minute module-level cache; any failure       */
/* returns null and the header block simply hides — it must never      */
/* break or block the page. The client also falls back to a direct     */
/* browser fetch when this comes back null.                            */
/* ------------------------------------------------------------------ */

const weatherShape = z.object({
  tempC: z.number(),
  code: z.number(),
  label: z.string(),
  icon: z.string(),
  highC: z.number(),
  lowC: z.number(),
  humidity: z.number(),
  windKmh: z.number(),
  observedAt: z.string(),
});

type WeatherData = z.infer<typeof weatherShape>;

let weatherCache: { at: number; data: WeatherData | null } | null = null;
const WEATHER_TTL_MS = 20 * 60 * 1000;
const WEATHER_FAIL_TTL_MS = 5 * 60 * 1000;

async function fetchWeather(): Promise<WeatherData | null> {
  const nowMs = Date.now();
  if (weatherCache) {
    const ttl = weatherCache.data ? WEATHER_TTL_MS : WEATHER_FAIL_TTL_MS;
    if (nowMs - weatherCache.at < ttl) return weatherCache.data;
  }
  let data: WeatherData | null = null;
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=30.6092&longitude=114.4015" +
      "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
      "&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=1";
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
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
        cur &&
        typeof cur.temperature_2m === "number" &&
        typeof cur.weather_code === "number" &&
        typeof high === "number" &&
        typeof low === "number"
      ) {
        const t = weatherText(cur.weather_code);
        data = {
          tempC: cur.temperature_2m,
          code: cur.weather_code,
          label: t.label,
          icon: t.icon,
          highC: high,
          lowC: low,
          humidity: cur.relative_humidity_2m ?? 0,
          windKmh: cur.wind_speed_10m ?? 0,
          observedAt: cur.time ?? "",
        };
      }
    }
  } catch {
    data = null;
  }
  weatherCache = { at: nowMs, data };
  return data;
}


const exportStaticSiteResponse = z.object({
  ok: z.boolean(),
  snapshotAt: z.string(),
  totalBytes: z.number(),
  fileCount: z.number(),
  files: z.array(z.string()),
  message: z.string(),
});

const feedItemShape = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  summary: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string(),
  publishedDate: z.string().nullable(),
  fetchedAt: z.string(),
  bookmarked: z.boolean(),
  freshness: z.enum(["new"]).nullable(),
});

type FeedRow = typeof schema.feedItems.$inferSelect;

/* Freshness rule (see DATA-PLAN.md「新增/更新标记机制」): an item is "new"
   when its fetchedAt falls on the same Beijing calendar day as the newest
   fetchedAt in the whole feed table, and that newest fetchedAt is at most
   48 hours old. The tag therefore expires on its own — no cleanup needed. */
function beijingDay(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

function freshnessFor(
  fetchedAt: Date,
  maxFetchedAt: Date | null,
  now: Date,
): "new" | null {
  if (!maxFetchedAt) return null;
  if (now.getTime() - maxFetchedAt.getTime() > 48 * 3600 * 1000) return null;
  return beijingDay(fetchedAt) === beijingDay(maxFetchedAt) ? "new" : null;
}

function maxFetchedAtOf(rows: { fetchedAt: Date }[]): Date | null {
  let max: Date | null = null;
  for (const r of rows) {
    if (!max || r.fetchedAt.getTime() > max.getTime()) max = r.fetchedAt;
  }
  return max;
}

function toFeedItem(
  row: FeedRow,
  bookmarkedIds: Set<number>,
  maxFetchedAt: Date | null,
  now: Date,
) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    publishedDate: row.publishedDate,
    fetchedAt: row.fetchedAt.toISOString(),
    bookmarked: bookmarkedIds.has(row.id),
    freshness: freshnessFor(row.fetchedAt, maxFetchedAt, now),
  };
}

export const Actions = {
  getOverview: defineAction({
    description:
      "Returns the 华侨城天荟 project archive, surrounding places catalog, milestone timeline, and feed/bookmark counts.",
    request: z.object({}),
    response: z.object({
      project: z.object({
        name: z.string(),
        address: z.string(),
        district: z.string(),
        developer: z.string(),
        builder: z.string(),
        property: z.string(),
        landParcel: z.string(),
        landDeal: z.string(),
        landArea: z.string(),
        gfa: z.string(),
        far: z.string(),
        greenRate: z.string(),
        units: z.string(),
        parking: z.string(),
        product: z.string(),
        phase1: z.string(),
        phase2: z.string(),
        delivery: z.string(),
        firstOpen: z.string(),
        boundaries: z.string(),
        caveats: z.string(),
        sourceUrls: z.array(z.string()),
      }),
      places: z.array(
        z.object({
          name: z.string(),
          category: z.string(),
          distanceText: z.string(),
          distanceM: z.number(),
          status: z.string(),
          description: z.string(),
          sourceUrl: z.string(),
          lat: z.number().nullable(),
          lng: z.number().nullable(),
          polygon: z.array(z.tuple([z.number(), z.number()])).nullable(),
          pinNote: z.string().nullable(),
          addedOn: z.string().nullable(),
          updatedOn: z.string().nullable(),
        }),
      ),
      milestones: z.array(
        z.object({
          dateText: z.string(),
          title: z.string(),
          description: z.string(),
          category: z.string(),
          future: z.boolean(),
          sourceUrl: z.string(),
        }),
      ),
      feedCount: z.number(),
      bookmarkCount: z.number(),
      lastRefreshAt: z.string().nullable(),
      prices: z.object({
        asOf: z.string(),
        currentRef: z.number(),
        currentRefNote: z.string(),
        firstOpenAvg: z.number(),
        onSaleFromAvg: z.number(),
        fourRoomDealAvg: z.number(),
        unitTypes: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
            shortLabel: z.string(),
            area: z.number(),
            rooms: z.string(),
            building: z.string(),
            efficiency: z.string(),
            filingAvg: z.number().nullable(),
            filingNote: z.string(),
            saleTotalFromWan: z.number().nullable(),
            trend: z.array(
              z.object({
                stage: z.string(),
                dateText: z.string(),
                price: z.number(),
                kind: z.string(),
              }),
            ),
            note: z.string(),
          }),
        ),
        projectTrend: z.array(
          z.object({
            stage: z.string(),
            dateText: z.string(),
            asking: z.number().nullable(),
            deal: z.number().nullable(),
          }),
        ),
        hongshanMonthly2025: z.array(z.object({ month: z.string(), price: z.number() })),
        hongshanYearAvg2025: z.number(),
        yangchunhuListing: z.array(
          z.object({ month: z.string(), price: z.number(), approx: z.boolean() }),
        ),
        yangchunhuListingNote: z.string(),
        sectorDealAvg: z.number(),
        sectorDealNote: z.string(),
        neighbors: z.array(
          z.object({ name: z.string(), listing: z.number(), deal: z.number() }),
        ),
        market: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
            dateText: z.string(),
            note: z.string(),
          }),
        ),
        sources: z.array(z.object({ name: z.string(), url: z.string() })),
      }),
      projectPin: z.object({
        label: z.string(),
        category: z.string(),
        lat: z.number(),
        lng: z.number(),
        status: z.string(),
        note: z.string(),
        pinNote: z.string(),
        polygon: z.array(z.tuple([z.number(), z.number()])),
      }),
      sitePhotos: z.object({
        dateText: z.string(),
        sourceName: z.string(),
        sourceUrl: z.string(),
        progressNote: z.string(),
        photos: z.array(
          z.object({ key: z.string(), caption: z.string(), alt: z.string() }),
        ),
      }),
      weather: weatherShape.nullable(),
      evaluation: z.object({
        asOf: z.string(),
        overall: z.number(),
        items: z.array(
          z.object({ label: z.string(), score: z.number(), basis: z.string() }),
        ),
        verdict: z.string(),
        note: z.string(),
      }),
    }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const feedRows = await db.select({ id: schema.feedItems.id }).from(schema.feedItems);
      const bmRows = await db.select({ id: schema.bookmarks.id }).from(schema.bookmarks);
      const logs = await db
        .select()
        .from(schema.refreshLogs)
        .orderBy(desc(schema.refreshLogs.id))
        .limit(1);
      return {
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
        feedCount: feedRows.length,
        bookmarkCount: bmRows.length,
        lastRefreshAt: logs[0] ? logs[0].createdAt.toISOString() : null,
        prices: PRICES,
        projectPin: PROJECT_PIN,
        sitePhotos: SITE_PHOTOS,
        weather: await fetchWeather(),
        evaluation: EVALUATION,
      };
    },
  }),

  listFeed: defineAction({
    description: "Lists latest feed items, optionally filtered by category or bookmarked-only.",
    request: z.object({
      category: z.string().default("全部"),
      limit: z.number().int().positive().max(100).default(50),
    }),
    response: z.object({ items: z.array(feedItemShape) }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const bmRows = await db.select().from(schema.bookmarks);
      const bookmarkedIds = new Set(bmRows.map((b) => b.feedItemId));
      const allFetched = await db
        .select({ fetchedAt: schema.feedItems.fetchedAt })
        .from(schema.feedItems);
      const maxFetchedAt = maxFetchedAtOf(allFetched);
      const now = new Date();
      let rows = await db
        .select()
        .from(schema.feedItems)
        .orderBy(desc(schema.feedItems.id))
        .limit(200);
      if (args.category === "收藏") {
        rows = rows.filter((r) => bookmarkedIds.has(r.id));
      } else if (args.category !== "全部") {
        rows = rows.filter((r) => r.category === args.category);
      }
      rows.sort((a, b) => {
        const da = a.publishedDate ?? "";
        const dbd = b.publishedDate ?? "";
        if (da !== dbd) return dbd.localeCompare(da);
        return b.id - a.id;
      });
      return {
        items: rows
          .slice(0, args.limit)
          .map((r) => toFeedItem(r, bookmarkedIds, maxFetchedAt, now)),
      };
    },
  }),

  toggleBookmark: defineAction({
    description: "Bookmarks or unbookmarks one feed item.",
    request: z.object({ feedItemId: z.number().int().positive(), bookmarked: z.boolean() }),
    response: z.object({ ok: z.boolean(), bookmarked: z.boolean() }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      if (args.bookmarked) {
        const existing = await db
          .select()
          .from(schema.bookmarks)
          .where(eq(schema.bookmarks.feedItemId, args.feedItemId));
        if (existing.length === 0) {
          await db.insert(schema.bookmarks).values({ feedItemId: args.feedItemId });
        }
      } else {
        await db
          .delete(schema.bookmarks)
          .where(eq(schema.bookmarks.feedItemId, args.feedItemId));
      }
      ctx.invalidateQueries();
      return { ok: true, bookmarked: args.bookmarked };
    },
  }),

  listNotes: defineAction({
    description: "Lists the user's own tracking notes, newest first.",
    request: z.object({}),
    response: z.object({
      notes: z.array(
        z.object({ id: z.number(), text: z.string(), createdAt: z.string() }),
      ),
    }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const rows = await db
        .select()
        .from(schema.notes)
        .orderBy(desc(schema.notes.id))
        .limit(100);
      return {
        notes: rows.map((r) => ({
          id: r.id,
          text: r.text,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    },
  }),

  addNote: defineAction({
    description: "Adds one user tracking note (e.g. a site visit observation or a question to verify).",
    request: z.object({ text: z.string().min(1).max(500) }),
    response: z.object({ id: z.number() }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const result = await db
        .insert(schema.notes)
        .values({ text: args.text })
        .returning({ id: schema.notes.id });
      const inserted = result[0];
      if (!inserted) throw new Error("addNote: insert returned no rows");
      ctx.invalidateQueries();
      return { id: inserted.id };
    },
  }),

  deleteNote: defineAction({
    description: "Deletes one user tracking note by id.",
    request: z.object({ id: z.number().int().positive() }),
    response: z.object({ ok: z.boolean() }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      await db.delete(schema.notes).where(eq(schema.notes.id, args.id));
      ctx.invalidateQueries();
      return { ok: true };
    },
  }),

  populateInitial: defineAction({
    description:
      "Seeds the feed with the researched launch items (Sam's groundbreaking, Metro Line 10 progress, Donghu New City reply, sales ranking, project notice). Idempotent: dedupes by source URL.",
    request: z.object({}),
    response: z.object({ inserted: z.number(), total: z.number() }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const existing = await db
        .select({ sourceUrl: schema.feedItems.sourceUrl })
        .from(schema.feedItems);
      const existingUrls = new Set(existing.map((r) => r.sourceUrl));
      let inserted = 0;
      for (const item of SEED_FEED) {
        if (existingUrls.has(item.sourceUrl)) continue;
        await db.insert(schema.feedItems).values({
          title: item.title,
          category: item.category,
          summary: item.summary,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          publishedDate: item.publishedDate,
        });
        inserted += 1;
      }
      const all = await db.select({ id: schema.feedItems.id }).from(schema.feedItems);
      if (inserted > 0) ctx.invalidateQueries();
      return { inserted, total: all.length };
    },
  }),

  refreshFeed: defineAction({
    description:
      "Starts a background research task that searches for the latest 华侨城天荟 / 杨春湖 / 地铁10号线 news and saves new items via saveFeedItems.",
    request: z.object({}),
    response: z.object({ started: z.boolean(), message: z.string() }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      await db.insert(schema.refreshLogs).values({
        status: "started",
        message: "手动/定时刷新已启动",
      });
      const result = await ctx.agent.spawnTask(
        [
          "你是华侨城天荟周边生活信息空间的每日刷新研究员。请用网络搜索查找最新信息，主题限定在武汉市洪山区华侨城·天荟及其所在的杨春湖高铁商务区/东湖新城片区：",
          "1) 华侨城天荟 开发进展、销售动态、交付与公示；",
          "2) 杨春湖高铁商务区 / 东湖新城 片区规划与建设进展；",
          "3) 武汉地铁 10 号线 / 新港线 北洋桥站 施工进展；",
          "4) 周边商业：山姆会员店洪山店、科创产业园、武汉金诺奥特莱斯（和平街道）、金地广场、欢乐天际、金茂览秀城等开业/开工/招商动态；",
          "5) 教育医疗：洪山区学区划片公示、七一华源中学东湖新城分校、武汉市中心医院杨春湖院区动态；",
          "6) 房价动态：天荟新取证楼栋备案价与各户型成交、杨春湖板块二手房成交、洪山区与武汉市新房/二手房均价变化（涉及价格必须注明口径：备案价、成交价还是挂牌价，归入「开发进展」分类）；",
          "7) 施工进展：承建方中建八局发布的工程节点（封顶、外立面、交付筹备等）。",
          "要求：优先政府官网（hongshan.gov.cn、武汉地铁、医院/学校官方）与主流媒体，售楼宣传稿只作补充；每条信息必须带真实可打开的来源链接（逐字复制搜索结果给出的完整 URL，不要拼造）；摘要用中文、只写来源能证实的事实，剔除售楼电话与营销话术；日期只写来源明确给出的发布日期，没有就留空；分类只能是：开发进展、商业、交通、教育医疗、生态文旅、片区规划。找到 5-12 条有价值的新信息后，调用本空间的 saveFeedItems 动作一次性保存。",
        ].join("\n"),
        { expectsAction: "saveFeedItems", dedupeKey: "tianhui-daily-refresh" },
      );
      if (!result.ok) {
        await db.insert(schema.refreshLogs).values({
          status: "failed",
          message: result.error,
        });
        return { started: false, message: "刷新任务启动失败，请稍后再试。" };
      }
      ctx.invalidateQueries();
      return {
        started: true,
        message: "已开始检索最新动态，新内容通常在几分钟内出现在动态流中。",
      };
    },
  }),

  saveFeedItems: defineAction({
    description:
      "Saves researched feed items from the refresh task. Dedupes by source URL and records a refresh log.",
    request: z.object({
      items: z
        .array(
          z.object({
            title: z.string().min(4).max(200),
            category: z.enum([
              "开发进展",
              "商业",
              "交通",
              "教育医疗",
              "生态文旅",
              "片区规划",
            ]),
            summary: z.string().min(10).max(1200),
            sourceName: z.string().min(1).max(120),
            sourceUrl: z.string().url().max(1000),
            publishedDate: z.string().max(10).nullable().optional(),
          }),
        )
        .min(1)
        .max(20),
    }),
    response: z.object({ inserted: z.number(), skipped: z.number() }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const urls = args.items.map((i) => i.sourceUrl);
      const existing = await db
        .select({ sourceUrl: schema.feedItems.sourceUrl })
        .from(schema.feedItems)
        .where(inArray(schema.feedItems.sourceUrl, urls));
      const existingUrls = new Set(existing.map((r) => r.sourceUrl));
      let inserted = 0;
      let skipped = 0;
      for (const item of args.items) {
        if (existingUrls.has(item.sourceUrl)) {
          skipped += 1;
          continue;
        }
        await db.insert(schema.feedItems).values({
          title: item.title,
          category: item.category,
          summary: item.summary,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          publishedDate: item.publishedDate ?? null,
        });
        existingUrls.add(item.sourceUrl);
        inserted += 1;
      }
      await db.insert(schema.refreshLogs).values({
        status: "saved",
        message: `新增 ${inserted} 条，跳过重复 ${skipped} 条`,
      });
      ctx.invalidateQueries();
      return { inserted, skipped };
    },
  }),

  exportStaticSite: defineAction({
    description:
      "Freezes all current display content (overview, feed, prices by unit type, map pins/polygons, timeline, archive, site photos) into a self-contained read-only static website under static-site/ (text files only, images base64-embedded) for direct deployment or the daily GitHub sync.",
    request: z.object({}),
    response: exportStaticSiteResponse,
    privileged: [privileged.writeStaticSite],
    async handler(ctx): Promise<z.infer<typeof exportStaticSiteResponse>> {
      const db = ctx.db<typeof schema>();
      const bmRows = await db.select().from(schema.bookmarks);
      const bookmarkedIds = new Set(bmRows.map((b) => b.feedItemId));
      const rows = await db
        .select()
        .from(schema.feedItems)
        .orderBy(desc(schema.feedItems.id))
        .limit(200);
      rows.sort((a, b) => {
        const da = a.publishedDate ?? "";
        const dbd = b.publishedDate ?? "";
        if (da !== dbd) return dbd.localeCompare(da);
        return b.id - a.id;
      });
      const now = new Date();
      const feedItems = rows
        .slice(0, 100)
        .map((r) => toFeedItem(r, bookmarkedIds, maxFetchedAtOf(rows), now));
      const logs = await db
        .select()
        .from(schema.refreshLogs)
        .orderBy(desc(schema.refreshLogs.id))
        .limit(1);
      const snapshotText = now.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      });
      const payload = {
        snapshotAt: now.toISOString(),
        snapshotText,
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
        weather: await fetchWeather(),
        evaluation: EVALUATION,
        feedItems,
        feedCount: rows.length,
        bookmarkCount: bmRows.length,
        lastRefreshAt: logs[0]
          ? logs[0].createdAt.toLocaleString("zh-CN", {
              timeZone: "Asia/Shanghai",
              hour12: false,
            })
          : null,
      };
      const result = await ctx.executePrivileged(privileged.writeStaticSite, {
        spaceDir: ctx.spaceDir,
        snapshotAt: now.toISOString(),
        payloadJson: JSON.stringify(payload),
      });
      return result;
    },
  }),
} satisfies ActionsModule;
