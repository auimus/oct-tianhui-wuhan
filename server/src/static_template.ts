/* Pure HTML builder for the self-contained static-site snapshot.
   No SDK / fs imports: server/src/privileged.ts (runtime export action)
   and scripts/generate-static-site.ts (local generation) both feed it
   the same data + base64 images and write out the same files, so the
   exported static site always matches the live artifact's content. */

export interface StaticPlace {
  name: string;
  category: string;
  distanceText: string;
  distanceM: number;
  status: string;
  description: string;
  sourceUrl: string;
  lat: number | null;
  lng: number | null;
  polygon: [number, number][] | null;
  pinNote: string | null;
  addedOn: string | null;
  updatedOn: string | null;
}

export interface StaticFeedItem {
  id: number;
  title: string;
  category: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  publishedDate: string | null;
  fetchedAt: string;
  bookmarked: boolean;
  freshness: "new" | null;
}

export interface StaticProject {
  name: string;
  address: string;
  district: string;
  developer: string;
  builder: string;
  property: string;
  landParcel: string;
  landDeal: string;
  landArea: string;
  gfa: string;
  far: string;
  greenRate: string;
  units: string;
  parking: string;
  product: string;
  phase1: string;
  phase2: string;
  delivery: string;
  firstOpen: string;
  boundaries: string;
  caveats: string;
  sourceUrls: string[];
}

export interface StaticMilestone {
  dateText: string;
  title: string;
  description: string;
  category: string;
  future: boolean;
  sourceUrl: string;
}

export interface StaticUnitType {
  id: string;
  label: string;
  shortLabel: string;
  area: number;
  rooms: string;
  building: string;
  efficiency: string;
  filingAvg: number | null;
  filingNote: string;
  saleTotalFromWan: number | null;
  trend: { stage: string; dateText: string; price: number; kind: string }[];
  note: string;
}

export interface StaticPrices {
  asOf: string;
  currentRef: number;
  currentRefNote: string;
  firstOpenAvg: number;
  onSaleFromAvg: number;
  fourRoomDealAvg: number;
  unitTypes: StaticUnitType[];
  projectTrend: { stage: string; dateText: string; asking: number | null; deal: number | null }[];
  hongshanMonthly2025: { month: string; price: number }[];
  hongshanYearAvg2025: number;
  yangchunhuListing: { month: string; price: number; approx: boolean }[];
  yangchunhuListingNote: string;
  sectorDealAvg: number;
  sectorDealNote: string;
  neighbors: { name: string; listing: number; deal: number }[];
  market: { label: string; value: number; dateText: string; note: string }[];
  sources: { name: string; url: string }[];
}

export interface StaticProjectPin {
  label: string;
  category: string;
  lat: number;
  lng: number;
  status: string;
  note: string;
  pinNote: string;
  polygon: [number, number][];
}

export interface StaticSitePhotos {
  dateText: string;
  sourceName: string;
  sourceUrl: string;
  progressNote: string;
  photos: { key: string; caption: string; alt: string }[];
}

export interface StaticWeather {
  tempC: number;
  code: number;
  label: string;
  icon: string;
  highC: number;
  lowC: number;
  humidity: number;
  windKmh: number;
  observedAt: string;
}

export interface StaticEvaluation {
  asOf: string;
  overall: number;
  items: { label: string; score: number; basis: string }[];
  verdict: string;
  note: string;
}

export interface StaticSiteData {
  snapshotAt: string;
  snapshotText: string;
  project: StaticProject;
  places: StaticPlace[];
  milestones: StaticMilestone[];
  prices: StaticPrices;
  projectPin: StaticProjectPin;
  sitePhotos: StaticSitePhotos;
  feedItems: StaticFeedItem[];
  feedCount: number;
  bookmarkCount: number;
  lastRefreshAt: string | null;
  weather: StaticWeather | null;
  evaluation: StaticEvaluation;
}

/** Image data URIs keyed by asset name; null when the file was missing. */
export type StaticImages = {
  mapStatic: string | null;
  aerial: string | null;
  visit: string | null;
  sample: string | null;
};

/** MapLibre GL library sources (dist JS + CSS text) inlined into the
 *  generated page so the static site is self-contained — opening
 *  index.html via file:// or from an offline/CDN-blocked network no
 *  longer depends on jsdelivr. Null when the asset files could not be
 *  read at generation time; the template then falls back to the CDN
 *  <link>/<script src> tags. */
export type StaticMapLib = {
  js: string;
  css: string;
} | null;

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmt(n: number): string {
  return n.toLocaleString("zh-CN");
}

function pctChange(from: number, to: number): string {
  const v = ((to - from) / from) * 100;
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function statusKey(status: string): "open" | "building" | "planned" {
  if (status === "在建") return "building";
  if (status === "规划中") return "planned";
  return "open";
}

const STATUS_COLORS = { open: "#059669", building: "#d97706", planned: "#64748b" } as const;

/* Same type->glyph mapping as the live map (App.tsx mapIconFor). */
function iconFor(category: string, label: string): { glyph: string; typeLabel: string } {
  if (category === "项目") return { glyph: "🏠", typeLabel: "本项目" };
  if (label.includes("武汉站（高铁）")) return { glyph: "🚄", typeLabel: "高铁站" };
  if (label.includes("公交")) return { glyph: "🚌", typeLabel: "公交站" };
  if (label.includes("大道")) return { glyph: "🛣️", typeLabel: "主干道" };
  if (category === "交通") return { glyph: "🚇", typeLabel: "地铁站" };
  if (category === "教育") return { glyph: "🎓", typeLabel: "学校" };
  if (label.includes("社区商业")) return { glyph: "🏪", typeLabel: "社区商业" };
  if (category === "商业") return { glyph: "🛍️", typeLabel: "购物中心" };
  if (category === "医疗") return { glyph: "🏥", typeLabel: "医院" };
  if (label.includes("欢乐谷")) return { glyph: "🎡", typeLabel: "主题乐园" };
  if (label.includes("湖")) return { glyph: "🌊", typeLabel: "湖泊公园" };
  if (category === "生态文旅") return { glyph: "🌳", typeLabel: "公园绿地" };
  return { glyph: "📍", typeLabel: category };
}

function lineChartSvg(
  points: { label: string; value: number }[],
  color: string,
  ariaLabel: string,
): string {
  if (points.length === 0) return "";
  const W = 720;
  const H = 190;
  const padL = 8;
  const padR = 8;
  const padT = 26;
  const padB = 26;
  const values = points.map((p) => p.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 500;
    max += 500;
  }
  const span = max - min;
  min -= span * 0.12;
  max += span * 0.12;
  const x = (i: number) =>
    points.length === 1 ? W / 2 : padL + (i * (W - padL - padR)) / (points.length - 1);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const coords = points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const dots = points
    .map(
      (p, i) =>
        `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="3.5" fill="${color}"/>` +
        `<text x="${x(i).toFixed(1)}" y="${(y(p.value) - 8).toFixed(1)}" text-anchor="middle" class="svg-val">${fmt(p.value)}</text>` +
        `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" class="svg-lab">${esc(p.label)}</text>`,
    )
    .join("");
  const line =
    points.length > 1
      ? `<polyline points="${coords}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`
      : "";
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(ariaLabel)}">${line}${dots}</svg>`;
}

function barChartSvg(
  items: { label: string; value: number }[],
  color: string,
  ariaLabel: string,
): string {
  if (items.length === 0) return "";
  const W = 720;
  const H = 190;
  const padT = 26;
  const padB = 26;
  const max = Math.max(...items.map((i) => i.value)) * 1.12;
  const slot = W / items.length;
  const barW = Math.min(64, slot * 0.55);
  const bars = items
    .map((it, i) => {
      const h = (it.value / max) * (H - padT - padB);
      const bx = slot * i + (slot - barW) / 2;
      const by = H - padB - h;
      return (
        `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" rx="4" fill="${color}"/>` +
        `<text x="${(slot * i + slot / 2).toFixed(1)}" y="${(by - 7).toFixed(1)}" text-anchor="middle" class="svg-val">${fmt(it.value)}</text>` +
        `<text x="${(slot * i + slot / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle" class="svg-lab">${esc(it.label)}</text>`
      );
    })
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(ariaLabel)}">${bars}</svg>`;
}

type Pin = {
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
  sourceUrl: string | null;
  addedOn: string | null;
  updatedOn: string | null;
};

function collectPins(data: StaticSiteData): Pin[] {
  const pins: Pin[] = [
    {
      key: "__project",
      label: data.projectPin.label,
      category: data.projectPin.category,
      status: data.projectPin.status,
      note: data.projectPin.note,
      pinNote: data.projectPin.pinNote,
      distanceText: null,
      lat: data.projectPin.lat,
      lng: data.projectPin.lng,
      polygon: data.projectPin.polygon,
      sourceUrl: null,
      addedOn: null,
      updatedOn: null,
    },
  ];
  for (const p of data.places) {
    if (p.lat === null || p.lng === null) continue;
    pins.push({
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
      sourceUrl: p.sourceUrl,
      addedOn: p.addedOn,
      updatedOn: p.updatedOn,
    });
  }
  return pins;
}

function pinPlotSvg(pins: Pin[]): string {
  const W = 720;
  const H = 400;
  const pad = 26;
  const lngs = pins.map((p) => p.lng);
  const lats = pins.map((p) => p.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const x = (lng: number) => pad + ((lng - minLng) / (maxLng - minLng || 1)) * (W - pad * 2);
  const y = (lat: number) => H - pad - ((lat - minLat) / (maxLat - minLat || 1)) * (H - pad * 2);
  const polys = pins
    .filter((p) => p.polygon !== null)
    .map((p) => {
      const pts = (p.polygon as [number, number][])
        .map(([lng, lat]) => `${x(lng).toFixed(1)},${y(lat).toFixed(1)}`)
        .join(" ");
      const c = STATUS_COLORS[statusKey(p.status)];
      return `<polygon points="${pts}" fill="${c}" fill-opacity="0.13" stroke="${c}" stroke-width="1.6" stroke-dasharray="5 4" data-poly-cat="${esc(p.category)}"/>`;
    })
    .join("");
  const dots = pins
    .map((p, i) => {
      const c = STATUS_COLORS[statusKey(p.status)];
      const def = iconFor(p.category, p.label);
      return (
        `<g class="pin" data-pin-idx="${i}" data-pin-cat="${esc(p.category)}" tabindex="0" role="button" aria-label="查看地点：${esc(p.label)}" transform="translate(${x(p.lng).toFixed(1)},${y(p.lat).toFixed(1)})">` +
        `<circle r="12" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="2.4"/>` +
        `<text text-anchor="middle" dy="4.5" font-size="11">${def.glyph}</text></g>`
      );
    })
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="pinplot" role="group" aria-label="周边配套图钉分布示意图（按经纬度投影，点击图钉查看详情）">${polys}${dots}</svg>`;
}

const CSS = `
:root{color-scheme:light dark;--bg:#f7f5f0;--surface:#fffdf8;--surface-alt:#efeae0;--text:#1c2321;--dim:#5c6b68;--border:#ddd6c8;--accent:#0f5e5c;--accent-soft:#e3efec;--amber:#b97a14;--amber-soft:#faf0dc;--brick:#b84a2b;--brick-soft:#f9e9e3;--radius:10px}
@media (prefers-color-scheme:dark){:root{--bg:#121614;--surface:#1b201e;--surface-alt:#242a28;--text:#ece9e2;--dim:#9aa8a4;--border:#333b38;--accent:#4fb8b0;--accent-soft:#1d3230;--amber:#e5a83e;--amber-soft:#38300f;--brick:#e07a56;--brick-soft:#3a241c}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:"Noto Sans SC",system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;font-size:16px;line-height:1.65}
main{max-width:860px;margin:0 auto;padding:20px 16px 56px}
h1{font-size:34px;line-height:1.25;margin:6px 0 2px}
h2{font-size:24px;margin:38px 0 6px;padding-top:10px}
h3{font-size:17px;margin:22px 0 4px}
p{margin:6px 0}
a{color:var(--accent)}
.dim{color:var(--dim)}
.small{font-size:13px}
nav.toc{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}
nav.toc a{border:1px solid var(--border);background:var(--surface);border-radius:999px;padding:4px 12px;text-decoration:none;font-size:14px;color:var(--text)}
.kicker{font-size:12px;letter-spacing:.18em;color:var(--accent);font-weight:600}
.countdown{font-size:30px;font-weight:800;color:var(--brick)}
.grid4{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-top:12px}
@media(min-width:640px){.grid4{grid-template-columns:repeat(4,1fr)}}
.grid4>div{background:var(--surface);padding:10px 12px}
.grid4 .v{font-size:20px;font-weight:800;color:var(--accent)}
.grid4 .k{font-size:12px;color:var(--dim)}
.card{border:1px solid var(--border);background:var(--surface);border-radius:var(--radius);padding:14px 16px;margin-top:10px}
.chip{display:inline-block;border-radius:999px;padding:0 9px;font-size:12px;line-height:1.7;background:var(--surface-alt);color:var(--dim);margin-right:6px}
.chip-cat{background:var(--accent-soft);color:var(--accent)}
.chip-open{background:#ddf3e9;color:#047857}
.chip-building{background:var(--amber-soft);color:var(--amber)}
.chip-planned{background:var(--surface-alt);color:var(--dim)}
@media (prefers-color-scheme:dark){.chip-open{background:#173f31;color:#4fb8b0}}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}
.filters button{border:1px solid var(--border);background:var(--surface);color:var(--dim);border-radius:999px;padding:5px 14px;font-size:14px;cursor:pointer;min-height:32px}
.filters button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
table{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}
th,td{border-bottom:1px solid var(--border);padding:7px 8px;text-align:left;vertical-align:top}
thead th{background:var(--surface-alt);color:var(--dim);font-weight:600;font-size:13px}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
dl.archive{display:grid;grid-template-columns:96px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--surface);margin-top:10px}
dl.archive dt,dl.archive dd{margin:0;padding:9px 12px;border-bottom:1px solid var(--border);font-size:14px}
dl.archive dt{color:var(--dim);font-weight:600}
.caveat{border:1px solid var(--brick);background:var(--brick-soft);border-radius:var(--radius);padding:12px 16px;margin-top:12px}
ol.timeline{list-style:none;margin:10px 0 0;padding:0}
ol.timeline li{border-left:3px solid var(--accent);padding:2px 0 14px 14px;position:relative}
ol.timeline li.future{border-left-color:var(--brick)}
ol.timeline .d{font-weight:700;font-variant-numeric:tabular-nums}
figure{margin:12px 0}
figure img{width:100%;height:auto;border:1px solid var(--border);border-radius:var(--radius);display:block}
figcaption{font-size:13px;color:var(--dim);margin-top:5px}
.chart{width:100%;height:auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.svg-val{font-size:12px;font-weight:700;fill:var(--text)}
.svg-lab{font-size:11px;fill:var(--dim)}
.pinplot{width:100%;height:auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.pin{cursor:pointer}
.pin:focus circle{stroke-width:4}
.pin.selected circle{stroke-width:4}
.badge{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;border:2px solid var(--accent);background:var(--surface-alt);font-size:13px;flex-shrink:0}
.badge-open{border-color:#059669;background:#ddf3e9}
.badge-building{border-color:#d97706;background:#fdf0dc}
.badge-planned{border-color:#64748b;background:#e9edf1}
@media (prefers-color-scheme:dark){.badge-open{background:#173f31}.badge-building{background:#4d3a14}.badge-planned{background:#2e3742}}
.place-row{display:flex;gap:10px}
footer{margin-top:44px;border-top:1px solid var(--border);padding-top:14px;font-size:13px;color:var(--dim)}
details{margin-top:8px}
summary{cursor:pointer;color:var(--accent);font-size:14px}
.hidden{display:none!important}
.fresh-tag{display:inline-flex;align-items:center;padding:0 7px;height:19px;border-radius:999px;font-size:11px;line-height:1;font-weight:700;letter-spacing:.04em;white-space:nowrap;vertical-align:middle}
.fresh-tag--new{background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent)}
.fresh-tag--updated{background:#e9edf1;color:#52657a;border:1px solid #94a7ba}
@media (prefers-color-scheme:dark){.fresh-tag--updated{background:#2e3742;color:#a9bfd4;border-color:#5b7189}}
.card-fresh{border-left:3px solid var(--accent);background:color-mix(in srgb,var(--accent-soft) 38%,var(--surface))}
.head-flex{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:6px 20px}
.weather{text-align:right;flex-shrink:0;padding-top:20px}
@media(max-width:640px){.weather{text-align:left;padding-top:0}}
.weather .wmain{font-size:20px;font-weight:800;line-height:1.3}
.weather .wmain .wt{color:var(--accent)}
.score-big{font-size:48px;font-weight:900;color:var(--brick);line-height:1;font-variant-numeric:tabular-nums}
.bar{height:8px;background:var(--surface-alt);border-radius:999px;overflow:hidden;flex:1;min-width:60px}
.bar>i{display:block;height:100%;background:var(--accent);border-radius:999px}
.eval-row{display:flex;align-items:center;gap:12px;margin-top:14px}
.eval-row .lab{width:72px;flex-shrink:0;font-weight:700;font-size:14px}
.eval-row .sc{width:32px;flex-shrink:0;text-align:right;font-weight:800;color:var(--accent);font-variant-numeric:tabular-nums}
.eval-basis{margin:3px 0 0 84px;font-size:14px;color:var(--dim)}
.ml-map{width:100%;height:440px;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--surface-alt)}
@media(max-width:640px){.ml-map{height:380px}}
.ml-pin{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#fff;font-size:15px;line-height:1;border:2.5px solid var(--accent);box-shadow:0 1px 5px rgb(0 0 0/.35);cursor:pointer;padding:0;font-family:inherit}
.ml-pin--st-open{border-color:#059669;background:#ddf3e9}
.ml-pin--st-building{border-color:#d97706;background:#fdf0dc}
.ml-pin--st-planned{border-color:#64748b;background:#e9edf1}
.ml-pin--on{transform:scale(1.3);border-width:3px;box-shadow:0 3px 10px rgb(0 0 0/.45)}
@media (prefers-color-scheme:dark){.ml-pin--st-open{background:#173f31}.ml-pin--st-building{background:#4d3a14}.ml-pin--st-planned{background:#2e3742}}
.map-badge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:var(--surface-alt);font-size:14px;line-height:1;border:2px solid var(--accent);flex-shrink:0}
.map-badge--st-open{border-color:#059669;background:#ddf3e9}
.map-badge--st-building{border-color:#d97706;background:#fdf0dc}
.map-badge--st-planned{border-color:#64748b;background:#e9edf1}
@media (prefers-color-scheme:dark){.map-badge--st-open{background:#173f31}.map-badge--st-building{background:#4d3a14}.map-badge--st-planned{background:#2e3742}}
.th-map-popup .maplibregl-popup-content{background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px 12px;box-shadow:0 8px 28px rgb(0 0 0/.28);font-family:"Noto Sans SC",system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}
.th-map-popup .maplibregl-popup-close-button{color:var(--dim);font-size:20px;line-height:1;padding:4px 9px;background:none;border:none;cursor:pointer}
.th-map-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip{border-top-color:var(--surface)}
.th-map-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip{border-bottom-color:var(--surface)}
.th-map-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip{border-right-color:var(--surface)}
.th-map-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip{border-left-color:var(--surface)}
.ml-popup-head{display:flex;align-items:flex-start;gap:10px}
.ml-popup-title{font-size:16px;font-weight:700;line-height:1.35;padding-right:16px;margin:0}
.ml-popup-chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 0}
.ml-popup-chip{font-size:12px;line-height:1.5;padding:0 8px;border-radius:9999px;background:var(--surface-alt);color:var(--dim)}
.ml-popup-note{margin:8px 0 0;font-size:14px;line-height:1.6;color:var(--dim)}
.ml-popup-pinnote{margin:6px 0 0;font-size:12px;line-height:1.5;color:var(--dim);opacity:.85}
.ml-popup-link{display:inline-block;margin-top:6px;padding:2px 0;font-size:14px;font-weight:500;color:var(--accent);text-decoration:underline;text-underline-offset:2px}
`;

function chipForStatus(status: string): string {
  const k = statusKey(status);
  return `<span class="chip chip-${k}">● ${esc(status)}</span>`;
}

/* Place freshness vs the snapshot date as "today": 新增 when addedOn is
   within 14 days, 更新 when updatedOn is (addedOn wins). Mirrors the live
   client's placeFreshKind in App.tsx. */
function placeFreshKind(
  pl: { addedOn: string | null; updatedOn: string | null },
  today: Date,
): "new" | "updated" | null {
  const within = (dateText: string | null): boolean => {
    if (!dateText) return false;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
    if (!m) return false;
    const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const d = Math.round((today.getTime() - target.getTime()) / 86400000);
    return d >= 0 && d <= 14;
  };
  if (within(pl.addedOn)) return "new";
  if (within(pl.updatedOn)) return "updated";
  return null;
}

function freshTagHtml(kind: "new" | "updated" | null): string {
  if (!kind) return "";
  return `<span class="fresh-tag fresh-tag--${kind === "new" ? "new" : "updated"}">${kind === "new" ? "新增" : "更新"}</span>`;
}

export function buildStaticSiteHtml(
  data: StaticSiteData,
  images: StaticImages,
  mapLib?: StaticMapLib,
): string {
  const p = data.project;
  const prices = data.prices;
  const pins = collectPins(data);
  const snapDate = new Date(data.snapshotAt);
  const delivery = new Date(2027, 5, 30);
  const today = new Date(snapDate.getFullYear(), snapDate.getMonth(), snapDate.getDate());
  const days = Math.round((delivery.getTime() - today.getTime()) / 86400000);
  const refChange = pctChange(prices.firstOpenAvg, prices.currentRef);

  const feedCats = ["全部", ...Array.from(new Set(data.feedItems.map((i) => i.category)))];
  const feedHtml = data.feedItems
    .map(
      (it) => `<article class="card${it.freshness === "new" ? " card-fresh" : ""}" data-feed-cat="${esc(it.category)}">
<div><span class="chip chip-cat">${esc(it.category)}</span><span class="dim small">${esc(it.publishedDate ?? "日期见原文")}</span>${it.bookmarked ? '<span class="chip">★ 已收藏</span>' : ""}</div>
<h3 style="margin-top:6px">${esc(it.title)}${it.freshness === "new" ? ` ${freshTagHtml("new")}` : ""}</h3>
<p class="dim" style="font-size:14px">${esc(it.summary)}</p>
<p class="small dim">来源：${esc(it.sourceName)} · <a href="${esc(it.sourceUrl)}" target="_blank" rel="noreferrer">查看原文</a></p>
</article>`,
    )
    .join("\n");

  const unitCards = prices.unitTypes
    .map((u) => {
      const chart =
        u.trend.length > 0
          ? lineChartSvg(
              u.trend.map((t) => ({ label: t.stage, value: t.price })),
              "#0f5e5c",
              `${u.label}价格走势图`,
            )
          : `<p class="dim small">该户型尚未取证，暂无价格数据。取证备案后会补上它的走势。</p>`;
      const trendRows = u.trend
        .map(
          (t) =>
            `<tr><td>${esc(t.stage)}</td><td>${esc(t.dateText)}</td><td>${esc(t.kind)}口径</td><td class="num">${fmt(t.price)} 元/㎡</td></tr>`,
        )
        .join("");
      const filing =
        u.filingAvg !== null
          ? `${fmt(u.filingAvg)} 元/㎡ · 按备案均价 × 建面估算总价约 ${((u.filingAvg * u.area) / 10000).toFixed(1)} 万元（${esc(u.filingNote)}）`
          : esc(u.filingNote);
      const sale =
        u.saleTotalFromWan !== null
          ? `约 ${u.saleTotalFromWan} 万元起（售楼处口径）`
          : "暂无公开数据，以一房一价公示为准";
      return `<article class="card">
<h3 style="margin-top:2px">${esc(u.label)}</h3>
<p class="dim small">${esc(u.building)} · ${esc(u.rooms)} · 得房率 ${esc(u.efficiency)}</p>
${chart}
${trendRows ? `<table><thead><tr><th>阶段</th><th>时间</th><th>口径</th><th class="num">单价</th></tr></thead><tbody>${trendRows}</tbody></table>` : ""}
<p class="small"><strong>备案价：</strong>${filing}<br/><strong>在售总价：</strong>${sale}</p>
<p class="dim" style="font-size:14px">${esc(u.note)}</p>
</article>`;
    })
    .join("\n");

  const filingBar = barChartSvg(
    prices.unitTypes
      .filter((u) => u.filingAvg !== null)
      .map((u) => ({ label: u.shortLabel, value: u.filingAvg as number })),
    "#d98e1b",
    "各户型备案均价柱状图",
  );
  const projectTrendRows = prices.projectTrend
    .map(
      (t) =>
        `<tr><td>${esc(t.stage)}</td><td>${esc(t.dateText)}</td><td class="num">${t.asking !== null ? fmt(t.asking) : "—"}</td><td class="num">${t.deal !== null ? fmt(t.deal) : "—"}</td></tr>`,
    )
    .join("");
  const hongshanChart = lineChartSvg(
    prices.hongshanMonthly2025.map((m) => ({ label: m.month, value: m.price })),
    "#0f5e5c",
    "洪山区2025年新房月度均价走势图",
  );
  const hongshanRows = prices.hongshanMonthly2025
    .map((m) => `<tr><td>2025 年 ${esc(m.month)}</td><td class="num">${fmt(m.price)} 元/㎡</td></tr>`)
    .join("");
  const ychChart = lineChartSvg(
    prices.yangchunhuListing.map((m) => ({ label: m.month, value: m.price })),
    "#b84a2b",
    "杨春湖畔二手房挂牌均价走势图",
  );
  const ychRows = prices.yangchunhuListing
    .map(
      (m) =>
        `<tr><td>${esc(m.month)}</td><td class="num">${m.approx ? "约 " : ""}${fmt(m.price)} 元/㎡</td></tr>`,
    )
    .join("");
  const neighborRows = prices.neighbors
    .map(
      (n) =>
        `<tr><td>${esc(n.name)}</td><td class="num">${fmt(n.listing)}</td><td class="num">${fmt(n.deal)}</td><td class="num">${pctChange(n.listing, n.deal)}</td></tr>`,
    )
    .join("");
  const marketRows = prices.market
    .map(
      (m) =>
        `<tr><td>${esc(m.label)}</td><td>${esc(m.dateText)}</td><td class="num">${fmt(m.value)} 元/㎡</td><td>${esc(m.note)}</td></tr>`,
    )
    .join("");
  const priceSources = prices.sources
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.name)}</a>`)
    .join("、");

  const placeCats = ["全部", "交通", "商业", "教育", "医疗", "生态文旅"];
  const sortedPlaces = [...data.places].sort((a, b) => a.distanceM - b.distanceM);
  const placeRows = sortedPlaces
    .map((pl) => {
      const def = iconFor(pl.category, pl.name);
      const idx = pins.findIndex((x) => x.key === pl.name);
      const pinned = pl.lat !== null && pl.lng !== null;
      const dir = pinned
        ? `https://www.google.com/maps/dir/?api=1&destination=${pl.lat},${pl.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pl.name + " 武汉市洪山区")}`;
      return `<article class="card" data-place-cat="${esc(pl.category)}" ${idx >= 0 ? `data-place-idx="${idx}"` : ""}>
<div class="place-row"><span class="badge badge-${statusKey(pl.status)}" aria-hidden="true">${def.glyph}</span>
<div style="min-width:0;flex:1">
<div><strong>${esc(pl.name)}</strong> ${freshTagHtml(placeFreshKind(pl, today))} ${chipForStatus(pl.status)}<span class="chip">${esc(def.typeLabel)}</span><span class="chip">${esc(pl.distanceText)}</span></div>
<p class="dim" style="font-size:14px">${esc(pl.description)}</p>
<p class="small dim">${pinned ? `坐标：${pl.lat}, ${pl.lng}${pl.polygon ? ` · 含实测范围轮廓（${pl.polygon.length} 点）` : ""}` : "坐标待核实 · 暂未上图"} · <a href="${esc(pl.sourceUrl)}" target="_blank" rel="noreferrer">来源</a> · <a href="${esc(dir)}" target="_blank" rel="noopener">导航</a></p>
${pl.pinNote ? `<p class="small dim">图钉说明：${esc(pl.pinNote)}</p>` : ""}
</div></div></article>`;
    })
    .join("\n");

  const legendSeen = new Map<string, { glyph: string; typeLabel: string }>();
  for (const pin of pins) {
    const def = iconFor(pin.category, pin.label);
    if (!legendSeen.has(def.typeLabel)) legendSeen.set(def.typeLabel, def);
  }
  const legendHtml = [...legendSeen.values()]
    .map((d) => `<span class="chip"><span aria-hidden="true">${d.glyph}</span> ${esc(d.typeLabel)}</span>`)
    .join(" ");

  const counts = new Map<string, number>();
  for (const pl of data.places) counts.set(pl.status, (counts.get(pl.status) ?? 0) + 1);

  const timelineHtml = data.milestones
    .map(
      (m) => `<li class="${m.future ? "future" : ""}">
<p style="margin:0"><span class="d">${esc(m.dateText)}</span> <span class="chip chip-cat">${esc(m.category)}</span>${m.future ? '<span class="chip">预计</span>' : ""}</p>
<h3 style="margin:2px 0">${esc(m.title)}</h3>
<p class="dim" style="font-size:14px;margin:2px 0">${esc(m.description)}</p>
<p class="small" style="margin:2px 0"><a href="${esc(m.sourceUrl)}" target="_blank" rel="noreferrer">来源</a></p>
</li>`,
    )
    .join("\n");

  const archiveRows: [string, string][] = [
    ["位置", `${p.address}（${p.district}）`],
    ["四至", p.boundaries],
    ["开发商", p.developer],
    ["承建 / 物业", `${p.builder} / ${p.property}`],
    ["地块", p.landParcel],
    ["拿地", p.landDeal],
    ["占地 / 建面", `${p.landArea} / ${p.gfa}`],
    ["容积率 / 绿化率", `${p.far} / ${p.greenRate}`],
    ["户数 / 车位", `${p.units} / ${p.parking}`],
    ["产品", p.product],
    ["一期", p.phase1],
    ["二期", p.phase2],
    ["首开", p.firstOpen],
    ["交付", p.delivery],
  ];
  const archiveHtml = archiveRows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
  const archiveSources = p.sourceUrls
    .map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noreferrer">资料 ${i + 1}</a>`)
    .join("、");

  const photoImgs: Record<string, string | null> = {
    aerial: images.aerial,
    visit: images.visit,
    sample: images.sample,
  };
  const photosHtml = data.sitePhotos.photos
    .map((ph) => {
      const src = photoImgs[ph.key];
      if (!src) return `<figure><figcaption>${esc(ph.caption)}（图片文件缺失，未能内嵌）</figcaption></figure>`;
      return `<figure><img src="${src}" alt="${esc(ph.alt)}" loading="lazy"/><figcaption>${esc(ph.caption)}</figcaption></figure>`;
    })
    .join("\n");

  const ev = data.evaluation;
  const evalRows = ev.items
    .map(
      (it) => `<div class="eval-row"><span class="lab">${esc(it.label)}</span><span class="bar" role="img" aria-label="${esc(it.label)}评分 ${it.score.toFixed(1)} 分（满分 10 分）"><i style="width:${Math.round(it.score * 10)}%"></i></span><span class="sc">${it.score.toFixed(1)}</span></div>
<p class="eval-basis">${esc(it.basis)}</p>`,
    )
    .join("\n");
  const evalHtml = `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px;margin-top:10px">
<p style="margin:0"><span class="score-big">${ev.overall.toFixed(1)}</span> <span class="dim small">/ 10 · 综合评分</span></p>
<p class="dim" style="font-size:14px;margin:0;flex:1;min-width:220px">交通与生态是硬通货，商业与自带配套还在兑现路上——现阶段更适合能陪片区一起成长的自住买家。</p>
</div>
${evalRows}
<div class="card"><p style="margin:0;font-size:14px">${esc(ev.verdict)}</p></div>
<p class="small dim">${esc(ev.note)}</p>`;

  const pinDataJson = JSON.stringify(
    pins.map((pin) => ({
      label: pin.label,
      category: pin.category,
      status: pin.status,
      note: pin.note,
      pinNote: pin.pinNote,
      distanceText: pin.distanceText,
      lat: pin.lat,
      lng: pin.lng,
      polygon: pin.polygon,
      statusKey: statusKey(pin.status),
      typeLabel: iconFor(pin.category, pin.label).typeLabel,
      glyph: iconFor(pin.category, pin.label).glyph,
      freshKind: placeFreshKind(pin, today),
    })),
  ).replace(/</g, "\\u003c");
  const snapshotJson = JSON.stringify(data).replace(/</g, "\\u003c");

  /* MapLibre GL: inline the library when its sources were supplied
     (self-contained page, works from file://); otherwise fall back to
     the jsdelivr CDN tags. The vendored dist sources contain no
     "</style" / "</script" sequences (verified at vendoring time), so
     they are safe to embed verbatim. */
  const mapLibCssTag = mapLib
    ? `<style>${mapLib.css}</style>`
    : `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.css"/>`;
  const mapLibJsTag = mapLib
    ? `<script>${mapLib.js}</script>`
    : `<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.min.js"></script>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>华侨城·天荟周边生活信息</title>
<meta name="description" content="华侨城·天荟（武汉洪山区杨春湖高铁商务区）开发进展、房价走势、周边配套地图与时间线。"/>
<style>${CSS}</style>
${mapLibCssTag}
</head>
<body>
<main>
<header>
<div class="head-flex">
<div style="min-width:0">
<p class="kicker">武汉 · 洪山 · 杨春湖高铁商务区（东湖新城）</p>
<h1>华侨城·天荟</h1>
<p class="dim">${esc(p.address)} · ${esc(p.developer)}</p>
</div>
${data.weather ? `<div class="weather" aria-label="项目所在地天气">
<p class="wmain" style="margin:0"><span aria-hidden="true">${esc(data.weather.icon)}</span> ${esc(data.weather.label)} <span class="wt">${Math.round(data.weather.tempC)}°C</span></p>
<p class="small dim" style="margin:2px 0 0">今日 ${Math.round(data.weather.lowC)}~${Math.round(data.weather.highC)}°C · 湿度 ${Math.round(data.weather.humidity)}% · 风 ${Math.round(data.weather.windKmh)} km/h</p>
<p class="small dim" style="margin:0">项目所在地天气 · Open-Meteo</p>
</div>` : ""}
</div>
<p style="margin-top:10px"><span class="countdown">${days > 0 ? days : "—"}</span> 天后 · 一期预计交付（2027-06-30）</p>
<p class="dim">已收录动态 <strong style="color:var(--text)">${data.feedCount}</strong> 条${data.lastRefreshAt ? ` · 最近一次刷新：${esc(data.lastRefreshAt)}` : ""}</p>
<div class="grid4">
<div><div class="v">177 米</div><div class="k">地铁 4 号线工业四路站</div></div>
<div><div class="v">1.5 公里</div><div class="k">武汉站（高铁）</div></div>
<div><div class="v">700 米</div><div class="k">东湖</div></div>
<div><div class="v">493 米</div><div class="k">武汉小学华侨城分校</div></div>
</div>
<p class="small dim">距离均为公开资料直线距离参考，实际通行以路况与官方测量为准。</p>
<nav class="toc" aria-label="本页目录">
<a href="#feed">最新动态</a><a href="#prices">房价走势</a><a href="#map">周边地图 · 配套全图</a><a href="#timeline">时间线</a><a href="#archive">项目档案</a><a href="#photos">实地施工图</a><a href="#review">综合评价</a>
</nav>
</header>

<section id="feed" aria-label="最新动态">
<h2>最新动态</h2>
<p class="dim small">共 ${data.feedItems.length} 条（按发布日期倒序）。点分类可筛选。带「新增」标记的为最近一次刷新加入的动态。</p>
<div class="filters" role="group" aria-label="动态分类筛选">
${feedCats.map((c, i) => `<button type="button" data-feed-filter="${esc(c)}" aria-pressed="${i === 0 ? "true" : "false"}">${esc(c)}</button>`).join("")}
</div>
${feedHtml || '<p class="dim">暂无动态。</p>'}
</section>

<section id="prices" aria-label="房价走势">
<h2>房价走势</h2>
<p class="dim" style="font-size:14px">数据截至 ${esc(prices.asOf)}。先分清口径：<strong>备案价</strong>是房管部门备案价、<strong>在售价</strong>是售楼处报价、<strong>成交价</strong>是实际网签统计、<strong>挂牌价</strong>是二手房源报价——四者不能直接混比，每处都标了口径。</p>
<div class="grid4">
<div><div class="v">${fmt(prices.currentRef)} <span class="small dim">元/㎡</span></div><div class="k">天荟当前参考均价</div><div class="small dim">${esc(prices.currentRefNote)}；较首开 ${refChange}</div></div>
<div><div class="v">${fmt(prices.firstOpenAvg)} <span class="small dim">元/㎡</span></div><div class="k">天荟首开均价</div><div class="small dim">2025-07-11 首开 · 销售口径</div></div>
<div><div class="v">${fmt(prices.fourRoomDealAvg)} <span class="small dim">元/㎡</span></div><div class="k">天荟四房成交均价</div><div class="small dim">2026-09 克而瑞四房榜 · 45 套成交口径</div></div>
<div><div class="v">${fmt(prices.sectorDealAvg)} <span class="small dim">元/㎡</span></div><div class="k">杨春湖板块二手成交均价</div><div class="small dim">2026-09 · 21 个小区 107 套成交口径</div></div>
</div>

<h3>分户型走势</h3>
${unitCards}

<h3>各户型备案价对比</h3>
<p class="dim small">2025-07 首次取证（武房开预售〔2025〕193 号）备案均价，元/㎡。</p>
${filingBar}
<p class="dim small">同为 128㎡，4# 小高层（10 层、一梯两户）备案价比 3# 超高层高出约 4,200 元/㎡，是低密与瞰湖资源的溢价。</p>

<h3>天荟整体价格节点</h3>
<table><thead><tr><th>节点</th><th>时间</th><th class="num">在售/参考均价（元/㎡）</th><th class="num">成交均价（元/㎡）</th></tr></thead><tbody>${projectTrendRows}</tbody></table>
<p class="dim small">从首开 13,500 到当前平台参考 12,500，在售口径回落 ${esc(refChange)}；2026-09 四房实际成交均价 11,444 元/㎡，比参考价再低约一成——看房时以成交口径谈价更实在。</p>

<h3>洪山区新房均价 · 2025 年月度</h3>
<p class="dim small">58 爱房综合计算口径，全年均价 ${fmt(prices.hongshanYearAvg2025)} 元/㎡。洪山均价被街道口、关山等高价板块抬高，杨春湖板块明显低于全区均价。</p>
${hongshanChart}
<details><summary>查看月度数据表</summary><table><thead><tr><th>月份</th><th class="num">新房均价</th></tr></thead><tbody>${hongshanRows}</tbody></table></details>

<h3>杨春湖畔二手房挂牌走势</h3>
<p class="dim small">${esc(prices.yangchunhuListingNote)}</p>
${ychChart}
<details><summary>查看月度数据表</summary><table><thead><tr><th>月份</th><th class="num">挂牌均价</th></tr></thead><tbody>${ychRows}</tbody></table></details>
<p class="dim small">${esc(prices.sectorDealNote)}</p>

<h3>周边二手房：挂牌价 vs 成交价</h3>
<table><thead><tr><th>小区</th><th class="num">挂牌均价（元/㎡）</th><th class="num">成交均价（元/㎡）</th><th class="num">成交低于挂牌</th></tr></thead><tbody>${neighborRows}</tbody></table>
<p class="dim small">周边次新小区成交价普遍比挂牌价低三到四成——挂牌价只是业主要价，判断片区真实价格要看成交口径。</p>

<h3>武汉 / 洪山最新市场快照</h3>
<table><thead><tr><th>指标</th><th>时间</th><th class="num">均价</th><th>说明</th></tr></thead><tbody>${marketRows}</tbody></table>
<p class="small dim">价格来源：${priceSources}。房价受楼层、朝向、装修与网签节奏影响波动较大，本页数据仅供跟踪参考，不构成购房建议；最终以房管部门备案与售楼处一房一价公示为准。</p>
</section>

<section id="map" aria-label="周边地图与配套">
<h2>周边地图 · 配套全图</h2>
<p class="dim" style="font-size:14px">图标区分类型，颜色区分状态（绿＝已运营、橙＝在建、灰＝规划中）。地图可以拖动、缩放：点击图钉，弹窗会锚定在图钉旁显示名称与说明，页面不会跳动；点下方条目，地图会平移定位并打开同一弹窗。手机上单指拖动即可平移、双指捏合缩放。有实测范围的点位，点击其图钉时才会以虚线显示范围轮廓，平时不显示。少数配套为按公开地址推定的近似定位，弹窗的图钉说明里有标注。距离为直线距离参考。</p>
<p class="dim small">共 ${data.places.length} 处配套 · 已运营 ${counts.get("已运营") ?? 0} · 在建 ${counts.get("在建") ?? 0} · 规划中 ${counts.get("规划中") ?? 0}；其中 ${pins.length - 1} 处已上图（另含本项目图钉）。带「新增 / 更新」标记的为近两周内新纳入目录或内容有更正的配套。</p>
<p>${legendHtml}</p>
<p><span class="chip chip-open">● 已运营</span><span class="chip chip-building">● 在建</span><span class="chip chip-planned">● 规划中</span></p>
<div id="ml-map" class="ml-map hidden" role="application" aria-label="周边配套交互地图（可拖动缩放，点击图钉查看详情）"></div>
<div id="map-fallback">
${pinPlotSvg(pins)}
<div id="pin-detail" class="card" aria-live="polite"><p class="dim" style="margin:0">点击上方分布图的任意图钉，这里会显示该地点的名称、状态与说明。</p></div>
</div>
<div class="filters" role="group" aria-label="配套分类筛选">
${placeCats.map((c, i) => `<button type="button" data-place-filter="${esc(c)}" aria-pressed="${i === 0 ? "true" : "false"}">${esc(c)}</button>`).join("")}
</div>
${placeRows}
</section>

<section id="timeline" aria-label="片区大事时间线">
<h2>片区大事 · 时间线</h2>
<ol class="timeline">
${timelineHtml}
</ol>
</section>

<section id="archive" aria-label="项目档案">
<h2>项目档案</h2>
<dl class="archive">${archiveHtml}</dl>
<div class="caveat"><h3 style="margin-top:0;color:var(--brick)">看房提醒（不利因素）</h3><p style="font-size:14px">${esc(p.caveats)}</p></div>
<p class="small dim">档案来源：${archiveSources}。不同口径数字有出入处已在文中注明。</p>
</section>

<section id="photos" aria-label="实地施工图">
<h2>实地施工图</h2>
<p class="dim small">最新一期：${esc(data.sitePhotos.dateText)} · 来源：${esc(data.sitePhotos.sourceName)}现场观摩报道（配图为工地实拍，非效果图）。</p>
${photosHtml}
<p class="dim" style="font-size:14px">${esc(data.sitePhotos.progressNote)}</p>
<p class="small dim">原图来源：<a href="${esc(data.sitePhotos.sourceUrl)}" target="_blank" rel="noreferrer">${esc(data.sitePhotos.sourceName)}报道</a>。</p>
</section>

<section id="review" aria-label="综合评价">
<h2>综合评价</h2>
${evalHtml}
</section>

<footer>
<p>本页信息来自公开报道与政府公示，销售宣传口径与官方口径冲突时以官方为准；房价、划片、交付时间等请以售楼处与主管部门最新公示核实。</p>
<p class="small dim">本页内容截至 ${esc(data.snapshotText)}（北京时间），为静态页面，不会自动更新。</p>
</footer>
</main>
<script type="application/json" id="snapshot-data">${snapshotJson}</script>
${mapLibJsTag}
<script>
var PIN_DATA = ${pinDataJson};
function bindFilter(attr, itemAttr) {
  var btns = document.querySelectorAll("[" + attr + "]");
  btns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      var cat = btn.getAttribute(attr);
      document.querySelectorAll("[" + itemAttr + "]").forEach(function (el) {
        var show = cat === "全部" || el.getAttribute(itemAttr) === cat;
        el.classList.toggle("hidden", !show);
      });
    });
  });
}
bindFilter("data-feed-filter", "data-feed-cat");
(function () {
  var btns = document.querySelectorAll("[data-place-filter]");
  btns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      var cat = btn.getAttribute("data-place-filter");
      document.querySelectorAll("[data-place-cat]").forEach(function (el) {
        el.classList.toggle("hidden", !(cat === "全部" || el.getAttribute("data-place-cat") === cat));
      });
      document.querySelectorAll("[data-pin-cat]").forEach(function (el) {
        el.classList.toggle("hidden", !(cat === "全部" || el.getAttribute("data-pin-cat") === cat));
      });
      document.querySelectorAll("[data-poly-cat]").forEach(function (el) {
        el.classList.toggle("hidden", !(cat === "全部" || el.getAttribute("data-poly-cat") === cat));
      });
      syncMapFilter(cat);
    });
  });
})();
var detail = document.getElementById("pin-detail");
function selectPin(idx) {
  var d = PIN_DATA[idx];
  if (!d || !detail) return;
  document.querySelectorAll(".pin").forEach(function (el) { el.classList.remove("selected"); });
  var g = document.querySelector('[data-pin-idx="' + idx + '"]');
  if (g) g.classList.add("selected");
  var chips = "<span class='chip chip-cat'>" + d.typeLabel + "</span><span class='chip'>● " + d.status + "</span>" + (d.distanceText ? "<span class='chip'>" + d.distanceText + "</span>" : "");
  var fresh = d.freshKind ? "<span class='fresh-tag fresh-tag--" + (d.freshKind === "new" ? "new" : "updated") + "'>" + (d.freshKind === "new" ? "新增" : "更新") + "</span> " : "";
  detail.innerHTML = "<div><span aria-hidden='true'>" + d.glyph + "</span> <strong>" + d.label + "</strong> " + fresh + "</div><p style='margin:4px 0'>" + chips + "</p><p class='dim' style='font-size:14px'>" + d.note + "</p>" + (d.pinNote ? "<p class='small dim'>图钉说明：" + d.pinNote + "</p>" : "") + "<p class='small dim'>坐标：" + d.lat + ", " + d.lng + " · <a target='_blank' rel='noopener' href='https://www.google.com/maps/dir/?api=1&destination=" + d.lat + "," + d.lng + "'>导航到这里 →</a></p>";
}
document.querySelectorAll("[data-pin-idx]").forEach(function (el) {
  var idx = Number(el.getAttribute("data-pin-idx"));
  el.addEventListener("click", function () { selectPin(idx); });
  el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPin(idx); } });
});
document.querySelectorAll("[data-place-idx]").forEach(function (el) {
  el.addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest("a")) return;
    var idx = Number(el.getAttribute("data-place-idx"));
    if (mapReady) {
      var wrap = document.getElementById("ml-map");
      if (wrap && wrap.scrollIntoView) wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      selectMapPin(idx, { fly: true });
    } else {
      selectPin(idx);
      var plot = document.querySelector(".pinplot");
      if (plot && plot.scrollIntoView) plot.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});
/* Interactive MapLibre map — same setup as the live space: real basemap
   (高德 AutoNavi raster tiles, GCJ-02; WGS-84 coords converted at render),
   HTML markers with type glyphs + status
   colors, a popup anchored to the clicked pin, and the selected place's
   verified polygon shown dashed only while selected. If the CDN library
   fails to load or WebGL is unavailable, the static pin-plot fallback
   above stays visible and fully functional; nothing else on the page
   depends on the map. */
/* WGS-84 → GCJ-02: stored coordinates are verified WGS-84, but the 高德
   base tiles are GCJ-02, so coordinates are converted at render time only
   (pins, polygon vertices, map center, flyTo targets). Displayed text and
   the navigation link keep the original WGS-84 values. */
var GCJ_PI = Math.PI, GCJ_A = 6378245.0, GCJ_EE = 0.00669342162296594323;
function gcjTransformLat(x, y) {
  var ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * GCJ_PI) + 20 * Math.sin(2 * x * GCJ_PI)) * 2) / 3;
  ret += ((20 * Math.sin(y * GCJ_PI) + 40 * Math.sin((y / 3) * GCJ_PI)) * 2) / 3;
  ret += ((160 * Math.sin((y / 12) * GCJ_PI) + 320 * Math.sin((y * GCJ_PI) / 30)) * 2) / 3;
  return ret;
}
function gcjTransformLng(x, y) {
  var ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * GCJ_PI) + 20 * Math.sin(2 * x * GCJ_PI)) * 2) / 3;
  ret += ((20 * Math.sin(x * GCJ_PI) + 40 * Math.sin((x / 3) * GCJ_PI)) * 2) / 3;
  ret += ((150 * Math.sin((x / 12) * GCJ_PI) + 300 * Math.sin((x / 30) * GCJ_PI)) * 2) / 3;
  return ret;
}
function wgs84ToGcj02(lng, lat) {
  if (lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271) return [lng, lat];
  var dLat = gcjTransformLat(lng - 105, lat - 35);
  var dLng = gcjTransformLng(lng - 105, lat - 35);
  var radLat = (lat / 180) * GCJ_PI;
  var magic = Math.sin(radLat);
  magic = 1 - GCJ_EE * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic)) * GCJ_PI);
  dLng = (dLng * 180) / ((GCJ_A / sqrtMagic) * Math.cos(radLat) * GCJ_PI);
  return [lng + dLng, lat + dLat];
}
var mlMap = null;
var mlMarkers = [];
var mlPopup = null;
var mlSelected = null;
var mlCategory = "全部";
var mapReady = false;
function buildPopupHtml(d) {
  var fresh = d.freshKind ? "<span class='fresh-tag fresh-tag--" + (d.freshKind === "new" ? "new" : "updated") + "'>" + (d.freshKind === "new" ? "新增" : "更新") + "</span>" : "";
  var chips = "<span class='ml-popup-chip'>" + d.typeLabel + "</span><span class='ml-popup-chip'>● " + d.status + "</span>" + (d.distanceText ? "<span class='ml-popup-chip'>" + d.distanceText + "</span>" : "");
  return "<div class='ml-popup-head'><span class='map-badge map-badge--st-" + d.statusKey + "' aria-hidden='true'>" + d.glyph + "</span><div><h3 class='ml-popup-title'>" + d.label + "</h3><p class='ml-popup-chips'>" + fresh + chips + "</p></div></div>" +
    "<p class='ml-popup-note'>" + d.note + "</p>" +
    (d.pinNote ? "<p class='ml-popup-pinnote'>图钉说明：" + d.pinNote + "</p>" : "") +
    "<a class='ml-popup-link' target='_blank' rel='noopener' href='https://www.google.com/maps/dir/?api=1&destination=" + d.lat + "," + d.lng + "'>导航到这里 →</a>";
}
function applyMapPolygon() {
  if (!mlMap || !mlMap.getLayer("place-polygons-fill")) return;
  var f = ["==", ["get", "key"], mlSelected === null ? "__none__" : String(mlSelected)];
  mlMap.setFilter("place-polygons-fill", f);
  mlMap.setFilter("place-polygons-line", f);
}
function selectMapPin(idx, opts) {
  var d = PIN_DATA[idx];
  if (!d || !mlMap || !mlPopup) return;
  mlSelected = idx;
  mlMarkers.forEach(function (m, i) { if (m) m.getElement().classList.toggle("ml-pin--on", i === idx); });
  applyMapPolygon();
  mlPopup.setLngLat(wgs84ToGcj02(d.lng, d.lat));
  mlPopup.setHTML(buildPopupHtml(d));
  if (!mlPopup.isOpen()) mlPopup.addTo(mlMap);
  if (opts && opts.fly) {
    mlMap.flyTo({ center: wgs84ToGcj02(d.lng, d.lat), zoom: Math.max(mlMap.getZoom(), 13.5), speed: 1.2, essential: true });
  }
}
function deselectMapPin() {
  mlSelected = null;
  mlMarkers.forEach(function (m) { if (m) m.getElement().classList.remove("ml-pin--on"); });
  applyMapPolygon();
  if (mlPopup && mlPopup.isOpen()) mlPopup.remove();
}
function syncMapFilter(cat) {
  mlCategory = cat;
  if (!mapReady) return;
  mlMarkers.forEach(function (m, i) {
    if (!m) return;
    var d = PIN_DATA[i];
    var show = cat === "全部" || i === 0 || (d && d.category === cat);
    m.getElement().style.display = show ? "" : "none";
  });
  if (mlSelected !== null && mlSelected !== 0 && cat !== "全部") {
    var d = PIN_DATA[mlSelected];
    if (d && d.category !== cat) deselectMapPin();
  }
}
(function initMlMap() {
  var wrap = document.getElementById("ml-map");
  var fallback = document.getElementById("map-fallback");
  if (!wrap || !window.maplibregl) return;
  var supported = false;
  try { supported = maplibregl.supported(); } catch (e) { supported = false; }
  if (!supported) return;
  var map;
  try {
    map = new maplibregl.Map({
      container: wrap,
      style: {
        version: 8,
        sources: {
          amap: {
            type: "raster",
            tiles: [
              "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
              "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
              "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
              "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
            ],
            tileSize: 256,
            attribution: "© 高德地图 AutoNavi"
          }
        },
        layers: [{ id: "amap", type: "raster", source: "amap" }]
      },
      center: wgs84ToGcj02(114.402, 30.612),
      zoom: 12,
      attributionControl: { compact: true },
      locale: {
        "NavigationControl.ZoomIn": "放大",
        "NavigationControl.ZoomOut": "缩小",
        "NavigationControl.ResetBearing": "重置方向",
        "AttributionControl.ToggleAttribution": "地图信息"
      }
    });
  } catch (e) { return; }
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  var popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, offset: 20, maxWidth: "320px", className: "th-map-popup" });
  mlPopup = popup;
  popup.on("close", function () {
    if (mlSelected !== null) {
      mlSelected = null;
      mlMarkers.forEach(function (m) { if (m) m.getElement().classList.remove("ml-pin--on"); });
      applyMapPolygon();
    }
  });
  map.on("load", function () {
    mlMap = map;
    var features = [];
    PIN_DATA.forEach(function (d, i) {
      if (d.polygon) {
        features.push({ type: "Feature", properties: { key: String(i), status: d.status }, geometry: { type: "Polygon", coordinates: [d.polygon.map(function (pt) { return wgs84ToGcj02(pt[0], pt[1]); })] } });
      }
    });
    map.addSource("place-polygons", { type: "geojson", data: { type: "FeatureCollection", features: features } });
    var statusColor = ["match", ["get", "status"], "在建", "#d97706", "规划中", "#64748b", "#059669"];
    var noneFilter = ["==", ["get", "key"], "__none__"];
    map.addLayer({ id: "place-polygons-fill", type: "fill", source: "place-polygons", filter: noneFilter, paint: { "fill-color": statusColor, "fill-opacity": 0.16 } });
    map.addLayer({ id: "place-polygons-line", type: "line", source: "place-polygons", filter: noneFilter, paint: { "line-color": statusColor, "line-width": 2, "line-opacity": 0.9, "line-dasharray": [2, 1.6] } });
    PIN_DATA.forEach(function (d, i) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "ml-pin ml-pin--st-" + d.statusKey;
      el.textContent = d.glyph;
      el.setAttribute("aria-label", "在地图上查看：" + d.label);
      el.addEventListener("click", function (e) { e.stopPropagation(); selectMapPin(i); });
      mlMarkers[i] = new maplibregl.Marker({ element: el }).setLngLat(wgs84ToGcj02(d.lng, d.lat)).addTo(map);
    });
    wrap.classList.remove("hidden");
    if (fallback) fallback.classList.add("hidden");
    mapReady = true;
    map.resize();
    var bounds = new maplibregl.LngLatBounds();
    PIN_DATA.forEach(function (d) { bounds.extend(wgs84ToGcj02(d.lng, d.lat)); });
    map.fitBounds(bounds, { padding: 44, maxZoom: 14, duration: 0 });
    syncMapFilter(mlCategory);
  });
})();
</script>
</body>
</html>`;
}

export function buildStaticReadme(data: StaticSiteData): string {
  return `# 华侨城·天荟周边生活信息 — 静态站快照

本文件夹是一个自包含的只读静态网站，由「华侨城天荟周边生活信息」空间导出。

- 数据快照时间：${data.snapshotText}（${data.snapshotAt}，北京时间）
- 内容：速览、最新动态（${data.feedItems.length} 条）、房价走势与分户型、周边配套地图与全部图钉数据（${data.places.length} 处配套）、片区时间线、项目档案、实地施工图
- 形式：只有文本文件；图片已以 base64 内嵌进 index.html，地图库 MapLibre GL 的 JS 与 CSS 也已内嵌进 index.html，页面自包含、不依赖任何后端接口或外部 CDN（本地 file:// 打开也能用）。唯一的在线依赖是地图底图：高德（AutoNavi）瓦片（GCJ-02，渲染时由存储的 WGS-84 坐标转换），与原空间同一套交互地图；网络不可用或 WebGL 不可用时地图自动回退为内置的图钉分布示意图，其余内容不受影响

## 部署

把本文件夹整体放到任意静态托管即可：

- nginx：把 static-site/ 设为站点 root（或复制其中文件到现有 root）。
- GitHub Pages：把 static-site/ 内容推到 Pages 仓库/分支根目录即可（已附 .nojekyll，避免 Jekyll 处理）。

直接用浏览器打开 index.html 也能看（file:// 亦可）。

## 重新生成

快照不会自动更新。数据变化后重新导出一份即可覆盖本文件夹：

- 在原空间（Muse）调用 exportStaticSite 动作；或
- 在本项目目录运行：bun scripts/generate-static-site.ts

静态站是只读快照：笔记、收藏等交互功能不可用（收藏标记为快照时刻的状态）。
`;
}
