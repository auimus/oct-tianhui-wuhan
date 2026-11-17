# Data Plan

## Context provenance
- `我想创建一个关于收集湖北省武汉市洪山区华侨城天荟最新开发情况及附近最新商业，交通等生活相关信息的空间` (verbatim build request; defines the artifact as a living collection hub for this one project + its surroundings, not a generic Wuhan portal)
- No external context applied beyond the verbatim request; all project facts below come from builder web research in this build.

## Tested sources
### Browser search — 华侨城天荟 project facts
**Used by**: static project archive + initial places seed (via post-submit refresh verification)
**Test command**: `browser.search` queries: `武汉 华侨城天荟 洪山区 开发情况`, `武汉华侨城天荟 周边 商业 交通 地铁`, `华侨城天荟 武汉 欢乐大道 杨春湖`
**Sample output**: Location 洪山区团结大道与信和路交汇处, 杨春湖高铁商务区/东湖新城; Developer 武汉天创置业有限公司 (华侨城), builder 中建八局, property 华侨城物业; Land P(2024)149号 2024-12-13 bottom price 24.2亿元, floor price 7700元/㎡; Total land ~70230㎡, GFA ~314299㎡ (some promos say 408100㎡ incl. — use 314299㎡ as permit figure and note variance), FAR 4.48, green 30%, 1986 units, 2351 parking (1:1.18); Phase 1 (03/04 plots): 7 residential + 200m office + 4F commercial, delivery 2027-06-30 毛坯; Phase 2 (01/02): 8 residential + kindergarten + 保租房; First opening 2025-07-11 avg ~13500元/㎡, main types 105㎡ 3BR / 128㎡ 4BR / 139㎡ 4BR, quasi-4th-gen ~97%+ efficiency; Four boundaries: N 团结大道, S 天兴洲绿岛, W 信和路/工业四路站, E 欢乐天际中央区/杨春湖路.
**Processing**: Render as Project Archive section with source links; distances labeled 直线距离参考. Key source URLs verbatim: https://m.163.com/dy/article/KO6B8GE70556C5P1.html , https://www.163.com/dy/article/KKFBQQ0R0556BFBU.html , https://www.163.com/dy/article/LBK25MQN0556PQXX.html

### Browser search — Surroundings (commercial / transport / education / medical / ecology)
**Used by**: places table seed + category filters
**Test command**: `browser.search` same queries + `武汉市中心医院杨春湖院区 金地广场 印象城 周边`
**Sample output**: Transport: Metro L4 工业四路站 ~177-189m (B口), bus stop 团结大道地铁工业四路站 ~259m ~10 routes (1km内 9 stops/24 lines per promo), Metro L19 武汉站西广场 ~1.5km, Wuhan Station ~1.5km, roads 团结大道/欢乐大道/友谊大道, 二环/三环 access; In-construction Metro L10/New Port Line 北洋桥站 ~400m. Commercial: self 6000㎡ community commercial (planned), 金地广场 2.6km (metro 1 stop), 武汉印象城 4.9km, 武商城市奥莱 5km, 欢乐天际广场区 (outlets direction, landing), 东方里/原溪商业街 nearby. Education: 武汉小学洪山华侨城分校 ~493-657m, opened Fall 2023, 2025洪山区划片对口欢乐天际; 街道口小学北洋桥分校 ~988m, 东方雅园分校 ~994m; 钢城十二中 1.7km, 钢城十六中 1.8km, 杨春湖实验学校 2.7km; planned 七一华源中学东湖分校 ~1km+, expected 2027. Medical: 武汉市中心医院杨春湖院区 ~2.1km (some promos ~1km — show 2.1km permit-measured figure), 华润武钢总医院 3.9km, 省人民医院青山院区 4.5km, 市九医院 4.8km. Ecology: 东湖 ~700m, 杨春湖公园 ~800m, 两港公园 ~500m, 北洋桥中央生态公园, 18km greenway + 6.7km water route planned for 高铁商务区.
**Processing**: One row per place with category, distance_text, status (已运营/在建/规划中), description, source_url. Distances always labeled as straight-line reference.

### Browser search — Yangchunhu / Donghu New City momentum + Metro 10
**Used by**: timeline + initial updates feed
**Test command**: `browser.search` `武汉杨春湖高铁商务区 最新进展 2025 2026`, `武汉地铁10号线 北洋桥站 最新进展`
**Sample output**: (1) 2026-09-29 杨春湖高铁商务区科创产业园暨武汉第5家山姆会员店开工: 105亩, ~20亿元, 22.3万㎡, Sam's 7.5万㎡ + 1000 parking, green-building 3-star first in Wuhan, east plot 14.8万㎡科创园 (5A HQ, 5-star hotel, talent apts) — https://news.ifeng.com/c/8wp0dvWdkCH ; (2) Hongshan gov reply: 杨春湖 upgraded to 东湖新城, 2025市区联席机制 restored, roads 礼和路/信和路 etc., 北洋桥公园 due Dec, 武钢云谷606 etc. — https://www.hongshan.gov.cn/xxgk/jbxxgk/qt/yjtabl/sjyta/202509/P020251212527508444177.pdf ; (3) Metro 10 Phase 1 汉口站—北洋桥 ~19km, 8 stations, 7 interchanges, design 120km/h, future Wuhan↔Hankou stations 25 min vs ~1h now; Oct 2026 Yujiatou Yangtze shield 700 rings / 45%; Nov 5 2026 shield under-crossed Line 5 at mm-level — https://feng.ifeng.com/c/8xo8br7oj65 , http://wh.bendibao.com/traffic/20241114/183573.shtm ; New Port Line Phase 1 北洋桥—白玉山 10.9km, 5 stations, 北洋桥站 started 2023-12-22. (4) Sales signal: 克而瑞 2026-09 Hongshan 4BR ranking, 天荟 #2 with 45 units.
**Processing**: Timeline milestones + feed items with published dates where the source gives them; promo phone numbers and sales hype stripped.

### Browser search — 房价走势（2026-11-17 edit: 分户型）
**Used by**: 房价走势 section (getOverview `prices`)
**Test command**: `browser.search` queries: `武汉 华侨城天荟 房价 备案价 均价 2025 2026`, `武汉 杨春湖 二手房 房价 走势`, `武汉 洪山区 新房 二手房 房价 走势`, `华侨城天荟 105平 128平 139平 价格 总价 备案`; opened pages verified line-by-line.
**Verified figures (caliber kept distinct everywhere)**:
- 天荟备案价（2025-07-01 取证，武房开预售〔2025〕193号）: 3# 超高层（105㎡+128㎡）15878 元/㎡, 4# 小高层 128㎡ 20082 元/㎡, 5# 高层（139㎡/143㎡）16821 元/㎡ — https://m.163.com/dy/article/KO6B8GE70556C5P1.html
- 分户型在售（售楼处口径 2026-02）: 在售均价 13000 元/㎡起, 主力总价 136万-181万; 105㎡ 均价约 13500、总价约 140 万起; 128㎡ 总价约 16X 万起; 139㎡ 总价约 18X 万起 — https://enshi.focus.cn/zixun/03c73adf146d16a5.html （128/139 在售单价为按总价起价折算的约数，页面已标注）
- 首开均价 13500（2025-07-11）; 当前平台参考均价 12500（2026-11，房天下/安居客） — https://wuhan.newhouse.fang.com/duibi/2610171936_2610156580.htm
- 天荟四房成交均价 11444（2026-09，克而瑞洪山四房榜，45 套） — https://www.lejucaijing.com/news-7524312112928847493.html
- 洪山区新房月度均价 2025 全年 12 个点（58 爱房，年均 18023.25） — https://mfang.58.com/wh/xinfang/fangjia-hongshan-2025/
- 杨春湖板块二手成交均价 10948.06（2026-09，21 小区 107 套，克而瑞） — https://www.lejucaijing.com/news-7523713164459570660.html
- 杨春湖畔挂牌走势（安居客）: 2026-07 精确值 12892（环比 +0.34%、同比 −8.83%）、2026-06 12848; 更早月份为走势图万元取整约数（14200/13800/13500/13100/12800），页面标注约数 — https://mobile.anjuke.com/esf/wh-cm847252/ （页面有验证码，数值取自搜索结果快照）
- 周边二手挂牌/成交：东湖金茂府 19163/11978、华侨城欢乐天际 17932/11142、万科堤白 18115/12249（同 163 公示文）
- 武汉/洪山快照：2026-10 新房成交 武汉 15917、洪山 13344（克而瑞，10 月为高端项目结构性拉高，9 月全市 13780） — https://www.lejucaijing.com/news-7524282415012574410.html ; 2026-11 房天下参考：武汉新房 13238、二手 12598、洪山二手 12287 — https://fangjia.fang.com/wuhan/
**Processing**: All figures served as a dated snapshot (asOf 2026-11-17) via getOverview; charts built with Recharts from the same arrays the tables display; derived totals computed from stated unit price × area and labeled 估算/折算. Daily refresh prompt extended with 房价动态 topic so price news flows into the feed.

### Map coordinates （2026-11-17 edit: 周边地图）
**Used by**: 周边地图 section (getOverview `mapPlaces`) + static fallback image `client/src/assets/map-static.png`
**Resolution path**: Meta places graph (`local-search`) returned irrelevant results for these Wuhan POIs and `map.geocode` returned wrong-country matches, so coordinates were resolved from Wikipedia station articles + OpenStreetMap Nominatim and cross-checked against each other and the catalog distances (agreement within ~500m for stations, ~15m for 武汉站）:
- 工业四路站 30.6102194, 114.4000694 (Wiki; OSM 30.6101911, 114.4000681) — https://zh.wikipedia.org/wiki/%E5%B7%A5%E4%B8%9A%E5%9B%9B%E8%B7%AF%E7%AB%99 ; 天荟图钉用同一路口（团结大道与信和路交汇处，项目与车站同处该路口，页面已注明）
- 杨春湖站 30.61194, 114.41139 (Wiki) — https://zh.wikipedia.org/wiki/%E6%9D%A8%E6%98%A5%E6%B9%96%E7%AB%99
- 武汉站 30.6095639, 114.4190028 (Wiki; OSM 30.6096150, 114.4191460) — https://zh.wikipedia.org/wiki/%E6%AD%A6%E6%B1%89%E7%AB%99
- 北洋桥 30.6083859, 114.3958765 (OSM bridge; 北洋桥站站点在其一带施工中，页面已注明）
- 街道口小学东方雅园分校 30.6164241, 114.3956590 (OSM)
- 武汉印象城 30.6347221, 114.3851743 (OSM); 杨春湖 30.6167225, 114.4119734 (OSM lake); 武汉欢乐谷 30.5936911, 114.3873884 (OSM)
**Processing**: Interactive map via bundled hatch-maps control + `map_helpers.mjs` (`mountPlaceListMap`, pins synced with the list, Google Maps 导航 links from the same PlaceRefs). 2026-11-17 follow-up edit （用户要求「不同建筑用不同的图标展示」): pins are no longer numbered — each place type gets its own icon glyph + ring color, assigned client-side in `App.tsx mapIconFor` from the existing category/label fields （本项目 🏠 砖红 / 地铁站 🚇 蓝 / 高铁站 🚄 蓝 / 学校 🎓 紫 / 购物中心 🛍️ 橙 / 湖泊 🌊 绿 / 主题乐园 🎡 绿）, with a legend above the map and matching icon badges in the list rows; the hatch-maps marker callback receives `icon`/`pinClass` via the place object (verified in the bundled control: marker is called with the full place object). No new external data. Static fallback generated with `map_urls.mjs static` (center 30.612, 114.402, zoom 12, scale 2), fetched at build time into `client/src/assets/map-static.png`, shown only when the control is unavailable, with the OSM attribution link beneath. Places without verified coordinates （金地广场、小学华侨城分校、市中心医院杨春湖院区、山姆在建地块） stay in the text catalog only — no invented pins. 2026-11-17 follow-up edit （用户要求「点击地图上的图标，显示 popup，展示名称」): `mountPlaceListMap` now forwards `onSelectPlace` to the caller; MapSection shows a popup card over the map with the place name (plus type/status/note + 导航 link and a close button that deselects) whenever a pin or its list row is clicked. No new external data. 2026-11-17 follow-up edit （用户问「数据是不是不全？比如工业四路地铁」): 工业四路站此前只在配套清单里有条目、地图上与项目图钉同点被合并；现新增独立图钉（MAP_PLACES）：4 号线车站、已运营、2013-12-28 随 4 号线一期启用，坐标用上方已核实的维基百科值 30.6102194, 114.4000694 — https://zh.wikipedia.org/wiki/%E5%B7%A5%E4%B8%9A%E5%9B%9B%E8%B7%AF%E7%AB%99 ；因与项目图钉坐标几乎重合，客户端渲染时将车站图钉向东南略移约 90 米（仅显示偏移，弹窗与导航仍用核实坐标），保证两钉都可点选；popup 注明 B 口距项目约 177 米、相邻站为仁和路与杨春湖。

### Map rebuild （2026-11-17 edit: 图钉纠错 + MapLibre 重构 + 配套全量上图 + 状态色 + 多边形）
**Used by**: 周边地图·配套全图 section (getOverview `places` lat/lng/polygon/pinNote + `projectPin`)
**Changes**:
- 项目图钉纠错：原坐标 30.61022, 114.40007 是团结大道与信和路路口（工业四路站）位置；按 OSM 实地核查（地块在团结大道以南、信和路以东、欢乐天际中央区以西，东西约 160 米 × 南北约 250 米，南邻天兴洲绿岛）,图钉移到地块几何中心 30.6092, 114.4015,并注明为近似值（OSM 无项目官方标注）。工业四路站取消原约 90 米显示偏移，直接用核实坐标 30.6102194, 114.4000694。
- 渲染引擎由 hatch-maps 控件换成开源 MapLibre GL JS（maplibre-gl npm 包），底图用 CARTO Basemaps（Positron / Dark Matter，OSM 数据，免费公开样式）。弹窗为 MapLibre Popup，锚定图钉跟随、自动平移保持可见；点图钉不再滚动页面（旧控件会强制滚动到下方列表）。手机端开启 cooperativeGestures（单指滑页、双指拖图）。
- 图钉视觉：图标字形区分类型（🏠🚇🚌🚄🛣️🎓🛍️🏪🏥🌊🎡🌳），颜色区分状态（已运营 #059669 绿 / 在建 #d97706 橙 / 规划中 #64748b 灰），图例双行说明。
- 配套全量整合：原「周边配套」独立板块并入地图板块，分类筛选同时过滤图钉/多边形与清单；清单条目点按可飞定位。PLACES 新增「地铁 4 号线 · 杨春湖站」条目（旧地图有图钉、目录缺条目，本次补齐，坐标 30.61194, 114.41139 同前）。
- 新增坐标核实（OSM/Nominatim + 地址锚点，逐个按目录距离交叉校验）：武汉站西广场站 30.607475, 114.41702（OSM 车站，1498m ✓）；原溪商业街 30.598873, 114.395827（OSM retail,1270m ✓）；钢城十二中 30.624241, 114.398579（1696m ✓）；钢城十六中 30.6228, 114.391274（1801m ✓）；华润武钢总医院 30.634875, 114.397866（OSM hospital，名称精确匹配）；武汉市第九医院 30.625916, 114.374294（OSM hospital）；武商城市奥莱 30.629231, 114.371864（OSM「武商众圆广场」，赢商网证实为同一综合体前身，青山区和平大道 959 号）；金地广场 30.6077, 114.382（公开地址：仁和路地铁站 D 口西约 150 米、团结大道 1335 号；以 OSM 仁和路站点 30.607394, 114.383531 为锚）；两港公园 30.605267, 114.395761（OSM 东湖港港渠点，公园沿港带状分布，已注明）；杨春湖公园沿用杨春湖 OSM 点 30.61672, 114.41197。
- 示意/地块内图钉（均已在弹窗 pinNote 注明）：项目地块内 自带社区商业 30.60975, 114.4013、二期幼儿园 30.60885, 114.4017；主干道 30.61035, 114.4015（团结大道门前路段）；欢乐天际广场区 30.6093, 114.4043（中央区内）；北洋桥中央生态公园 30.607, 114.396（北洋桥一带大致中心）。
- 多边形（真实范围优先）：印象城、欢乐谷、钢城十二中、武钢总医院、市九医院、武商奥莱（众圆广场）的轮廓为 OSM way 实测多边形（Nominatim polygon_geojson，way/775044325、way/983925430、way/1324262435、way/1324274863、way/1077662230、way/399361238，简化后存入 PLACE_GEO）。项目地块多边形按实测尺寸 160m × 250m 以几何中心绘制，明确标注「示意范围，非官方红线」。Overpass API 两实例当时均过载不可用，未能取得更多设施多边形（如杨春湖湖面、武汉站站房）。
- 未上图（坐标多轮检索仍无法核实，清单保留并标注「坐标待核实 · 暂未上图」）：公交·团结大道地铁工业四路站（与地铁站同处路口）、山姆会员店（仅知团结大道南侧核心地块西部）、武汉金诺奥特莱斯（和平村 C3/C4，无精确点位）、武汉小学洪山华侨城分校、街道口小学北洋桥分校、七一华源中学东湖分校（规划）、武汉市中心医院杨春湖院区（礼和路 188 号，无 OSM 点位）、省人民医院青山院区、武汉杨春湖实验学校（团结大道与青王路口，无 OSM 点位）、东湖风景区（湖面巨大，北岸无核实入口点）。
- 静态备用图按全部 23 个图钉重新生成（center 30.614, 114.396, zoom 12, scale 2）。

### 武汉金诺奥特莱斯开工（2026-11-17 edit: 商业动态补充）
**Used by**: 最新动态 feed (SEED_FEED via populateInitial, category 商业) + 周边配套 PLACES (商业 / 在建)
**Source URLs verbatim**: https://news.ifeng.com/c/8xmbYRC4fJa （凤凰网转载极目新闻，主来源）, https://m.winshang.com/news743001.html （观点网佐证）
**Verified facts (from brief, cross-checked by parent agent)**: 2026-11-04 在洪山区和平街道正式开工；选址和平村 C3、C4 产业用地；定位“奥莱+购物公园”，业态包括名品零售、休闲体验、生活配套、潮流消费；总占地 130.12 亩，总投资约 10 亿元，规划总建筑面积约 17 万㎡；紧邻团结大道，地铁 4 号线、12 号线双轨环绕；建成后将成杨春湖片区规模领先的商业综合体，与山姆会员店洪山店互补。
**Processing**: Feed item publishedDate 2026-11-04, sourceName 凤凰网（转载极目新闻）；PLACES entry distanceText 为“和平街道 · 紧邻团结大道”，不写天荟到该项目的距离（未核实，distanceM 9999 仅为排序占位、不展示）；不加地图图钉（坐标未核实）；不写开业/建成时间（未核实，文案注明以官方后续公示为准）。Daily refresh prompt 商业主题已加入“武汉金诺奥特莱斯（和平街道）”跟踪。

### 待核实图钉第二轮核实 + 地图手势修正（2026-11-17 edit）
**Used by**: 周边地图·配套全图 section (getOverview `places` PLACE_GEO 新增 6 条）
**Method**: Overpass API 三实例轮询（overpass-api.de / kumi.systems / nchc.org.tw，多次 502/超时后间歇可用）+ Nominatim（含 polygon_geojson 简化轮廓）+ 官方文件与权威报道交叉校验。上轮 10 处未上图配套，本轮核实上图 6 处：
- 武汉杨春湖实验学校：OSM way/1053823976 校园实测多边形，中心 30.6146, 114.4285；洪山区教育局 2023 督学公示地址「团结大道与青王路交汇处」与 OSM 位置一致，实测距项目约 2.66 公里，与目录口径 2.7 公里吻合 — https://www.hongshan.gov.cn/xxgk/jbxxgk/shgysy/jyfw/jydd1/202312/P020231214369755505885.pdf
- 街道口小学教育集团北洋桥分校：OSM way/1324262447 校园实测多边形，中心 30.61813, 114.40059，OSM 校名为「武汉市洪山区北洋桥小学」，公开地址信和路 19 号（武汉本地宝/查号吧）；实测距项目约 990 米与目录口径 988 米吻合，pinNote 已注明 OSM 标注校名。
- 东湖风景区：Nominatim 返回 OSM 东湖水域 relation 简化轮廓（polygon_threshold 0.0015，主湖区 154 点），图钉落在北岸距项目最近的湖岸点 30.60072, 114.40469（简化轮廓顶点）；pinNote 注明风景区陆域大于水域轮廓。
- 武汉市中心医院杨春湖院区：地址礼和路 188 号（武汉市卫健委医疗机构名单 + 维基百科），院方经中新网介绍「位于沙湖港北路和礼和路交汇处」— http://www.hb.chinanews.com.cn/news/2023/0407/390025.html ；OSM 礼和路在该处以桥跨沙湖港（way/1514084616/4617），图钉落在交汇处 30.6016, 114.3933 并注明 OSM 尚无院区建筑轮廓。注：该点直线距项目约 1.15 公里，清单「约 2.1 公里」为原配套测距（道路）口径，未改动。
- 武汉金诺奥特莱斯：赢商网/观点网报道项目在和平街道园林路开工、紧邻团结大道 — https://m.winshang.com/news743005.html ；图钉落在园林路与团结大道交汇处（OSM 地铁 4 号线园林路站 30.60242, 114.37253），pinNote 注明无实测工地轮廓。
- 公交·团结大道地铁工业四路站：按 brief 许可采用其名称所指的地铁工业四路站已核实锚点（30.6102194, 114.4000694），为便于与地铁站图钉区分点选，沿团结大道略移约 60 米至 30.61, 114.3995，pinNote 已注明依据。
**仍未上图（多轮检索后仍无可靠坐标，继续保留「坐标待核实 · 暂未上图」）**：
- 山姆会员店洪山店：团结大道南侧候选在建地块 OSM way/1514472130（约 58,601㎡）标签为 construction=residential，与商业/产业园性质不符，不能认定为山姆地块；公开报道只有「团结大道南侧核心地块、西部地块」，无精确点位。
- 武汉小学洪山华侨城分校（洪山区东湖新城小学）：洪山区 2026 服务范围公示仅确认其对口欢乐天际等小区 — https://www.hongshan.gov.cn/xxgk/jbxxgk/shgysy/jyfw/jygg/202605/P020260520351829774581.pdf ，无公开校址坐标，OSM 无该校要素。
- 七一华源中学东湖分校：洪山区政府 2025 政协提案答复称仍在设计招标阶段、力争开工，未公布校址点位 — https://www.hongshan.gov.cn/xxgk/jbxxgk/qt/yjtabl/sjyta/202509/P020251212527508444177.pdf
- 武汉大学人民医院（省人民医院）青山院区：仅有聚合站（Moovit）「红钢四街」一处弱来源，无官方/OSM 要素可交叉校验，不予上图。
**手势修正（同轮，用户截图反馈）**: MapLibre 关闭 cooperativeGestures（原英文提示「Use two fingers to move the map」遮挡地图），改为单指拖动平移、双指捏合缩放（国内地图 App 习惯）；Map 构造器加 locale 将缩放/归属控件文案改为中文（放大/缩小/重置方向/地图信息）。

### 市中心医院图钉/距离矛盾修正 + 近似定位补图 + 多边形按需显示（2026-11-17 edit）
**Used by**: 周边地图·配套全图 section (PLACES 市中心医院条目 + PLACE_GEO 新增 4 条 + 客户端多边形行为）
**市中心医院杨春湖院区复核（图钉保留、距离更正）**:
- 地址再确认：武汉市卫健委《武汉地区二、三级医疗机构名单》（2026-01-22）载明武汉市中心医院地址含「武汉市洪山区礼和路188号」— https://wjw.wuhan.gov.cn/bsfw_28/bjcx/yljgmd/202601/t20260122_2716488.shtml ；维基百科同载杨春湖院区为洪山区和平街道礼和路188号。
- 位置互证：院方经中新网介绍院区位于沙湖港北路和礼和路交汇处（URL 同前）；OSM 礼和路（way/775018012 + 跨沙湖港桥段 way/1514084557）与沙湖港（way/962843204，中心 30.60147, 114.39325）要素在现图钉（30.6016, 114.3933）处交汇；Overpass 复查确认 OSM 仍无该院区建筑/医疗要素。
- 距离交叉校验（本轮新增）：图钉距项目图钉（30.6092, 114.4015）直线实测约 1.15 公里；武汉本地宝交通指南称该院区乘 4 号线到仁和路站 B 口出站步行/骑行 1.2 公里即到、公交站点为「欢乐大道礼和路」— http://wh.bendibao.com/health/2023817/168091.shtm ；图钉距仁和路站（OSM 30.607394, 114.383531）直线约 1.14 公里，与 1.2 公里步行口径互证。结论：图钉无误，原条目「约 2.1 公里」系售楼配套测距口径、与图钉矛盾，已改为「约 1.2 公里」（distanceM 1200），条目说明与 pinNote 均已注明口径与校验过程。
**近似定位补图（用户 2026-11-17 指示：位置确定但无精确坐标者，取确定范围内可能性最高的点上图并标注近似）**:
- 山姆会员店（洪山店）：公开报道仅确认「和平街道团结大道南侧核心地块、园区西地块」（格隆汇/凤凰网开工报道 + 工程检测招标公告确认西/东地块划分，无四至）；图钉落在团结大道南侧、高铁商务区核心区西部（杨春湖站西南）30.6075, 114.4095，pinNote 标注近似定位。
- 武汉小学洪山华侨城分校：洪山区教育局 2026 年责任督学名单载明该校（洪山区东湖新城小学）地址为和平街道团结大道、对口欢乐天际 — https://www.hongshan.gov.cn/xxgk/jbxxgk/shgysy/jyfw/jydd1/202609/P020260918541144682496.pdf ；OSM 无该校要素。图钉按门牌路段 + 公开测距 0.49-0.66 公里落在团结大道南侧欢乐天际一带 30.6098, 114.4072（实测约 0.55 公里，与口径区间吻合）。
- 七一华源中学（东湖分校）：洪山区政府 2025 政协提案答复称仍在设计招标、力争开工，选址未公示（URL 同前）；图钉按条目口径约 1.3 公里落在东湖新城核心区（杨春湖站南侧）30.6088, 114.415（实测约 1.3 公里）。
- 省人民医院青山院区：公开来源仅 Moovit 交通指南与社区医疗点地址载明位于青山区红钢四街 5 号一带（Moovit 站点距离：沿港路青山少年宫 437 米、建设七路 486 米、和平大道红钢城 648 米）；OSM 无红钢四街与该院区要素。本轮实测 OSM 红钢一街（way/300389340）、二街（way/300389328）、三街（way/300389351）为平行斜街、间距约 0.004-0.005 经度，图钉按走向间距推定四街位置落在红钢城片区 30.6435, 114.4008，pinNote 标注近似定位并注明条目距离为配套测距口径（注：目录中青山方向医院距离均为售楼配套口径，如武钢总医院标注 3.9 公里 vs 图钉实测约 2.9 公里，本轮未改动其他条目口径）。
- 至此 32 处配套全部上图（28 实测/核实 + 4 近似定位）。
**多边形行为（用户 2026-11-17 指示）**: 多边形默认不显示，仅点击对应图钉/清单条目选中时显示该点位轮廓，边框改为虚线（line-dasharray [2, 1.6]）；分类筛选与选中状态共同决定可见性（App.tsx applyPolygonFilter）。静态备用图已按全部 33 个图钉重新生成（center 30.614, 114.396, zoom 12, scale 2）。

### Construction site photos （2026-11-17 edit: 实地施工图）
**Used by**: 实地施工图 section (getOverview `sitePhotos` metadata; image bytes imported from `client/src/assets/`)
**Source**: Builder's official site — 中建八局一公司 2026-03-29 site-visit report on 武汉东湖新城 149 项目 (= 天荟备案名）: https://www.cscec81.com/198/9171.html
**Processing**: Found via image-search skill; the three site images were preflighted (2xx, image/jpeg + image/png), downloaded into `client/src/assets/` (`site-aerial-202603.png` 1080×720 航拍，楼体可见「华侨城·天荟」标识；`site-visit-202603.jpg` 1080×720 现场出入口；`site-sample-202603.png` 830×719 样板区拼图）, visually verified against the article text, and captioned with date + source. The meeting-room photo from the same article was not used. No newer builder/official site photos were found as of 2026-11-17; sales-render images were rejected as non-documentary.

## Web-search sources
### 华侨城天荟 / 杨春湖 / 地铁10号线 daily refresh
**Delivered by**: `refreshFeed` action -> `saveFeedItems` (expectsAction callback)
**Checked with**: probe-ctx `ctx.tool.web_search("武汉 华侨城天荟 最新进展")` (string-arg form) returned 3 real results with title/url/source/snippet (163.com project updates, haofangdp sales ranking). Confirms runtime search works for Chinese queries. Refresh spawns an agent task that runs 5 searches (天荟开发/销售动态, 杨春湖高铁商务区/东湖新城, 地铁10号线北洋桥, 周边商业 山姆/金茂览秀城/欢乐天际, 教育医疗划片) and returns structured items; the save action dedupes by source_url.

## Agent-task sources
### Daily web refresh agent
**Delivered by**: refreshFeed (spawnTask) -> saveFeedItems
**Checked with**: browser.search evidence above proves the topics return fresh, dated results (Sep-Nov 2026 items found). Agent is instructed to prefer gov.cn / metro / hospital / school official sources over sales promos, keep source_url verbatim, never invent dates, and mark status honestly.

## Long-term data behavior
- **Refresh policy**: Daily cron (per refresh_triggers) calls refreshFeed silently; manual 刷新 button also available. Static archive/places change only when refresh finds a verified status change; feed is append/dedupe by URL.
- **Growth**: Feed grows ~5-15 items per refresh, capped display at latest 100 with category filter; places fixed catalog (~28 rows) updated in place; user notes/bookmarks grow with user use only.
- **Ordering**: Feed newest-first by published date (nulls last, then fetch time); timeline chronological; places grouped by category then distance.
- **Time semantics**: published_at stored as source-stated date text (YYYY-MM-DD) in Asia/Shanghai; fetched_at/created_at are instants rendered viewer-local. Delivery/milestone dates are event dates, not timestamps.

## Imagery
- Imagery not needed: project is under construction until 2027 and no verified, ownable photos of the site were sourced; using stock or promo renderings would misrepresent progress. Design uses typographic hierarchy, distance/status chips, and a schematic timeline instead of photos.

## Rejected approaches
- **Tried**: Treating sales-promo articles (163.com advertorials) as sole source
  **Why rejected**: They conflict on distances/GFA and embed sales phone hype; cross-checked against Hongshan gov PDF, Bendibao metro tracker, and Ifeng news, and labeled promo-only figures as 参考.
- **Tried**: Live map embed with pins
  **Why rejected**: Distances in sources are straight-line promo measurements; a precise-looking map would overstate accuracy. A categorized distance list with 直线距离 disclaimer is more honest.
