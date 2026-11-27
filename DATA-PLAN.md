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
- 七一华源中学（东湖分校）：洪山区政府 2025 政协提案答复称仍在设计招标、力争开工，选址未公示（URL 同前）；图钉按条目口径约 1.3 公里落在东湖新城核心区（杨春湖站东北侧一带）30.6088, 114.415（实测约 1.3 公里）。
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

### 静态站导出（2026-11-18 edit: static-site/ + exportStaticSite）
**Used by**: static-site/ 文件夹（自包含只读快照）+ 页面「静态站导出」板块 + 每日 GitHub 同步前重新生成
**Request**: 用户要求同步到 GitHub 时同时生成可直接部署的静态网站：全部展示内容连同当时数据冻结、自包含、不依赖后端、任意静态托管可打开；二进制资源以 base64 等文本形式内嵌，保证 static-site/ 只有文本文件且总大小尽量 <10MB（同步通道只能推文本）；只读快照注明数据快照时间；提供可调用动作按当前数据重新生成，本次先实际生成一份。
**Implementation**:
- 数据常量（PROJECT/PLACES/PLACE_GEO/MILESTONES/PRICES/PROJECT_PIN/SITE_PHOTOS/SEED_FEED）从 actions.ts 抽到 `server/src/data.ts`，live 动作与导出共用同一份数据，不会漂移。
- `server/src/static_template.ts`：纯函数 HTML 构建器（速览/动态/房价与分户型/地图静态图+经纬度投影图钉图+全量配套清单/时间线/档案/施工图 + 内嵌全量 JSON），live 与本地脚本共用。
- `server/src/privileged.ts`：特权契约 writeStaticSite（宿主侧读 client/src/assets 四张图转 base64、写 static-site/index.html + README.md + .nojekyll）。
- 动作 `exportStaticSite`：从 DB 取当前动态（≤100 条，含收藏标记）+ 静态目录数据，组装快照载荷后调特权写文件，返回快照时间/文件数/总字节。每日同步任务调用它重新生成；页面也有「生成静态站快照」按钮可手动触发。
- 本地等价脚本 `scripts/generate-static-site.ts`（bun 运行，直读 app.db + data.ts），本次已实际生成一份：static-site/ 共 3 个文本文件、约 3.8MB（index.html 约 3.9MB，四张图 base64 内嵌：航拍 PNG 为主要体积），远低于 10MB 上限。
- 注：当前页面已无「武汉侨城会」公众号追踪板块（2026-11-17 用户决定不集成），静态快照与 live 页面板块保持一致，不含该板块；若日后恢复该板块，模板需同步加一节。
- **呈现规则（用户 2026-11-18 指示）**：静态页正文不出现「只读静态快照 / 数据冻结 / 不连接后端」一类元描述——已删除页首砖红色快照横幅、标题与 meta 中的快照字样、正文各处「快照时刻 / 快照共 N 条 / 快照日期」措辞及页脚的部署技术说明；仅页脚保留一句小字：「本页内容截至 <快照时间>（北京时间），为静态页面，不会自动更新。」快照时间仍保留在内嵌 JSON 与 README.md 中供维护使用。

### 静态站交互地图（2026-11-18 edit: 用户「地图没必要也是静态的吧」）
**Used by**: 静态站（static_template.ts）周边地图板块
**决定**: 静态站地图不再用静态地图图 + 经纬度投影示意图作主视图，改为与空间本体同一套 MapLibre GL 交互地图：
- 库从 jsdelivr CDN 加载（构建时实测 200）：`https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.min.js` 与 `https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.css`；底图为内联 style JSON + OpenStreetMap 栅格瓦片 `https://tile.openstreetmap.org/{z}/{x}/{y}.png`（标注 © OpenStreetMap contributors）。
- 图钉为 HTML marker：分类字形 + 状态色（与本体一致），坐标全部沿用 PIN_DATA 核实值（项目 30.6092, 114.4015；工业四路站真实坐标不偏移）；点击图钉弹出锚定 popup（名称/分类/状态/距离/新增·更新标签/图钉说明/导航链接）；已核实多边形仅在选中时以虚线显示（PIN_DATA 新增 polygon/statusKey 字段，33 钉中 10 个带多边形）；中文控件文案；单指拖动平移、双指捏合缩放（不启用 cooperativeGestures）。
- 联动：分类筛选同步增减图钉；点配套清单条目 → 地图 flyTo 对应图钉并打开 popup（不再滚动到示意图）。
- 兜底：CDN 加载失败（window.maplibregl 缺失）、`maplibregl.supported()` 为假或构造抛错时不初始化地图，原 pinplot 经纬度投影示意图 + 详情卡（#map-fallback）保持显示且功能完整（点钉/点条目看详情）；地图 load 成功后才隐藏兜底并显示地图容器。页面其余内容不依赖地图加载状态。
- 静态地图图（map-static.png 内嵌 figure）已从静态站地图板块移除（模板不再引用 images.mapStatic；privileged/脚本仍照常传参，无害）。重新生成后 static-site/index.html 约 3.6MB（比此前少了静态图 base64）。
- 空间本体 App.tsx 地图未改动。
- **底图瓦片源修正（2026-11-18）**：用户在国内用手机打开公网静态页反馈「没有底图」（只有图钉、无道路底图）。原因：静态站瓦片源 tile.openstreetmap.org 在国内网络经常加载不到/极慢。已将空间本体（App.tsx）与静态站模板（static_template.ts）两处地图的底图统一改为 CARTO basemaps 光栅瓦片（`https://{a,b,c,d}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`，深色模式本体用同 CDN 的 dark_all 光栅；两条路径均已实测返回 200），attribution 改为「© OpenStreetMap contributors © CARTO」。CARTO 底图数据仍为 OpenStreetMap、坐标系仍为 WGS-84，全部已核实图钉与多边形位置不变；明确不采用高德/百度瓦片（GCJ-02 坐标会使图钉整体偏移）。
- **地图库内嵌（2026-11-18，supersede 上方「库从 jsdelivr CDN 加载」一条）**：用户在电脑上以本地文件（file://）打开下载的 index.html 时静态站地图掉回示意图——jsdelivr CDN 外链脚本在本地/受限网络下加载失败。已将 maplibre-gl@4.7.1 的 dist 文件（`client/src/assets/maplibre-gl.min.js` 约 798KB + `maplibre-gl.css` 约 66KB，自 jsdelivr 下载、与原 CDN 外链同一版本同一文件）作为本地资产保存，生成静态站时（exportStaticSite 特权端与 scripts/generate-static-site.ts 两条路径）由 `buildStaticSiteHtml(data, images, mapLib)` 直接内联为 `<script>`/`<style>`；生成的 index.html 除高德瓦片外不再依赖任何外部 CDN，file:// 打开也能出交互地图。生成时读不到库文件才保留 CDN 外链兜底；WebGL 不可用时仍回退示意图。空间本体 App.tsx 走打包、不依赖 CDN，未改动。
- **底图瓦片源再修正（2026-11-18， supersede 上条）**：用户在中国大陆手机上打开页面反馈底图依旧空白——basemaps.cartocdn.com 在国内同样加载不到（底图源第二次在国内失效）。空间本体（App.tsx）与静态站模板（static_template.ts）两处地图底图统一改为高德（AutoNavi）光栅瓦片 `https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}`（国内直连、无需 key；构建时实测四个子域名均返回 200，项目附近 z15 瓦片内容为工业四路/北洋桥站/项目地块一带），attribution 改为「© 高德地图 AutoNavi」；深色模式也用同一套高德瓦片（去掉 CARTO dark_all）。**坐标处理（关键）**：高德瓦片为 GCJ-02 坐标系，而本项目全部已核实坐标（项目图钉、各配套图钉、多边形顶点）存储的仍是 WGS-84，**存储数据不改**；仅在渲染层用标准 WGS-84→GCJ-02 转换算法（两处代码各一份 `wgs84ToGcj02`）把喂给 MapLibre 的坐标转换后再渲染——图钉位置、多边形顶点、地图初始中心、fitBounds、flyTo 目标、弹窗锚点全部转换（武汉地区偏移约东 470 米 / 南 250 米，转换精度几米内，图钉落在底图正确位置）。弹窗与页面中显示的距离、坐标等文字一律仍用原始 WGS-84 数据计算与展示，不显示转换后坐标；静态站兜底示意图用原始坐标投影，不受影响。此前「不采用高德瓦片」的顾虑已由渲染层转换解决。
- **地图引擎更换（2026-11-18，supersede 本节 MapLibre 相关各条，仅限静态站）**：用户在普通电脑浏览器以 file:// 打开最新版 index.html（4,589,253 字节，确认新版），地图仍掉回示意图，开发者工具网络面板显示页面从未请求过高德瓦片。已核查：内嵌 MapLibre 脚本与源文件逐字节一致、未损坏；模板初始化先调 `maplibregl.supported()` 检查 WebGL，不支持即 return——用户机器浏览器 WebGL 不可用，地图永远起不来。**结论：静态站不能再依赖 WebGL 引擎。** 已将静态站地图引擎换成 Leaflet 1.9.4（纯 DOM 渲染、无 WebGL、无 Worker，file:// 本地打开可跑）：`client/src/assets/leaflet.js`（147,552 字节）+ `leaflet.css`（14,806 字节）自 jsdelivr 下载保存为本地资产，生成时与此前同一机制内联进 index.html（privileged.ts 与 scripts/generate-static-site.ts 的 readMapLib 改读这两个文件；类型 StaticMapLib 更名 StaticLeafletLib），页面除高德瓦片外零外部依赖，生成时读不到库文件才保留 jsdelivr CDN 外链兜底。功能一一对应迁移：高德瓦片改用 Leaflet `{s}` 子域名模板（webrd01–04、style=8、attribution「© 高德地图 AutoNavi」、`attributionControl.setPrefix(false)` 去掉 Leaflet 默认前缀）；WGS-84→GCJ-02 转换函数不变，新增 `gcjLatLng` 适配 Leaflet 的 [lat,lng] 顺序，图钉/多边形顶点/初始中心/flyTo 目标/弹窗锚点照旧转换，存储数据与弹窗文字仍用 WGS-84；分类图标用 divIcon 复刻圆形图标+状态色边框与选中放大态（.lf-pin 系列样式）；点击图钉弹出锚定弹窗（autoPan 只平移地图不滚动页面）；已核实多边形平时不入图、点击对应图钉才以虚线（dashArray 6 5）显示；分类筛选改为图钉增删图层联动；点清单条目 flyTo 定位并开弹窗；单指拖动/双指捏合/滚轮缩放为 Leaflet 默认；缩放控件中文标题（放大/缩小）。Leaflet 加载失败或构造抛错时仍保留 pinplot 示意图兜底。验证（2026-11-18 14:06 重新生成）：生成页 0 处 maplibre 引用、Leaflet 1.9.4 已内嵌、两段内联脚本 `node --check` 均通过、高德瓦片地址与转换逻辑在位、文件约 3.89MB（比 MapLibre 版小约 0.7MB）、37 条动态/32 处配套不变。**空间本体 App.tsx 仍用 MapLibre，未改动**（本体跑在 Muse 客户端内，WebGL 可用）。
- **根因纠正 + 最小修复（2026-11-18，supersede 上条「地图引擎更换」）**：用户自行核查下载的 index.html 并加载内嵌 MapLibre GL JS 4.7.1 实测——`maplibregl.Map` 存在，但 **`maplibregl.supported()` 在 4.7.1 中根本没有导出**；模板 `initMlMap` 第一步调它即抛 TypeError，被旧守卫的 try/catch 吞掉后 `supported=false` 直接 return，初始化在请求高德瓦片之前就终止（与网络面板零瓦片请求完全吻合）。上条把根因归于「用户机器 WebGL 不可用」是误判，用户机器有 WebGL；Leaflet 换引擎方案据此取消，三个文件（static_template.ts / privileged.ts / scripts/generate-static-site.ts）已回退到 MapLibre 版本。**最小修复（仅 static_template.ts 的 initMlMap）**：删除 `supported()` 调用、其 try/catch 守卫与提前 return；保留 `window.maplibregl` 存在性判断后，直接在原有 try/catch 里 `new maplibregl.Map(...)`；catch 不再静默 `return`，先 `console.error` 打印初始化异常再回退示意图。并在 init 处留注释说明 4.7.1 无此导出、禁止再加该预检。其余全部不变：内嵌 MapLibre 库、高德瓦片、WGS-84→GCJ-02 渲染转换、图钉/弹窗/虚线多边形/筛选联动/单指拖动/中文控件、pinplot 示意图兜底；client/src/assets 下的 leaflet.js/css 成为未引用文件（无害，保留）。验证（2026-11-18 14:09 重新生成）：生成页 `.supported(` 出现 0 次、initMlMap 与 console.error 回退日志在位、0 处 Leaflet 残留、两段内联脚本（内嵌库 797,892 字节 + 页面脚本 34,252 字节）`node --check` 均通过、37 条动态/32 处配套、文件 4,589,589 字节。瓦片在真实浏览器里是否正常显示待用户下载新版后确认。

### 静态站布局压缩（2026-11-18 edit: 用户「整页太长了」）
**Used by**: 静态站（static_template.ts）整体版式；空间本体 App.tsx 未改动；内容一条未删（动态仍 37 条、图钉仍 33 个、配套仍 32 处，生成后逐项核对过）。
**改动**:
- **区块顺序**按看房习惯重排：项目概况（关键数据指标带）→ 房价走势 → 周边地图·配套全图 → 最新动态 → 片区时间线 → 项目档案 → 实地施工图 → 综合评价（仍在页尾，用户此前明确要求）；README 内容清单同步改为新顺序。
- **吸顶锚点导航**：页头下方 `.topnav`（position:sticky）五枚锚点 概况 / 房价 / 地图配套 / 动态 / 评价，顺序与区块一致；`html{scroll-behavior:smooth}`（reduced-motion 时关闭）+ `section[id]{scroll-margin-top:64px}` 防锚点被吸顶条遮挡；原页头 `nav.toc` 目录删除。
- **动态折叠**：默认只显示最近 8 条，第 9 条起服务端渲染即带 hidden；底部「展开全部（共 N 条）/ 收起」按钮（`.more-btn`，aria-expanded 同步）。页面脚本以 `applyFeed()` 统一管理可见性——分类筛选与折叠共用同一规则（筛选后仍只显示该分类前 8 条、切换分类重置为折叠），替换原通用 `bindFilter`（仅动态用过，已移除）。
- **指标带**：原 `.grid4` 两处（页头关键数据、房价四项指标）改为 `.metrics` flex 紧凑带（一行多列、窄屏自动换行、单元格 flex:1 1 150px）；页头关键数据移入新增「项目概况」区块。
- **房价分户型**：四户型卡入 `.unit-grid`（<560px 一列 / ≥560px 两列 / ≥1024px 四列）；户型趋势图改用紧凑画布（lineChartSvg 新增可选 w/h 参数，户型卡传 360×176，其余图表仍 720×190）；卡内表格字号 12px、单价列允许换行防溢出。
- **配套清单**：入 `.place-grid`（≥760px 两列、窄屏一列）；卡片压缩为徽章 + 标题行 + 一行小字（状态 chip · 类型 · 距离），说明正文/坐标/来源/导航/图钉说明收进卡内 `<details>详情</details>`（内容不删）；卡片点击联动逻辑不变，但点 `<summary>`/链接不再触发地图平移（守卫改为 closest("a, summary")）。地图容器高度 440→420px（手机 380→360px），图钉/弹窗/虚线多边形/筛选功能全部保留。
- **全局收紧**：正文最大宽度 860→1120px（宽屏更短）；h2 上边距 38→26px、h3 22→16px、卡片内边距 14/16→12/14px、页脚上边距 44→32px；实地施工图入 `.photo-grid`（≥760px 三列）；时间线 ≥900px 两列。
**验证（2026-11-18 14:35 重新生成）**: 脚本无报错；生成页核对——动态 article 37 个（29 个初始 hidden）、PIN_DATA 图钉 33 个、配套卡 32 个、feed-toggle 按钮 1 个且文案「展开全部（共 37 条）」、topnav 在位且五锚点顺序正确、八个区块 id 顺序严格递增、`.supported(` 仍 0 次、两段内联脚本（内嵌库 + 页面脚本）`new Function` 语法检查均通过；文件约 4.49MB。

### 新增/更新标记机制（2026-11-18 edit: 标签/水印）
**Used by**: 最新动态 feed 卡片 + 周边配套清单/地图弹窗 + 静态站同名渲染（.fresh-tag 样式，theme.css 与 static_template CSS 各一份，保持一致）
**规则（标记必须对应真实的新增/变化，禁止编造日期）**:
- **动态（feed）**：服务端 listFeed 计算 freshness——条目 fetchedAt 与全库最新 fetchedAt 属同一北京时间自然日、且最新 fetchedAt 距当前 ≤48 小时 → freshness="new"，否则 null。客户端标题旁渲染「新增」小 pill，卡片加左侧主题色细边 + 极浅主题色底（.feed-fresh）。窗口过后自动消失，无需人工清理。exportStaticSite 与 scripts/generate-static-site.ts 用同一规则把 freshness 写进快照 JSON，静态模板据此渲染。
- **配套（places）**：`server/src/data.ts` 的 Place 类型有可选字段 addedOn / updatedOn（YYYY-MM-DD，目录维护日期）。客户端以「今天」判断、静态站以快照日期判断：距今 ≤14 天渲染「新增」（addedOn）/「更新」（updatedOn）标签，addedOn 优先；出现在配套清单条目、地图弹窗与静态备用卡片中。地图图钉本身样式不变。
- **种子日期出处（均为 2026-11-17 当日已核实的目录变更，见本文件当日各节记录）**：武汉金诺奥特莱斯 addedOn 2026-11-17（当日纳入跟踪）；山姆会员店、武汉小学洪山华侨城分校、七一华源中学东湖分校、省人民医院青山院区 addedOn 2026-11-17（当日近似定位补上图）；地铁 4 号线 · 杨春湖站 addedOn 2026-11-17（当日补齐目录条目）；武汉市中心医院杨春湖院区 updatedOn 2026-11-17（当日距离口径由约 2.1 公里更正为约 1.2 公里）。其余条目不填日期字段。
- **维护规则**：日后新增配套条目时填 addedOn 为实际新增日期；修改条目内容（距离/状态/说明更正）时把 updatedOn 更新为修改日期；不要给没有真实变更的条目补日期。标签 14 天后自动消失，字段本身保留作维护记录。

### 页头天气（2026-11-18 edit）
**Used by**: 页头标题区右侧天气块（live PulseHeader + 静态站页头同位置）
**Source**: Open-Meteo 免费接口（无需 key）`https://api.open-meteo.com/v1/forecast?latitude=30.6092&longitude=114.4015&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Shanghai&forecast_days=1`，坐标为项目图钉（30.6092, 114.4015）。构建时实测可取到数据（2026-11-18 10:30 返回多云 13.4°C 等）。
**Processing**: WMO weather_code → 中文状况 + 图标映射在 `server/src/data.ts` 的 weatherText（客户端兜底 fetch 有同名映射副本）。服务端 getOverview 内 fetch、模块级缓存约 20 分钟（失败缓存 5 分钟），超时 6 秒；失败返回 null、前端整块隐藏，绝不阻塞页面。服务端为 null 时客户端浏览器直连 Open-Meteo 兜底（该接口支持 CORS）。静态站显示快照时刻天气并注明「快照时刻数据」，生成时取不到则整块省略。展示口径：当前温度 + 状况、今日最低~最高温、相对湿度、风速（km/h）。

### 综合评价（2026-11-18 edit）
**Used by**: 页面最后「综合评价」板块（Notes 之后、页脚之前）+ 静态站同名板块
**Content**: 常量 EVALUATION 在 `server/src/data.ts`，live 与静态共用。综合评分 7.8/10；分项：交通出行 9.0、生态环境 8.5、教育医疗 7.5、价格与潜力 7.5、商业配套 7.0、居住品质 7.0，每项一句依据，依据全部出自本页已核实数据（177 米地铁站、1.0 公里东湖（2026-11-18 全量核验由 700 米更正）、493 米小学、1.2 公里市中心医院院区、12,500 元/㎡平台参考均价、容积率 4.48、得房率约 97%+、山姆/金诺奥特莱斯在建、2027-06-30 一期交付）。评分日期 2026-11-18，板块注明为主观综合判断、不构成购房建议。
**维护规则**: 数据重大变化时同步复核评分并更新 asOf 与 DATA-PLAN 本节：在建配套开业（山姆、金诺奥特莱斯、自带商业）→ 商业配套上调；10 号线通车 → 交通已满分附近微调说明；新一轮价格快照明显变化 → 价格与潜力复核；一期交付 → 居住品质复核。不要在无数据变化时随意改分。

### 山姆会员店位置纠错（2026-11-18 edit，用户截图指出）
**问题**: 原条目图钉在 30.6075, 114.4095（项目以东、杨春湖站方向），distanceM 900，选址表述含糊——方向完全错了，距真实地块约 2 公里。
**核实依据**: 湖北日报口径——山姆位于洪山区和平街道团结大道南侧、仁和路东侧，近地铁 4 号线仁和路站；OpenStreetMap 实测仁和路站坐标 30.6074, 114.3835，仁和路与团结大道交叉口约 114.3836，在项目（114.4015）以西约 1.7 公里。地块数字（105 亩、总投资近 20 亿元、总建面约 22.3 万㎡、山姆 7.5 万㎡ + 1000 车位、东部 14.8 万㎡科创产业园）与公开报道一致，未改。
**修正**: 图钉移到地块西侧、仁和路/团结大道交叉口东南一带 30.6065, 114.3875（保持「近似定位」标注，pinNote 已按湖北日报口径改写）；distanceM 按新图钉与项目直线距离重算为 1400（实测约 1373 米），distanceText「约 1.4 公里 · 仁和路东侧」；description 补准确选址表述并删去暗示其位于杨春湖站附近的说法；updatedOn 设 2026-11-18。

### 周边配套全量核验（2026-11-18 edit，用户要求「对所有周边设施信息验证下，确保数据准确」）
**Used by**: 周边配套目录 PLACES + PLACE_GEO（空间本体与静态站同源 `server/src/data.ts`）；配套由 32 处变为 30 处，图钉由 33 个（32 配套 + 项目）变为 31 个（30 配套 + 项目）。所有改动条目 updatedOn 设 2026-11-18。
**方法**: OSM 坐标比对 + 以项目图钉（30.6092, 114.4015）为原点 haversine 直线距离重算 + 官方/公开报道核状态与关键说法。
**删除 2 条**:
- 武汉大学人民医院（省人民医院）青山院区：整条删除（含图钉）。依据：武汉大学人民医院官方口径仅首义、光谷、洪山三个院区，全网无该院区开业/选址的可靠报道，存在性无法核实。此前 2026-11-17 的近似定位补图记录（红钢四街推定点）自本轮起作废。
- 街道口小学教育集团北洋桥分校：删除独立条目（含图钉与校园多边形）。依据：洪山区政府网官方文件（北洋桥小学 2024 年单位预算编制说明）称该校已与街道口小学东方雅园分校合并、无学生及在职人员。「街道口小学（东方雅园分校）」说明已补「北洋桥小学已并入该校」。
**距离修正（图钉不动，distanceM 取图钉直线实算值，distanceText 为约数）**: 北洋桥站 400→约 550 米（实算 545）；金地广场 2.6 公里→约 1.9 公里（1874）；武汉印象城 4.9 公里→约 3.2 公里（3239）；武商城市奥莱 5 公里→约 3.6 公里（3606）；华润武钢总医院 3.9 公里→约 2.9 公里（2876）；武汉市第九医院 4.8 公里→约 3.2 公里（3199）；两港公园 500 米→约 700 米（702）；东湖风景区 700 米→约 1.0 公里（991，图钉为 OSM 东湖最近岸线点，无误）；杨春湖公园 800 米→约 1.3 公里（1305，图钉保留）；武汉欢乐谷/玛雅海滩 2.8 公里→约 2.2 公里（2190）。时间线中北洋桥站「距天荟约 400 米」与综合评价中「东湖约 700 米」已同步更正（550 米 / 1.0 公里），评价分数不变。
**金诺奥特莱斯**: distanceM 9999（占位值，不展示）→2900，distanceText 改为「约 2.9 公里 · 园林路与团结大道交汇一带」（图钉实算约 2873 米）；图钉 pinNote 补「近似定位」标注（路口近似点，地块四至未公示）。
**七一华源中学**: 条目名改为「七一华源中学（东湖新城分校）」（PLACE_GEO 键、时间线条目、综合评价依据、每日刷新提示词同步改名）。依据：官方名为东湖新城分校，据洪山区政府 2025 年政协提案答复尚在设计招标阶段、选址未公示，「预计 2027 年开学」仅为宣传口径、无官方确认；说明与 pinNote 均注明与仁和路已开工的「七一华源中学东湖分校」不是同一所。状态保持规划中、图钉保持近似定位。
**小修正**: 武汉杨春湖实验学校说明补注「民办九年一贯制学校」。
**连带清理**: 全站检索已删两条的其他引用——综合评价、概况、时间线均无指向省人民医院青山院区的说法；北洋桥分校仅剩东方雅园分校说明中的合并说明与七一华源条目中区分另一所学校的必要提及（均为有意保留的事实说明，非指向已删条目）。
**核验无误、未动**: 工业四路站、武汉站、武汉站西广场站、主干道条目、市中心医院杨春湖院区、北洋桥中央生态公园、山姆（已修正并复核通过）、武汉小学洪山华侨城分校、东方雅园分校（距离）、钢城十二中、钢城十六中、天荟自带商业、欢乐天际广场区、东方里/原溪、二期幼儿园。
**待核事项（已解决，2026-11-19）**: 地铁 4 号线 · 杨春湖站图钉两源冲突已核实解决——OSM 位置正确，维基百科坐标有误。依据（2026-11-19 复查 OSM）：同一位置四类要素在 10 米内互相印证——车站节点 node 2134350587（30.6075929, 114.4107285）、两个 stop_position 节点、地下站体 way 1413481179（中心 30.6076004, 114.4107404）、stop_area 关系 7733094；该点落在杨春湖路上。而维基坐标点（30.61194, 114.41139）距杨春湖路中心线约 200 米、落在路东街区内、无任何车站要素，偏离 OSM 位置约 488 米。修正：图钉改用 OSM 车站节点坐标 30.6075929, 114.4107285；distanceM 按项目图钉（30.6092, 114.4015）实算 901 米，改为 900、distanceText 改为「约 900 米」，updatedOn 设 2026-11-19；七一华源中学（东湖新城分校）pinNote 中相对方位由「杨春湖站南侧」改为「杨春湖站东北侧一带」（该校图钉 30.6088, 114.415 相对新站位在东北侧）。

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
## 周边地铁线路核验（2026-11-22）

核查时间 2026-11-22。方法：Overpass API（overpass-api.de）查询项目周边 bbox（30.58–30.64，114.36–114.44，另扩至 30.55–30.65，114.30–114.48 排查）内的 route=subway relation 与 railway=construction 在建线路 way；以 relation 成员 stop_position 节点核对站名与站序；以维基百科、武汉本地宝、荆楚网/湖北日报交叉核对各线状态与开通时间。Overpass 当天负载高，大批量 id 查询曾返回 400/502/504，改用小批量（≤27 个 id）+ 重试后全部取回。

核实到 5 条线（4 公里内 4 条已运营 + 1 条在建），均已上图；下方配套列表未为线路新增条目。

| 线路 | 状态 | 颜色 | OSM 依据 | 开通/建设 |
|---|---|---|---|---|
| 4 号线 | 已运营 | #A6D30B（草绿） | relation 5454752、9633081 | 2013-12-28 开通 |
| 5 号线 | 已运营 | #a43034（枣红） | relation 13647960、13647961 | 2021-12-26 开通 |
| 12 号线 | 已运营 | #00A3E9（湖蓝） | relation 20622642、20629061 | 一期（钢都花园—墨水湖公园）2026-05-01 开通；二期及连接线 2026-10-29 开通，全环运营 |
| 19 号线 | 已运营 | #5ac1a7 | relation 16890959、16890960 | 2023-12-30 开通 |
| 10 号线 / 新港线 | 在建 | #7f74ac（江豚紫，维基模板值） | 在建线路 way 1123376232、1126399977（名「武漢地鐵新港線 (建設中)」；无 route relation） | 10 号线一期 2021-12-26 开工；新港线一期北洋桥站 2023-12-22 开工 |

纠正：任务简报称 12 号线「在建」，实为已运营——维基（武汉轨道交通 12 号线）与荆楚网/湖北日报 2026-05-09 报道均确认一期 2026-05-01 开通；武汉本地宝 2026-10 更新确认二期 2026-10-29 开通。

图示段内站点（按 OSM 走向顺序，站名经 stop_position 节点核对，站距轨道 0–20 米）：
- 4 号线（铁机路—武汉火车站段）：铁机路、罗家港、园林路、仁和路、工业四路、杨春湖、武汉火车站。距项目：工业四路 174 米、杨春湖 903 米、武汉火车站 1693 米、仁和路 1730 米、园林路 2811 米、罗家港 3746 米、铁机路 4416 米。
- 5 号线（武汉站东广场—科普公园段）：武汉站东广场、厂前、武钢、工人村、青宜居、红钢城、和平公园、建设二路、科普公园。距项目：武汉站东广场 1891 米、厂前 2664 米、武钢 3192 米、工人村 3276 米、和平公园 3364 米、建设二路 3549 米、红钢城 3618 米、青宜居 4132 米、科普公园 4190 米。
- 12 号线（科普公园—团结大道段）：科普公园、钢都花园、园林路、团结大道。距项目：园林路 3019 米、钢都花园 3732 米、科普公园 4326 米、团结大道 4416 米。
- 19 号线：图内仅起点站武汉站西广场（距项目 1504 米），下一站武东在图外。
- 10 号线 / 新港线（自西向东）：余家头、钢都花园、工业路、北洋桥、武汉火车站。站位按武汉本地宝 10 号线一期 8 站与新港线一期 5 站名单列出，未以 OSM 节点逐一核实坐标（在建线路无 station 节点）。

几何处理：各线 relation 的 way 成员按端点节点串联成单条折线（双向 relation 共用同一组 way，去重后取最长链）；裁剪到地图窗口（lng 114.35–114.45，lat 30.575–30.645）；Douglas-Peucker（25 米）+ 40 米最小间距抽稀。各线点数：4 号线 15、5 号线 23、12 号线 13、19 号线 13、10 号线/新港线 27，共 91 点，WGS-84 存于 server/src/data.ts 的 METRO_LINES，渲染层按既有约定转 GCJ-02。新港线两条平行轨道 way 取其一（1123376232）作单线绘制。

已知偏差（未改动既有数据，仅记录）：
- 北洋桥站现有图钉（30.60839, 114.39588）为北洋桥位置近似点，距 OSM 新港线走向约 450 米（走向在南侧，lat 约 30.6042）；图钉说明已注明「车站在其一带施工中」，本次未移动图钉，线按 OSM 走向绘制。
- 钢都花园处 10 号线与 12 号线换乘：12 号线止位点距 10 号线在建走向约 130 米，两线走向在该处相交，以 OSM 为准。
- 北洋桥站无 OSM station 节点（与 2026-11-18 全量核验时一致）；12 号线团结大道站止位点（30.59489, 114.35847）曾因在 bbox 西缘之外被漏列，后经 relation 全量成员补回。

### 装修参考栏目（2026-11-26 edit: 用户要求新增）
**Used by**: 「装修参考 · 128㎡全屋智能两方案」栏目（live 房价之后、地图配套之前；静态站同位置，导航新增「装修」锚点）
**来源**: 内容全部由用户在 2026-11-26 对话中逐项给定（米家/华为两方案要点、对比表、通用预埋清单、分阶段路线、提醒、页脚注），属用户自备的通用参考内容，非外部检索数据；华为价格为 2025 年官方智装组合参考价，栏目页脚已注明「实际以门店报价为准」。
**隐私约束（用户明确要求）**: 只写通用信息，统一以「以 128㎡户型、简装为前提」表述；严禁出现楼层、房号、业主姓名、「业主预算有限」等个人化表述（方案内「适合：预算有限」为面向读者的通用人群描述，非业主个人情况）。
**Implementation**: 常量 RENOVATION 在 `server/src/data.ts`，live（getOverview `renovation` 字段 + App.tsx RenovationSection）与静态站（static_template.ts 同名渲染 + exportStaticSite 载荷 + scripts/generate-static-site.ts）共用同一份数据。addedOn=2026-11-26，栏目「新增」标记沿用配套的新鲜度机制（placeFreshKind 14 天窗口，live 按今天、静态站按快照日期判断），过期自动消失。
