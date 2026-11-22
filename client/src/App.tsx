import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
Bar,
BarChart,
CartesianGrid,
LabelList,
Legend,
Line,
LineChart,
ResponsiveContainer,
Tooltip,
XAxis,
YAxis,
} from "recharts";
import { api, type ApiResponse } from "./api";
import { actionFields } from "@hatch/space-sdk/fields" with { type: "macro" };
import type { Actions } from "../../server/src/actions";

const FIELDS = actionFields<typeof Actions>();
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// MapLibre spawns a module worker from a URL, but its worker ships as a
// separate dist file that this artifact's single-bundle build cannot serve.
// The worker source is a self-contained bundle (no imports), so import it
// as text and register a Blob URL for it.
import mapWorkerSource from "maplibre-gl/dist/maplibre-gl-worker.mjs" with { type: "text" };

maplibregl.setWorkerUrl(
  URL.createObjectURL(new Blob([mapWorkerSource], { type: "text/javascript" })),
);
import { mapsDirectionsUrl } from "./map_helpers.mjs";
import mapStaticImg from "./assets/map-static.png";
import siteAerialImg from "./assets/site-aerial-202603.png";
import siteSampleImg from "./assets/site-sample-202603.png";
import siteVisitImg from "./assets/site-visit-202603.jpg";

type Overview = ApiResponse<typeof api, "getOverview">;
type Project = Overview["project"];
type Place = Overview["places"][number];
type Milestone = Overview["milestones"][number];
type FeedItem = ApiResponse<typeof api, "listFeed">["items"][number];
type Note = ApiResponse<typeof api, "listNotes">["notes"][number];
type Prices = Overview["prices"];
type UnitType = Prices["unitTypes"][number];
type ProjectPin = Overview["projectPin"];
type MetroLine = Overview["metroLines"][number];
type SitePhotos = Overview["sitePhotos"];
type Weather = NonNullable<Overview["weather"]>;
type Evaluation = Overview["evaluation"];

/* WGS-84 → GCJ-02 conversion. All stored coordinates in this artifact are
   verified WGS-84, but the 高德 (AutoNavi) base tiles are GCJ-02, so every
   coordinate handed to MapLibre (pins, polygon vertices, map center,
   flyTo targets) is converted at render time only. Stored data and any
   displayed distance/coordinate text stay in the original WGS-84. */
const GCJ_PI = Math.PI;
const GCJ_A = 6378245.0;
const GCJ_EE = 0.00669342162296594323;

function gcjOutOfChina(lng: number, lat: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}
function gcjTransformLat(x: number, y: number): number {
  let ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * GCJ_PI) + 20 * Math.sin(2 * x * GCJ_PI)) * 2) / 3;
  ret += ((20 * Math.sin(y * GCJ_PI) + 40 * Math.sin((y / 3) * GCJ_PI)) * 2) / 3;
  ret += ((160 * Math.sin((y / 12) * GCJ_PI) + 320 * Math.sin((y * GCJ_PI) / 30)) * 2) / 3;
  return ret;
}
function gcjTransformLng(x: number, y: number): number {
  let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * GCJ_PI) + 20 * Math.sin(2 * x * GCJ_PI)) * 2) / 3;
  ret += ((20 * Math.sin(x * GCJ_PI) + 40 * Math.sin((x / 3) * GCJ_PI)) * 2) / 3;
  ret += ((150 * Math.sin((x / 12) * GCJ_PI) + 300 * Math.sin((x / 30) * GCJ_PI)) * 2) / 3;
  return ret;
}
function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  if (gcjOutOfChina(lng, lat)) return [lng, lat];
  let dLat = gcjTransformLat(lng - 105, lat - 35);
  let dLng = gcjTransformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * GCJ_PI;
  let magic = Math.sin(radLat);
  magic = 1 - GCJ_EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic)) * GCJ_PI);
  dLng = (dLng * 180) / ((GCJ_A / sqrtMagic) * Math.cos(radLat) * GCJ_PI);
  return [lng + dLng, lat + dLat];
}

/* Client-side fallback for the header weather: when the server could not
   reach Open-Meteo (weather === null), the browser fetches it directly
   (Open-Meteo allows CORS). Same WMO-code wording as the server. */
function weatherTextClient(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "晴", icon: "☀️" };
  if (code === 1) return { label: "晴间多云", icon: "🌤️" };
  if (code === 2) return { label: "多云", icon: "⛅" };
  if (code === 3) return { label: "阴", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "雾", icon: "🌫️" };
  if (code === 51 || code === 53 || code === 55) return { label: "毛毛雨", icon: "🌦️" };
  if (code === 56 || code === 57) return { label: "冻毛毛雨", icon: "🌦️" };
  if (code === 61) return { label: "小雨", icon: "🌧️" };
  if (code === 63) return { label: "中雨", icon: "🌧️" };
  if (code === 65) return { label: "大雨", icon: "🌧️" };
  if (code === 66 || code === 67) return { label: "冻雨", icon: "🌧️" };
  if (code === 71) return { label: "小雪", icon: "🌨️" };
  if (code === 73) return { label: "中雪", icon: "🌨️" };
  if (code === 75) return { label: "大雪", icon: "🌨️" };
  if (code === 77) return { label: "雪粒", icon: "🌨️" };
  if (code === 80 || code === 81) return { label: "阵雨", icon: "🌦️" };
  if (code === 82) return { label: "暴雨", icon: "🌧️" };
  if (code === 85 || code === 86) return { label: "阵雪", icon: "🌨️" };
  if (code === 95) return { label: "雷阵雨", icon: "⛈️" };
  if (code === 96 || code === 99) return { label: "雷阵雨伴冰雹", icon: "⛈️" };
  return { label: "天气未知", icon: "🌡️" };
}

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=30.6092&longitude=114.4015" +
  "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
  "&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=1";

/* Header weather date label from Open-Meteo's current.time
   (e.g. "2026-11-22T02:45" → "11月22日"); falls back to today's
   Asia/Shanghai date when the observation time is missing. */
function weatherDateLabelClient(observedAt: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(observedAt);
  if (m) return `${Number(m[2])}月${Number(m[3])}日`;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
  }).format(new Date());
}

function fmtPrice(n: number): string {
  return n.toLocaleString("zh-CN");
}

function pctChange(from: number, to: number): string {
  const v = ((to - from) / from) * 100;
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--text)",
  fontSize: "12px",
} as const;

const FEED_CATEGORIES = ["全部", "开发进展", "商业", "交通", "教育医疗", "生态文旅", "片区规划", "收藏"];
const PLACE_CATEGORIES = ["全部", "交通", "商业", "教育", "医疗", "生态文旅"];

function daysUntil(dateText: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (!m) return null;
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function statusStyle(status: string): string {
  if (status === "已运营") return "bg-[var(--accent-soft)] text-[var(--accent)]";
  if (status === "在建") return "bg-[var(--amber-soft)] text-[var(--amber)]";
  return "bg-[var(--surface-alt)] text-[var(--dim)]";
}

/* Freshness tags for catalog places: 新增 when addedOn is within 14 days,
   更新 when updatedOn is (addedOn wins when both qualify). Dates are
   YYYY-MM-DD catalog maintenance dates from server/src/data.ts. */
function daysSinceDateText(dateText: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (!m) return null;
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - target.getTime()) / 86400000);
}

function placeFreshKind(p: {
  addedOn: string | null;
  updatedOn: string | null;
}): "new" | "updated" | null {
  if (p.addedOn) {
    const d = daysSinceDateText(p.addedOn);
    if (d !== null && d >= 0 && d <= 14) return "new";
  }
  if (p.updatedOn) {
    const d = daysSinceDateText(p.updatedOn);
    if (d !== null && d >= 0 && d <= 14) return "updated";
  }
  return null;
}

function FreshTag({ kind }: { kind: "new" | "updated" }) {
  return (
    <span className={`fresh-tag fresh-tag--${kind === "new" ? "new" : "updated"}`}>
      {kind === "new" ? "新增" : "更新"}
    </span>
  );
}

function categoryStyle(category: string): string {
  switch (category) {
    case "交通":
      return "bg-[var(--amber-soft)] text-[var(--amber)]";
    case "商业":
      return "bg-[var(--brick-soft)] text-[var(--brick)]";
    case "开发进展":
      return "bg-[var(--accent-soft)] text-[var(--accent)]";
    default:
      return "bg-[var(--surface-alt)] text-[var(--dim)]";
  }
}

function PulseHeader({
  project,
  feedCount,
  weather,
}: {
  project: Project;
  feedCount: number;
  weather: Weather | null;
}) {
  const days = daysUntil("2027-06-30");
  const [fallbackWeather, setFallbackWeather] = useState<Weather | null>(null);

  /* Server weather missing → try Open-Meteo straight from the browser. */
  useEffect(() => {
    if (weather !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(OPEN_METEO_URL);
        if (!res.ok) return;
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
          !cancelled &&
          cur &&
          typeof cur.temperature_2m === "number" &&
          typeof cur.weather_code === "number" &&
          typeof high === "number" &&
          typeof low === "number"
        ) {
          const t = weatherTextClient(cur.weather_code);
          setFallbackWeather({
            tempC: cur.temperature_2m,
            code: cur.weather_code,
            label: t.label,
            icon: t.icon,
            highC: high,
            lowC: low,
            humidity: cur.relative_humidity_2m ?? 0,
            windKmh: cur.wind_speed_10m ?? 0,
            observedAt: cur.time ?? "",
            dateLabel: weatherDateLabelClient(cur.time ?? ""),
          });
        }
      } catch {
        /* weather stays hidden — it must never break the header */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weather]);

  const w = weather ?? fallbackWeather;
  const anchors = [
    { label: "地铁 4 号线工业四路站", value: "177 米" },
    { label: "武汉站（高铁）", value: "1.5 公里" },
    { label: "东湖", value: "700 米" },
    { label: "武汉小学华侨城分校", value: "493 米" },
  ];
  return (
    <header className="border-b-2 border-[var(--text)] pb-5">
      <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)]">
            武汉 · 洪山 · 杨春湖高铁商务区（东湖新城）
          </p>
          <h1 className="font-display mt-2 text-4xl font-black leading-tight text-[var(--text)]">
            华侨城·天荟
          </h1>
          <p className="mt-1 text-sm text-[var(--dim)]">{project.address} · {project.developer}</p>
        </div>
        {w && (
          <div className="shrink-0 text-left sm:pt-5 sm:text-right" aria-label="项目所在地当前天气">
            <p className="font-display text-xl font-bold leading-tight text-[var(--text)]">
              <span aria-hidden>{w.icon}</span> {w.label}{" "}
              <span className="tabular-nums text-[var(--accent)]">{Math.round(w.tempC)}°C</span>
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-[var(--dim)]">
              {w.dateLabel} {Math.round(w.lowC)}~{Math.round(w.highC)}°C · 湿度 {Math.round(w.humidity)}% · 风{" "}
              {Math.round(w.windKmh)} km/h
            </p>
            <p className="mt-0.5 text-xs text-[var(--dim)]">项目所在地天气 · Open-Meteo</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div>
          <span className="font-display text-3xl font-bold tabular-nums text-[var(--brick)]">
            {days !== null && days > 0 ? days : "—"}
          </span>
          <span className="ml-1 text-sm text-[var(--dim)]">天后 · 一期预计交付（2027-06-30）</span>
        </div>
        <div className="text-sm text-[var(--dim)]">
          已收录动态 <span className="font-bold tabular-nums text-[var(--text)]">{feedCount}</span> 条 · 每日更新
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
        {anchors.map((a) => (
          <div key={a.label} className="bg-[var(--surface)] px-3 py-3">
            <dd className="font-display text-xl font-bold tabular-nums text-[var(--accent)]">{a.value}</dd>
            <dt className="mt-0.5 text-xs text-[var(--dim)]">{a.label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-[var(--dim)]">距离均为公开资料直线距离参考，实际通行以路况与官方测量为准。</p>
    </header>
  );
}

function FeedSection() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("全部");
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const feed = useQuery({
    queryKey: ["feed", category],
    queryFn: () => api.listFeed({ category, limit: 50 }),
  });

  const bookmark = useMutation({
    mutationFn: async (item: FeedItem) =>
      await api.toggleBookmark({ feedItemId: item.id, bookmarked: !item.bookmarked }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  const refresh = useMutation({
    mutationFn: async () => await api.refreshFeed({}),
    onSuccess: (res) => setRefreshMsg(res.message),
    onError: () => setRefreshMsg("刷新启动失败，请稍后再试。"),
  });

  const populate = useMutation({
    mutationFn: async () => await api.populateInitial({}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  return (
    <section aria-label="最新动态" className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-[var(--text)]">最新动态</h2>
        <button
          type="button"
          aria-label="刷新最新动态"
          disabled={refresh.isPending}
          onClick={() => refresh.mutate()}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {refresh.isPending ? "正在启动…" : "↻ 刷新动态"}
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--dim)]">带「新增」标记的为最近一次刷新加入的动态。</p>
      {refreshMsg && <p className="mt-2 text-sm text-[var(--accent)]">{refreshMsg}</p>}

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="动态分类筛选">
        {FEED_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`筛选动态：${c}`}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              category === c
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--dim)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {feed.isPending && <p className="mt-6 text-sm text-[var(--dim)]">正在加载动态…</p>}
      {feed.error && <p className="mt-6 text-sm text-[var(--brick)]">动态加载失败，请下拉重试。</p>}
      {feed.data && feed.data.items.length === 0 && (
        <div className="mt-6 rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-center">
          <p className="text-sm text-[var(--dim)]">
            {category === "收藏"
              ? "还没有收藏的动态。点动态右上角的「收藏」，把要紧的进展留在这里。"
              : "动态流还是空的。先载入已核实的片区动态，或点「刷新动态」检索最新消息。"}
          </p>
          {category !== "收藏" && (
            <button
              type="button"
              aria-label="载入已核实的片区动态"
              disabled={populate.isPending}
              onClick={() => populate.mutate()}
              className="mt-3 rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent)] disabled:opacity-50"
            >
              {populate.isPending ? "载入中…" : "载入已核实动态"}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {feed.data?.items.map((item) => (
          <article
            key={item.id}
            className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 ${item.freshness === "new" ? "feed-fresh" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyle(item.category)}`}>
                  {item.category}
                </span>
                <span className="text-xs tabular-nums text-[var(--dim)]">
                  {item.publishedDate ?? "日期见原文"}
                </span>
              </div>
              <button
                type="button"
                aria-label={item.bookmarked ? `取消收藏：${item.title}` : `收藏：${item.title}`}
                aria-pressed={item.bookmarked}
                disabled={bookmark.isPending}
                onClick={() => bookmark.mutate(item)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                  item.bookmarked
                    ? "border-[var(--amber)] bg-[var(--amber-soft)] text-[var(--amber)]"
                    : "border-[var(--border)] text-[var(--dim)]"
                }`}
              >
                {item.bookmarked ? "★ 已收藏" : "☆ 收藏"}
              </button>
            </div>
            <h3 className="mt-2 flex flex-wrap items-center gap-2 text-base font-bold leading-snug text-[var(--text)]">
              <span>{item.title}</span>
              {item.freshness === "new" && <FreshTag kind="new" />}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--dim)]">{item.summary}</p>
            <p className="mt-2 text-xs text-[var(--dim)]">
              来源：{item.sourceName} ·{" "}
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`打开原文：${item.title}`}
                className="text-[var(--accent)] underline underline-offset-2"
              >
                查看原文
              </a>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelineSection({ milestones }: { milestones: Milestone[] }) {
  return (
    <section aria-label="片区大事时间线" className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">片区大事 · 时间线</h2>
      <ol className="mt-4 space-y-0">
        {milestones.map((m, i) => (
          <li key={`${m.dateText}-${m.title}`} className="relative flex gap-4 pb-5 last:pb-0">
            {i < milestones.length - 1 && (
              <span aria-hidden className="absolute left-[5px] top-4 h-full w-px bg-[var(--border)]" />
            )}
            <span
              aria-hidden
              className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 ${
                m.future
                  ? "border-[var(--brick)] bg-[var(--surface)]"
                  : "border-[var(--accent)] bg-[var(--accent)]"
              }`}
            />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold tabular-nums text-[var(--text)]">{m.dateText}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${categoryStyle(m.category)}`}>{m.category}</span>
                {m.future && <span className="text-xs font-medium text-[var(--brick)]">预计</span>}
              </p>
              <h3 className="mt-0.5 text-base font-bold text-[var(--text)]">{m.title}</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--dim)]">{m.description}</p>
              <a
                href={m.sourceUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`时间线来源：${m.title}`}
                className="inline-block py-1 text-xs text-[var(--accent)] underline underline-offset-2"
              >
                来源
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ArchiveSection({ project }: { project: Project }) {
  const rows: Array<[string, string]> = [
    ["位置", `${project.address}（${project.district}）`],
    ["四至", project.boundaries],
    ["开发商", project.developer],
    ["承建 / 物业", `${project.builder} / ${project.property}`],
    ["地块", project.landParcel],
    ["拿地", project.landDeal],
    ["占地 / 建面", `${project.landArea} / ${project.gfa}`],
    ["容积率 / 绿化率", `${project.far} / ${project.greenRate}`],
    ["户数 / 车位", `${project.units} / ${project.parking}`],
    ["产品", project.product],
    ["一期", project.phase1],
    ["二期", project.phase2],
    ["首开", project.firstOpen],
    ["交付", project.delivery],
  ];
  return (
    <section aria-label="项目档案" className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">项目档案</h2>
      <dl className="mt-4 divide-y divide-[var(--border)] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[92px_1fr] gap-3 px-4 py-3">
            <dt className="text-sm font-medium text-[var(--dim)]">{k}</dt>
            <dd className="text-sm leading-relaxed text-[var(--text)]">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 rounded-[var(--radius)] border border-[var(--brick)] bg-[var(--brick-soft)] p-4">
        <h3 className="text-sm font-bold text-[var(--brick)]">看房提醒（不利因素）</h3>
        <p className="mt-1 text-sm leading-relaxed text-[var(--text)]">{project.caveats}</p>
      </div>
      <p className="mt-2 text-xs text-[var(--dim)]">
        档案来源：
        {project.sourceUrls.map((u, i) => (
          <span key={u}>
            {i > 0 && "、"}
            <a
              href={u}
              target="_blank"
              rel="noreferrer"
              aria-label={`项目档案来源 ${i + 1}`}
              className="py-1 text-[var(--accent)] underline underline-offset-2"
            >
              资料 {i + 1}
            </a>
          </span>
        ))}
        。不同口径数字有出入处已在文中注明。
      </p>
    </section>
  );
}

function UnitTrendChart({ unit }: { unit: UnitType }) {
  if (unit.trend.length === 0) return null;
  return (
    <div className="mt-3" role="img" aria-label={`${unit.label}价格走势图`}>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={unit.trend} margin={{ top: 18, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
          <YAxis
            domain={["dataMin - 1200", "dataMax + 1200"]}
            tick={{ fontSize: 11, fill: "var(--dim)" }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: unknown) => [`${fmtPrice(Number(value))} 元/㎡`, "单价"]}
            labelFormatter={(label: unknown, payload: unknown) => {
              const p = (payload as Array<{ payload?: { dateText?: string; kind?: string } }>)?.[0]?.payload;
              return `${String(label)}（${p?.dateText ?? ""} · ${p?.kind ?? ""}口径）`;
            }}
          />
          <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--accent)" }} connectNulls={false}>
            <LabelList dataKey="price" position="top" formatter={(v: unknown) => fmtPrice(Number(v))} style={{ fontSize: 11, fill: "var(--text)", fontWeight: 700 }} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PriceSection({ prices }: { prices: Prices }) {
  const [unitId, setUnitId] = useState<string>("b128");
  const unit = prices.unitTypes.find((u) => u.id === unitId) ?? prices.unitTypes[0];
  if (!unit) return null;
  const filingData = prices.unitTypes.filter((u) => u.filingAvg !== null);
  const refChange = pctChange(prices.firstOpenAvg, prices.currentRef);

  const tiles = [
    { label: "天荟当前参考均价", value: prices.currentRef, note: `${prices.currentRefNote}；较首开 ${refChange}` },
    { label: "天荟首开均价", value: prices.firstOpenAvg, note: "2025-07-11 首开 · 销售口径" },
    { label: "天荟四房成交均价", value: prices.fourRoomDealAvg, note: "2026-09 克而瑞四房榜 · 45 套成交口径" },
    { label: "杨春湖板块二手成交均价", value: prices.sectorDealAvg, note: "2026-09 · 21 个小区 107 套成交口径" },
  ];

  return (
    <section aria-label="房价走势" className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">房价走势</h2>
      <p className="mt-1 text-sm text-[var(--dim)]">
        数据截至 {prices.asOf}。先分清口径：<strong className="text-[var(--text)]">备案价</strong>是房管部门备案价、<strong className="text-[var(--text)]">在售价</strong>是售楼处报价、<strong className="text-[var(--text)]">成交价</strong>是实际网签统计、<strong className="text-[var(--text)]">挂牌价</strong>是二手房源报价——四者不能直接混比，每张图都标了口径。
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--border)] lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-[var(--surface)] px-3 py-3">
            <dd className="font-display text-xl font-bold tabular-nums text-[var(--accent)]">
              {fmtPrice(t.value)} <span className="text-xs font-normal text-[var(--dim)]">元/㎡</span>
            </dd>
            <dt className="mt-0.5 text-xs font-medium text-[var(--text)]">{t.label}</dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-[var(--dim)]">{t.note}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-base font-bold text-[var(--text)]">分户型走势</h3>
      <p className="mt-1 text-sm text-[var(--dim)]">点户型看它自己的价格路径：从备案价，到在售价，再到四房整体成交参考。</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="选择户型">
        {prices.unitTypes.map((u) => (
          <button
            key={u.id}
            type="button"
            aria-label={`查看户型房价：${u.label}`}
            aria-pressed={unit.id === u.id}
            onClick={() => setUnitId(u.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              unit.id === u.id
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--dim)]"
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      <article className="mt-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-base font-bold text-[var(--text)]">{unit.label}</h4>
          <p className="text-xs text-[var(--dim)]">{unit.building}</p>
        </div>
        <p className="mt-1 text-sm text-[var(--dim)]">
          {unit.rooms} · 得房率 {unit.efficiency}
        </p>
        {unit.trend.length > 0 ? (
          <UnitTrendChart unit={unit} />
        ) : (
          <p className="mt-3 rounded-[var(--radius)] bg-[var(--surface-alt)] p-3 text-sm text-[var(--dim)]">
            该户型尚未取证，暂无价格数据。取证备案后这里会补上它的走势。
          </p>
        )}
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="shrink-0 font-medium text-[var(--dim)]">备案价</dt>
            <dd className="text-[var(--text)]">
              {unit.filingAvg !== null ? (
                <>
                  {fmtPrice(unit.filingAvg)} 元/㎡ · 按备案均价 × 建面估算总价约 {((unit.filingAvg * unit.area) / 10000).toFixed(1)} 万元
                  <span className="text-[var(--dim)]">（{unit.filingNote}）</span>
                </>
              ) : (
                unit.filingNote
              )}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="shrink-0 font-medium text-[var(--dim)]">在售总价</dt>
            <dd className="text-[var(--text)]">
              {unit.saleTotalFromWan !== null ? `约 ${unit.saleTotalFromWan} 万元起（售楼处口径）` : "暂无公开数据，以一房一价公示为准"}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{unit.note}</p>
      </article>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-bold text-[var(--text)]">各户型备案价对比</h3>
          <p className="mt-1 text-xs text-[var(--dim)]">2025-07 首次取证（武房开预售〔2025〕193 号）备案均价，元/㎡。</p>
          <div className="mt-2" role="img" aria-label="各户型备案均价柱状图">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filingData} margin={{ top: 18, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} interval={0} />
                <YAxis domain={[0, "dataMax + 3000"]} tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: unknown) => [`${fmtPrice(Number(value))} 元/㎡`, "备案均价"]} />
                <Bar dataKey="filingAvg" fill="var(--amber)" radius={[4, 4, 0, 0]} maxBarSize={56}>
                  <LabelList dataKey="filingAvg" position="top" formatter={(v: unknown) => fmtPrice(Number(v))} style={{ fontSize: 11, fill: "var(--text)", fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs leading-relaxed text-[var(--dim)]">同为 128㎡，4# 小高层（10 层、一梯两户）备案价比 3# 超高层高出约 4,200 元/㎡，是低密与瞰湖资源的溢价。</p>
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--text)]">天荟整体价格节点</h3>
          <p className="mt-1 text-xs text-[var(--dim)]">在售/参考口径（线）与成交口径（单点）分开画，不连成一条线。</p>
          <div className="mt-2" role="img" aria-label="天荟整体价格节点图">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={prices.projectTrend} margin={{ top: 18, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} interval={0} />
                <YAxis domain={["dataMin - 1200", "dataMax + 1200"]} tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: unknown, name: unknown) => [`${fmtPrice(Number(value))} 元/㎡`, String(name)]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="asking" name="在售/参考均价" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--accent)" }} connectNulls={false}>
                  <LabelList dataKey="asking" position="top" formatter={(v: unknown) => (v === null || v === undefined ? "" : fmtPrice(Number(v)))} style={{ fontSize: 11, fill: "var(--text)", fontWeight: 700 }} />
                </Line>
                <Line type="monotone" dataKey="deal" name="成交均价（四房）" stroke="var(--brick)" strokeWidth={0} dot={{ r: 5, fill: "var(--brick)" }} connectNulls={false}>
                  <LabelList dataKey="deal" position="bottom" formatter={(v: unknown) => (v === null || v === undefined ? "" : fmtPrice(Number(v)))} style={{ fontSize: 11, fill: "var(--brick)", fontWeight: 700 }} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs leading-relaxed text-[var(--dim)]">
            从首开 13,500 到当前平台参考 12,500，在售口径回落 {refChange.replace("-", "")}（{refChange}）；而 2026-09 四房实际成交均价 11,444 元/㎡，比参考价再低约一成——看房时以成交口径谈价更实在。
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-bold text-[var(--text)]">洪山区新房均价 · 2025 年月度</h3>
          <p className="mt-1 text-xs text-[var(--dim)]">58 爱房综合计算口径，全年均价 {fmtPrice(prices.hongshanYearAvg2025)} 元/㎡。</p>
          <div className="mt-2" role="img" aria-label="洪山区2025年新房月度均价走势图">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={prices.hongshanMonthly2025} margin={{ top: 18, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} interval={1} />
                <YAxis domain={["dataMin - 300", "dataMax + 300"]} tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: unknown) => [`${fmtPrice(Number(value))} 元/㎡`, "洪山新房均价"]} />
                <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs leading-relaxed text-[var(--dim)]">洪山新房均价 2025 年大半年在 17,915–18,146 元/㎡窄幅波动——但这个均价被街道口、关山等高价板块抬高，杨春湖板块明显低于全区均价。</p>
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--text)]">杨春湖畔二手房挂牌走势</h3>
          <p className="mt-1 text-xs text-[var(--dim)]">{prices.yangchunhuListingNote}</p>
          <div className="mt-2" role="img" aria-label="杨春湖畔二手房挂牌均价走势图">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={prices.yangchunhuListing} margin={{ top: 18, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} interval={1} />
                <YAxis domain={["dataMin - 600", "dataMax + 600"]} tick={{ fontSize: 11, fill: "var(--dim)" }} tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value: unknown, _name: unknown, item: unknown) => {
                    const approx = (item as { payload?: { approx?: boolean } })?.payload?.approx;
                    return [`${approx ? "约 " : ""}${fmtPrice(Number(value))} 元/㎡`, "挂牌均价"];
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="var(--brick)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--brick)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs leading-relaxed text-[var(--dim)]">{prices.sectorDealNote}</p>
        </div>
      </div>

      <h3 className="mt-6 text-base font-bold text-[var(--text)]">周边二手房：挂牌价 vs 成交价</h3>
      <div className="mt-3 overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-alt)] text-left text-xs text-[var(--dim)]">
              <th scope="col" className="px-3 py-2 font-medium">小区</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">挂牌均价</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">成交均价</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">成交低于挂牌</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {prices.neighbors.map((n) => (
              <tr key={n.name}>
                <th scope="row" className="px-3 py-2.5 text-left font-medium text-[var(--text)]">{n.name}</th>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--dim)]">{fmtPrice(n.listing)}</td>
                <td className="px-3 py-2.5 text-right font-bold tabular-nums text-[var(--text)]">{fmtPrice(n.deal)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--brick)]">{pctChange(n.listing, n.deal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--dim)]">
        单位：元/㎡。周边次新小区成交价普遍比挂牌价低三到四成——挂牌价只是业主要价，判断片区真实价格要看成交口径。这也意味着天荟交付后进入二手市场时，要面对 1.1 万元/㎡上下的片区成交价环境。
      </p>

      <h3 className="mt-6 text-base font-bold text-[var(--text)]">武汉 / 洪山最新市场快照</h3>
      <ul className="mt-3 divide-y divide-[var(--border)] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
        {prices.market.map((m) => (
          <li key={`${m.label}-${m.dateText}`} className="flex flex-wrap items-baseline gap-x-3 px-4 py-3">
            <span className="text-sm font-medium text-[var(--text)]">{m.label}</span>
            <span className="text-xs tabular-nums text-[var(--dim)]">{m.dateText}</span>
            <span className="ml-auto font-display text-lg font-bold tabular-nums text-[var(--accent)]">{fmtPrice(m.value)} 元/㎡</span>
            <span className="w-full text-xs leading-relaxed text-[var(--dim)]">{m.note}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-[var(--dim)]">
        价格来源：
        {prices.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && "、"}
            <a href={s.url} target="_blank" rel="noreferrer" aria-label={`房价来源：${s.name}`} className="py-1 text-[var(--accent)] underline underline-offset-2">
              {s.name}
            </a>
          </span>
        ))}
        。房价受楼层、朝向、装修与网签节奏影响波动较大，本页数据仅供跟踪参考，不构成购房建议；最终以房管部门备案与售楼处一房一价公示为准。
      </p>
    </section>
  );
}

type MapIconDef = { glyph: string; typeLabel: string };

/* The glyph encodes the place TYPE; the pin/badge color encodes the STATUS
   (see statusKey + the .pin--st-* rules in theme.css): 已运营 green,
   在建 amber, 规划中 slate. */
function mapIconFor(p: { category: string; label: string }): MapIconDef {
  if (p.category === "项目") return { glyph: "🏠", typeLabel: "本项目" };
  if (p.label.includes("武汉站（高铁）")) return { glyph: "🚄", typeLabel: "高铁站" };
  if (p.label.includes("公交")) return { glyph: "🚌", typeLabel: "公交站" };
  if (p.label.includes("大道")) return { glyph: "🛣️", typeLabel: "主干道" };
  if (p.category === "交通") return { glyph: "🚇", typeLabel: "地铁站" };
  if (p.category === "教育") return { glyph: "🎓", typeLabel: "学校" };
  if (p.label.includes("社区商业")) return { glyph: "🏪", typeLabel: "社区商业" };
  if (p.category === "商业") return { glyph: "🛍️", typeLabel: "购物中心" };
  if (p.category === "医疗") return { glyph: "🏥", typeLabel: "医院" };
  if (p.label.includes("欢乐谷")) return { glyph: "🎡", typeLabel: "主题乐园" };
  if (p.label.includes("湖")) return { glyph: "🌊", typeLabel: "湖泊公园" };
  if (p.category === "生态文旅") return { glyph: "🌳", typeLabel: "公园绿地" };
  return { glyph: "📍", typeLabel: p.category };
}

function statusKey(status: string): "open" | "building" | "planned" {
  if (status === "在建") return "building";
  if (status === "规划中") return "planned";
  return "open";
}

const STATUS_COLORS: Record<string, string> = {
  open: "#059669",
  building: "#d97706",
  planned: "#64748b",
};

type PinPlace = {
  key: string;
  label: string;
  category: string;
  status: string;
  note: string;
  pinNote: string | null;
  distanceText: string | null;
  lat: number;
  lng: number;
  polygon: [number, number][] | null;
  addedOn: string | null;
  updatedOn: string | null;
};

/* DOM content for the MapLibre popup anchored to a pin. Built with DOM APIs
   (not innerHTML) so place text is inserted as text nodes. Styled by the
   .ml-popup rules in theme.css. */
function buildPopupEl(p: PinPlace, def: MapIconDef): HTMLDivElement {
  const root = document.createElement("div");

  const head = document.createElement("div");
  head.className = "ml-popup-head";
  const badge = document.createElement("span");
  badge.className = `map-badge map-badge--st-${statusKey(p.status)}`;
  badge.setAttribute("aria-hidden", "true");
  badge.textContent = def.glyph;
  const titleWrap = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "ml-popup-title";
  title.textContent = p.label;
  const chips = document.createElement("p");
  chips.className = "ml-popup-chips";
  const freshKind = placeFreshKind(p);
  if (freshKind) {
    const tag = document.createElement("span");
    tag.className = `fresh-tag fresh-tag--${freshKind === "new" ? "new" : "updated"}`;
    tag.textContent = freshKind === "new" ? "新增" : "更新";
    chips.append(tag);
  }
  const chipTexts = [def.typeLabel, `● ${p.status}`, ...(p.distanceText ? [p.distanceText] : [])];
  for (const t of chipTexts) {
    const chip = document.createElement("span");
    chip.className = "ml-popup-chip";
    chip.textContent = t;
    chips.append(chip);
  }
  titleWrap.append(title, chips);
  head.append(badge, titleWrap);
  root.append(head);

  const note = document.createElement("p");
  note.className = "ml-popup-note";
  note.textContent = p.note;
  root.append(note);

  if (p.pinNote) {
    const pinNote = document.createElement("p");
    pinNote.className = "ml-popup-pinnote";
    pinNote.textContent = `图钉说明：${p.pinNote}`;
    root.append(pinNote);
  }

  const dirUrl = mapsDirectionsUrl({ label: p.label, lat: p.lat, lng: p.lng });
  if (dirUrl) {
    const link = document.createElement("a");
    link.className = "ml-popup-link";
    link.href = dirUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", `导航到：${p.label}`);
    link.textContent = "导航到这里 →";
    root.append(link);
  }
  return root;
}

/* DOM content for the MapLibre popup shown when a metro line is clicked.
   Same .ml-popup styling as the pin popup; the badge ring uses the line's
   official colour. Clicking a line never touches the list below the map. */
function buildMetroPopupEl(line: MetroLine): HTMLDivElement {
  const root = document.createElement("div");

  const head = document.createElement("div");
  head.className = "ml-popup-head";
  const badge = document.createElement("span");
  badge.className = "map-badge";
  badge.style.borderColor = line.color;
  badge.setAttribute("aria-hidden", "true");
  badge.textContent = "🚇";
  const titleWrap = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "ml-popup-title";
  title.textContent = line.name;
  const chips = document.createElement("p");
  chips.className = "ml-popup-chips";
  for (const t of ["地铁线路", `● ${line.status}`]) {
    const chip = document.createElement("span");
    chip.className = "ml-popup-chip";
    chip.textContent = t;
    chips.append(chip);
  }
  titleWrap.append(title, chips);
  head.append(badge, titleWrap);
  root.append(head);

  const note = document.createElement("p");
  note.className = "ml-popup-note";
  note.textContent = line.note;
  root.append(note);

  const stations = document.createElement("p");
  stations.className = "ml-popup-pinnote";
  stations.textContent = `沿线站点（图示段）：${line.stations.join(" · ")}`;
  root.append(stations);
  return root;
}

function MapSection({
  places,
  projectPin,
  metroLines,
}: {
  places: Place[];
  projectPin: ProjectPin;
  metroLines: MetroLine[];
}) {
  const mapWrapRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObjRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const selectRef = useRef<((key: string | null, opts?: { fly?: boolean }) => void) | null>(null);
  /* Polygon outlines are hidden by default and shown (dashed) only for the
     selected place. These refs let the in-effect applyPolygonFilter closure
     be driven from the category/selection effects outside the map effect. */
  const selectedKeyRef = useRef<string | null>(null);
  const categoryRef = useRef("全部");
  const applyPolyRef = useRef<(() => void) | null>(null);
  const [fallback, setFallback] = useState(false);
  const [category, setCategory] = useState("全部");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const pins = useMemo<PinPlace[]>(() => {
    const list: PinPlace[] = [
      {
        key: "__project",
        label: projectPin.label,
        category: projectPin.category,
        status: projectPin.status,
        note: projectPin.note,
        pinNote: projectPin.pinNote,
        distanceText: null,
        lat: projectPin.lat,
        lng: projectPin.lng,
        polygon: projectPin.polygon,
        addedOn: null,
        updatedOn: null,
      },
    ];
    for (const p of places) {
      if (p.lat === null || p.lng === null) continue;
      list.push({
        key: p.name,
        label: p.name,
        category: p.category,
        status: p.status,
        note: p.description,
        pinNote: p.pinNote,
        distanceText: p.distanceText,
        lat: p.lat,
        lng: p.lng,
        polygon: p.polygon,
        addedOn: p.addedOn,
        updatedOn: p.updatedOn,
      });
    }
    return list;
  }, [places, projectPin]);

  const pinByKey = useMemo(() => new Map(pins.map((p) => [p.key, p])), [pins]);
  const selectedPin = selectedKey ? (pinByKey.get(selectedKey) ?? null) : null;
  const selectedDef = selectedPin ? mapIconFor(selectedPin) : null;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of places) map.set(p.status, (map.get(p.status) ?? 0) + 1);
    return map;
  }, [places]);

  const filtered = useMemo(
    () =>
      (category === "全部" ? [...places] : places.filter((p) => p.category === category)).sort(
        (a, b) => a.distanceM - b.distanceM,
      ),
    [places, category],
  );

  const legendTypes = useMemo(() => {
    const seen = new Map<string, MapIconDef>();
    for (const p of pins) {
      const def = mapIconFor(p);
      if (!seen.has(def.typeLabel)) seen.set(def.typeLabel, def);
    }
    return [...seen.values()];
  }, [pins]);

  /* MapLibre map: pins + real polygon outlines. The popup is anchored to
     the clicked pin and follows it; selecting a pin never scrolls the page
     (the old hatch-maps control force-scrolled to the list below). */
  useEffect(() => {
    if (fallback || !mapRef.current) return;
    let map: maplibregl.Map;
    let loaded = false;
    try {
      /* Base map: 高德 (AutoNavi) raster tiles — directly reachable on
         mainland-China networks without a key. Both tile.openstreetmap.org
         and CARTO's CDN (basemaps.cartocdn.com) proved unreachable there,
         leaving pins on a blank base. AutoNavi tiles are GCJ-02, so all
         coordinates are converted from the stored WGS-84 at render time
         via wgs84ToGcj02 (see its comment). Same tiles in dark mode. */
      const amapTiles = [1, 2, 3, 4].map(
        (n) =>
          `https://webrd0${n}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}`,
      );
      map = new maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            amap: {
              type: "raster",
              tiles: amapTiles,
              tileSize: 256,
              attribution: "© 高德地图 AutoNavi",
            },
          },
          layers: [{ id: "amap", type: "raster", source: "amap" }],
        },
        center: wgs84ToGcj02(114.402, 30.612),
        zoom: 12,
        attributionControl: { compact: true },
        locale: {
          "NavigationControl.ZoomIn": "放大",
          "NavigationControl.ZoomOut": "缩小",
          "NavigationControl.ResetBearing": "重置方向",
          "AttributionControl.ToggleAttribution": "地图信息",
        },
      });
    } catch {
      setFallback(true);
      return;
    }
    mapObjRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("error", () => {
      if (!loaded) setFallback(true);
    });

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: 20,
      maxWidth: "320px",
      className: "th-map-popup",
    });
    popupRef.current = popup;
    popup.on("close", () => {
      setSelectedKey(null);
      selectedKeyRef.current = null;
      applyPolyRef.current?.();
      markersRef.current.forEach((m) => m.getElement().classList.remove("pin--on"));
    });

    /* Show only the selected place's polygon (and only when it also passes
       the category filter); everything else stays hidden. */
    const applyPolygonFilter = () => {
      if (!map.getLayer("place-polygons-fill")) return;
      const selFilter = ["==", ["get", "key"], selectedKeyRef.current ?? "__none__"];
      const cat = categoryRef.current;
      const filter =
        cat === "全部"
          ? selFilter
          : [
              "all",
              ["any", ["==", ["get", "category"], cat], ["==", ["get", "key"], "__project"]],
              selFilter,
            ];
      map.setFilter(
        "place-polygons-fill",
        filter as unknown as maplibregl.FilterSpecification,
      );
      map.setFilter(
        "place-polygons-line",
        filter as unknown as maplibregl.FilterSpecification,
      );
    };
    applyPolyRef.current = applyPolygonFilter;

    const select = (key: string | null, opts?: { fly?: boolean }) => {
      setSelectedKey(key);
      selectedKeyRef.current = key;
      applyPolygonFilter();
      markersRef.current.forEach((m, k) =>
        m.getElement().classList.toggle("pin--on", k === key),
      );
      if (key === null) {
        popup.remove();
        return;
      }
      const pin = pinByKey.get(key);
      if (!pin) return;
      popup.setDOMContent(buildPopupEl(pin, mapIconFor(pin)));
      popup.setLngLat(wgs84ToGcj02(pin.lng, pin.lat));
      if (!popup.isOpen()) popup.addTo(map);
      if (opts?.fly) {
        map.flyTo({
          center: wgs84ToGcj02(pin.lng, pin.lat),
          zoom: Math.max(map.getZoom(), 13.5),
          speed: 1.2,
          essential: true,
        });
      }
    };
    selectRef.current = select;

    const markers = new Map<string, maplibregl.Marker>();
    for (const pin of pins) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = `pin pin--st-${statusKey(pin.status)}`;
      el.textContent = mapIconFor(pin).glyph;
      el.setAttribute("aria-label", `在地图上查看：${pin.label}`);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        select(pin.key);
      });
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(wgs84ToGcj02(pin.lng, pin.lat))
        .addTo(map);
      markers.set(pin.key, marker);
    }
    markersRef.current = markers;

    map.on("load", () => {
      loaded = true;
      /* Metro lines (map-only; no entries in the place list below). Stored
         WGS-84 geometry converted to GCJ-02 at render, official colours,
         ~3.5px wide. Clicking a line opens the shared popup anchored at
         the click point with the line's name/status/stations — it does
         not select a pin and never scrolls to the list. */
      map.addSource("metro-lines", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: metroLines.map((l) => ({
            type: "Feature" as const,
            properties: { id: l.id },
            geometry: {
              type: "LineString" as const,
              coordinates: l.geometry.map(([lng, lat]) => wgs84ToGcj02(lng, lat)),
            },
          })),
        },
      });
      const metroColorExpr: unknown[] = ["match", ["get", "id"]];
      for (const l of metroLines) metroColorExpr.push(l.id, l.color);
      metroColorExpr.push("#888888");
      map.addLayer({
        id: "metro-lines",
        type: "line",
        source: "metro-lines",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": metroColorExpr as unknown as maplibregl.ExpressionSpecification,
          "line-width": 3.5,
          "line-opacity": 0.9,
        },
      });
      map.on("click", "metro-lines", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const line = metroLines.find((l) => l.id === f.properties?.id);
        if (!line) return;
        setSelectedKey(null);
        selectedKeyRef.current = null;
        applyPolygonFilter();
        markersRef.current.forEach((m) => m.getElement().classList.remove("pin--on"));
        popup.setDOMContent(buildMetroPopupEl(line));
        popup.setLngLat(e.lngLat);
        if (!popup.isOpen()) popup.addTo(map);
      });
      map.on("mouseenter", "metro-lines", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "metro-lines", () => {
        map.getCanvas().style.cursor = "";
      });
      const features = pins
        .filter((p) => p.polygon !== null)
        .map((p) => ({
          type: "Feature" as const,
          properties: { key: p.key, category: p.category, status: p.status },
          geometry: {
            type: "Polygon" as const,
            coordinates: [
              (p.polygon as [number, number][]).map(([lng, lat]) => wgs84ToGcj02(lng, lat)),
            ],
          },
        }));
      map.addSource("place-polygons", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });
      const statusColor = [
        "match",
        ["get", "status"],
        "在建",
        STATUS_COLORS.building,
        "规划中",
        STATUS_COLORS.planned,
        STATUS_COLORS.open,
      ] as unknown as maplibregl.ExpressionSpecification;
      const noneFilter = [
        "==",
        ["get", "key"],
        "__none__",
      ] as unknown as maplibregl.FilterSpecification;
      map.addLayer({
        id: "place-polygons-fill",
        type: "fill",
        source: "place-polygons",
        filter: noneFilter,
        paint: { "fill-color": statusColor, "fill-opacity": 0.16 },
      });
      map.addLayer({
        id: "place-polygons-line",
        type: "line",
        source: "place-polygons",
        filter: noneFilter,
        paint: {
          "line-color": statusColor,
          "line-width": 2,
          "line-opacity": 0.9,
          "line-dasharray": [2, 1.6],
        },
      });
      applyPolygonFilter();
      const bounds = new maplibregl.LngLatBounds();
      for (const p of pins) bounds.extend(wgs84ToGcj02(p.lng, p.lat));
      map.fitBounds(bounds, { padding: 44, maxZoom: 14, duration: 0 });
    });

    return () => {
      selectRef.current = null;
      applyPolyRef.current = null;
      markersRef.current = new Map();
      popupRef.current = null;
      popup.remove();
      map.remove();
      mapObjRef.current = null;
    };
  }, [pins, pinByKey, metroLines, fallback]);

  /* Category filter drives both the pin/polygon visibility and the list. */
  useEffect(() => {
    markersRef.current.forEach((marker, key) => {
      const pin = pinByKey.get(key);
      const show =
        category === "全部" || key === "__project" || (pin !== undefined && pin.category === category);
      marker.getElement().style.display = show ? "" : "none";
    });
    categoryRef.current = category;
    applyPolyRef.current?.();
    if (selectedKey && selectedKey !== "__project") {
      const pin = pinByKey.get(selectedKey);
      if (pin && category !== "全部" && pin.category !== category) selectRef.current?.(null);
    }
  }, [category, pinByKey, selectedKey, fallback]);

  const onRowClick = (p: Place) => {
    if (p.lat === null || p.lng === null) return;
    if (selectRef.current) {
      selectRef.current(p.name, { fly: true });
    } else {
      // Static-fallback mode: no live map handle — just select the place so
      // its info card renders under the static map.
      setSelectedKey(p.name);
    }
    mapWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <section aria-label="周边地图与配套" className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">周边地图 · 配套全图</h2>
      <p className="mt-1 text-sm leading-relaxed text-[var(--dim)]">
        周边配套全部整合在这张图上：图标区分类型，颜色区分状态（绿＝已运营、橙＝在建、灰＝规划中）。点击图钉，弹窗会锚定在图钉旁显示名称与说明，页面不会跳动；点下方条目，地图会平移定位并打开同一弹窗。手机上单指拖动即可平移地图、双指捏合缩放。有实测范围的点位（印象城、欢乐谷、学校、医院等，轮廓来自
        OpenStreetMap 实测多边形；本项目地块范围按实测尺寸约 160 米 × 250
        米绘制，为示意范围、非官方红线），点击其图钉时才会以虚线显示范围轮廓，平时不显示。少数配套位置已确定但暂无精确坐标，图钉为按公开地址与位置推定的近似定位，弹窗的图钉说明里有标注。距离为直线距离参考。地图上还按官方颜色画出了附近的地铁线路（4、5、12、19
        号线已运营，10 号线 / 新港线在建），点击线路可查看线路名、状态与图示段沿线站点；线路只在地图上展示，下方配套列表不单列。
      </p>
      <p className="mt-2 text-sm text-[var(--dim)]">
        共 {places.length} 处配套 · 已运营 {counts.get("已运营") ?? 0} · 在建 {counts.get("在建") ?? 0} ·
        规划中 {counts.get("规划中") ?? 0}；其中 {pins.length - 1} 处已上图（另含本项目图钉）。带「新增 / 更新」标记的为近两周内新纳入目录或内容有更正的配套。
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="地图图例：图标与地点类型对照">
        {legendTypes.map((d) => (
          <span
            key={d.typeLabel}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1 pl-1 pr-3 text-xs text-[var(--dim)]"
          >
            <span aria-hidden className="map-badge">
              {d.glyph}
            </span>
            {d.typeLabel}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="地图图例：颜色与运营状态对照">
        <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--dim)]">
          <span aria-hidden className="status-dot status-dot--open" /> 已运营
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--dim)]">
          <span aria-hidden className="status-dot status-dot--building" /> 在建
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--dim)]">
          <span aria-hidden className="status-dot status-dot--planned" /> 规划中
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="地图图例：地铁线路（官方颜色）">
        {metroLines.map((l) => (
          <span
            key={l.id}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--dim)]"
          >
            <span
              aria-hidden
              className="inline-block h-[3px] w-6 shrink-0 rounded-full"
              style={{ background: l.color }}
            />
            {l.name}（{l.status}）
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="配套分类筛选（同步过滤地图图钉）">
        {PLACE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`筛选配套：${c}`}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              category === c
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--dim)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div ref={mapWrapRef} className="relative mt-3">
        {!fallback ? (
          <div
            ref={mapRef}
            className="h-[420px] w-full overflow-hidden rounded-[var(--radius)] border border-[var(--border)]"
            aria-label="华侨城天荟周边地图（可缩放拖动，点击图标查看名称）"
          />
        ) : (
          <figure>
            <img
              src={mapStaticImg}
              alt="华侨城天荟周边静态地图：图钉标出本项目与周边配套（车站、学校、商场、医院、公园等）的位置"
              width={720}
              height={460}
              className="w-full rounded-[var(--radius)] border border-[var(--border)]"
            />
            <figcaption className="mt-1 text-xs text-[var(--dim)]">
              <a href="https://www.facebook.com/maps/attribution_terms" target="_blank" rel="noopener" className="underline underline-offset-2">
                © OpenStreetMap contributors, Map Data Legal Notices
              </a>
              （静态备用图含全部图钉，但不显示范围轮廓与近似/实测之分；点下方条目可查看名称卡片，定位口径以弹窗图钉说明为准）
            </figcaption>
          </figure>
        )}
      </div>
      {fallback && selectedPin && selectedDef && (
        <div
          role="dialog"
          aria-label={`地点详情：${selectedPin.label}`}
          className="place-card mt-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="flex items-start gap-2.5">
            <span aria-hidden title={selectedDef.typeLabel} className={`map-badge map-badge--st-${statusKey(selectedPin.status)} mt-0.5`}>
              {selectedDef.glyph}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="flex flex-wrap items-center gap-2 text-base font-bold leading-snug text-[var(--text)]">
                <span>{selectedPin.label}</span>
                {(() => {
                  const k = placeFreshKind(selectedPin);
                  return k ? <FreshTag kind={k} /> : null;
                })()}
              </h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyle(selectedPin.category)}`}>
                  {selectedDef.typeLabel}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(selectedPin.status)}`}>
                  ● {selectedPin.status}
                </span>
                {selectedPin.distanceText && (
                  <span className="rounded-full bg-[var(--surface-alt)] px-2 py-0.5 text-xs font-medium text-[var(--dim)]">
                    {selectedPin.distanceText}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              aria-label="关闭地点卡片"
              onClick={() => setSelectedKey(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-base leading-none text-[var(--dim)]"
            >
              ×
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{selectedPin.note}</p>
          {selectedPin.pinNote && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--dim)]">图钉说明：{selectedPin.pinNote}</p>
          )}
        </div>
      )}
      <ol className="mt-3 divide-y divide-[var(--border)] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
        {filtered.map((p) => {
          const pinned = p.lat !== null && p.lng !== null;
          const dirUrl = pinned
            ? mapsDirectionsUrl({ label: p.name, lat: p.lat as number, lng: p.lng as number })
            : mapsDirectionsUrl({ label: p.name, locality: "武汉市洪山区" });
          const def = mapIconFor({ category: p.category, label: p.name });
          return (
            <li
              key={p.name}
              onClick={pinned ? () => onRowClick(p) : undefined}
              className={`${pinned ? "cursor-pointer" : ""} px-4 py-3 ${selectedKey === p.name ? "map-selected" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span aria-hidden title={def.typeLabel} className={`map-badge map-badge--st-${statusKey(p.status)}`}>
                  {def.glyph}
                </span>
                <h3 className="text-base font-bold text-[var(--text)]">{p.name}</h3>
                {(() => {
                  const k = placeFreshKind(p);
                  return k ? <FreshTag kind={k} /> : null;
                })()}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(p.status)}`}>
                  ● {p.status}
                </span>
                <span className="ml-auto text-sm font-medium tabular-nums text-[var(--accent)]">{p.distanceText}</span>
              </div>
              <p className="mt-1.5 pl-9 text-sm leading-relaxed text-[var(--dim)]">{p.description}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 pl-9">
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`配套来源：${p.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="py-1 text-xs text-[var(--accent)] underline underline-offset-2"
                >
                  来源
                </a>
                {dirUrl && (
                  <a
                    href={dirUrl}
                    target="_blank"
                    rel="noopener"
                    aria-label={`导航到：${p.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="py-1 text-xs text-[var(--accent)] underline underline-offset-2"
                  >
                    导航
                  </a>
                )}
                {pinned ? (
                  <span className="py-1 text-xs text-[var(--dim)]">📍 已上图{p.polygon ? " · 点开图钉看虚线范围" : ""}，点条目定位</span>
                ) : (
                  <span className="py-1 text-xs text-[var(--dim)]">坐标待核实 · 暂未上图</span>
                )}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const SITE_PHOTO_IMGS: Record<string, string> = {
  aerial: siteAerialImg,
  visit: siteVisitImg,
  sample: siteSampleImg,
};

function SitePhotosSection({ data }: { data: SitePhotos }) {
  const hero = data.photos[0];
  const rest = data.photos.slice(1);
  return (
    <section aria-label="实地施工图" className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">实地施工图</h2>
      <p className="mt-1 text-sm text-[var(--dim)]">
        最新一期：{data.dateText} · 来源：{data.sourceName}现场观摩报道（配图为工地实拍，非效果图）。
      </p>
      {hero && SITE_PHOTO_IMGS[hero.key] && (
        <figure className="mt-3">
          <img
            src={SITE_PHOTO_IMGS[hero.key]}
            alt={hero.alt}
            className="w-full rounded-[var(--radius)] border border-[var(--border)]"
            loading="lazy"
          />
          <figcaption className="mt-1.5 text-sm text-[var(--dim)]">{hero.caption}</figcaption>
        </figure>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {rest.map(
          (p) =>
            SITE_PHOTO_IMGS[p.key] && (
              <figure key={p.key}>
                <img
                  src={SITE_PHOTO_IMGS[p.key]}
                  alt={p.alt}
                  className="w-full rounded-[var(--radius)] border border-[var(--border)]"
                  loading="lazy"
                />
                <figcaption className="mt-1.5 text-sm text-[var(--dim)]">{p.caption}</figcaption>
              </figure>
            ),
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--dim)]">{data.progressNote}</p>
      <p className="mt-2 text-xs text-[var(--dim)]">
        原图来源：
        <a href={data.sourceUrl} target="_blank" rel="noreferrer" aria-label="施工图来源：中建八局一公司报道" className="py-1 text-[var(--accent)] underline underline-offset-2">
          {data.sourceName}报道
        </a>
        。从航拍看，一期楼栋主体已成型、外立面施工中，距离 2027-06-30 交付还有约一年半的内外装与园林工期。
      </p>
    </section>
  );
}

function StaticExportSection() {
  const [msg, setMsg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const exp = useMutation({
    mutationFn: async () => await api.exportStaticSite({}),
    onSuccess: (res) => {
      setFailed(false);
      setMsg(
        `${res.message}（快照时间 ${new Date(res.snapshotAt).toLocaleString("zh-CN", { hour12: false })}，共 ${(res.totalBytes / 1024).toFixed(0)} KB）`,
      );
    },
    onError: () => {
      setFailed(true);
      setMsg("静态站导出失败，请稍后再试。");
    },
  });
  return (
    <section aria-label="静态站导出" className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">静态站导出 · 只读快照</h2>
      <p className="mt-1 text-sm leading-relaxed text-[var(--dim)]">
        把当前全部展示内容（速览、最新动态、房价走势与分户型、周边配套地图与图钉数据、时间线、项目档案、实地施工图）连同当时数据冻结成一个自包含的静态网站，生成到项目目录的
        static-site/ 文件夹：只有文本文件，图片已内嵌，放到 nginx、GitHub Pages 等任意静态托管即可直接打开。静态站是只读快照，不会自动更新，页面上会注明数据快照时间；笔记、收藏等交互在静态站中不可用。每日同步到
        GitHub 时也会自动重新生成一份。
      </p>
      <button
        type="button"
        aria-label="生成静态站快照"
        disabled={exp.isPending}
        onClick={() => exp.mutate()}
        className="mt-3 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {exp.isPending ? "正在生成…" : "生成静态站快照"}
      </button>
      {msg && (
        <p className={`mt-2 text-sm ${failed ? "text-[var(--brick)]" : "text-[var(--accent)]"}`}>{msg}</p>
      )}
    </section>
  );
}

function NotesSection() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState("");
  const notes = useQuery({ queryKey: ["notes"], queryFn: () => api.listNotes({}) });

  const add = useMutation({
    mutationFn: async (text: string) => await api.addNote({ text }),
    onSuccess: () => {
      setDraft("");
      setDraftError("");
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
  const remove = useMutation({
    mutationFn: async (id: number) => await api.deleteNote({ id }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) {
      setDraftError("笔记内容不能为空，先写点内容再添加。");
      return;
    }
    setDraftError("");
    add.mutate(text);
  };

  return (
    <section aria-label="我的跟踪笔记" className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">我的跟踪笔记</h2>
      <p className="mt-1 text-sm text-[var(--dim)]">记下实地看房的观察、要核实的划片消息、施工进度照片说明——只属于你的记录。</p>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <label htmlFor="note-input" className="sr-only">写一条跟踪笔记</label>
        <input
          id="note-input"
          {...FIELDS.addNote.text}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (draftError) setDraftError("");
          }}
          placeholder="例如：周末去看了工地，3# 楼已建到 20 层…"
          aria-invalid={draftError ? true : undefined}
          aria-describedby={draftError ? "note-input-error" : undefined}
          className="min-w-0 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
        <button
          type="submit"
          aria-label="添加笔记"
          disabled={add.isPending || draft.trim().length === 0}
          className="shrink-0 rounded-[var(--radius)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          添加
        </button>
      </form>
      {draftError && (
        <p id="note-input-error" role="alert" className="mt-2 text-sm text-[var(--brick)]">
          {draftError}
        </p>
      )}
      {notes.data && notes.data.notes.length === 0 && (
        <p className="mt-4 text-sm text-[var(--dim)]">还没有笔记。</p>
      )}
      <ul className="mt-3 space-y-2">
        {notes.data?.notes.map((n: Note) => (
          <li
            key={n.id}
            className="flex items-start justify-between gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3"
          >
            <div className="min-w-0">
              <p className="text-sm leading-relaxed text-[var(--text)]">{n.text}</p>
              <p className="mt-1 text-xs tabular-nums text-[var(--dim)]">
                {new Date(n.createdAt).toLocaleString("zh-CN", { hour12: false })}
              </p>
            </div>
            <button
              type="button"
              aria-label={`删除笔记：${n.text.slice(0, 20)}`}
              disabled={remove.isPending}
              onClick={() => remove.mutate(n.id)}
              className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--dim)]"
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EvaluationSection({ evaluation }: { evaluation: Evaluation }) {
  return (
    <section aria-label="综合评价" className="mt-10">
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">综合评价</h2>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-5xl font-black tabular-nums leading-none text-[var(--brick)]">
            {evaluation.overall.toFixed(1)}
          </span>
          <span className="text-sm text-[var(--dim)]">/ 10 · 综合评分</span>
        </p>
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-[var(--dim)]">
          交通与生态是硬通货，商业与自带配套还在兑现路上——现阶段更适合能陪片区一起成长的自住买家。
        </p>
      </div>
      <ul className="mt-5 space-y-4">
        {evaluation.items.map((it) => (
          <li key={it.label}>
            <div className="flex items-center gap-3">
              <span className="w-[4.5rem] shrink-0 text-sm font-bold text-[var(--text)]">{it.label}</span>
              <span
                className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--surface-alt)]"
                role="img"
                aria-label={`${it.label}评分 ${it.score.toFixed(1)} 分（满分 10 分）`}
              >
                <span
                  className="block h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${Math.round(it.score * 10)}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-right font-display text-base font-bold tabular-nums text-[var(--accent)]">
                {it.score.toFixed(1)}
              </span>
            </div>
            <p className="mt-1 pl-[5.25rem] text-sm leading-relaxed text-[var(--dim)]">{it.basis}</p>
          </li>
        ))}
      </ul>
      <p className="mt-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--text)]">
        {evaluation.verdict}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--dim)]">{evaluation.note}</p>
    </section>
  );
}

export function App() {
  const overview = useQuery({ queryKey: ["overview"], queryFn: () => api.getOverview({}) });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6">
        {overview.isPending && <p className="py-16 text-center text-sm text-[var(--dim)]">正在加载片区信息…</p>}
        {overview.error && (
          <p className="py-16 text-center text-sm text-[var(--brick)]">加载失败，请稍后重试。</p>
        )}
        {overview.data && (
          <>
            <PulseHeader
              project={overview.data.project}
              feedCount={overview.data.feedCount}
              weather={overview.data.weather}
            />
            {overview.data.lastRefreshAt && (
              <p className="mt-3 text-xs tabular-nums text-[var(--dim)]">
                最近一次刷新：{new Date(overview.data.lastRefreshAt).toLocaleString("zh-CN", { hour12: false })}
              </p>
            )}
            <FeedSection />
            <PriceSection prices={overview.data.prices} />
            <MapSection
              places={overview.data.places}
              projectPin={overview.data.projectPin}
              metroLines={overview.data.metroLines}
            />
            <TimelineSection milestones={overview.data.milestones} />
            <ArchiveSection project={overview.data.project} />
            <SitePhotosSection data={overview.data.sitePhotos} />
            <StaticExportSection />
            <NotesSection />
            <EvaluationSection evaluation={overview.data.evaluation} />
            <footer className="mt-12 border-t border-[var(--border)] pt-4">
              <p className="text-xs leading-relaxed text-[var(--dim)]">
                本页信息来自公开报道与政府公示，销售宣传口径与官方口径冲突时以官方为准；房价、划片、交付时间等请以售楼处与主管部门最新公示核实。本页每日自动检索更新，动态条目均附原文链接。
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
