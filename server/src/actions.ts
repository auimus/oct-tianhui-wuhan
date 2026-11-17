import { defineAction, z, type ActionsModule } from "@hatch/space-sdk";
import { desc, eq, inArray } from "drizzle-orm";
import * as schema from "./schema";

/* ------------------------------------------------------------------ */
/* Researched reference data (see DATA-PLAN.md for provenance).        */
/* Distances are straight-line reference values from the cited sources */
/* and are labeled as such in the UI.                                  */
/* ------------------------------------------------------------------ */

const SRC_MAIN =
  "https://m.163.com/dy/article/KO6B8GE70556C5P1.html";
const SRC_DEEP = "https://www.163.com/dy/article/KKFBQQ0R0556BFBU.html";
const SRC_2026 = "https://www.163.com/dy/article/LBK25MQN0556PQXX.html";
const SRC_SAM = "https://news.ifeng.com/c/8wp0dvWdkCH";
const SRC_JINNUO = "https://news.ifeng.com/c/8xmbYRC4fJa";
const SRC_GOV =
  "https://www.hongshan.gov.cn/xxgk/jbxxgk/qt/yjtabl/sjyta/202509/P020251212527508444177.pdf";
const SRC_METRO10 = "https://feng.ifeng.com/c/8xo8br7oj65";
const SRC_BENDIBAO = "http://wh.bendibao.com/traffic/20241114/183573.shtm";
const SRC_SALES =
  "https://www.haofangdp.com/fjdpbj/newslist/reviewconsultation?itemId=7524311405228127874";
const SRC_PRICE_SALES = "https://enshi.focus.cn/zixun/03c73adf146d16a5.html";
const SRC_HONGSHAN_58 = "https://mfang.58.com/wh/xinfang/fangjia-hongshan-2025/";
const SRC_WUHAN_OCT = "https://www.lejucaijing.com/news-7524282415012574410.html";
const SRC_YANGCHUNHU_SEP = "https://www.lejucaijing.com/news-7523713164459570660.html";
const SRC_TIANHUI_SEP = "https://www.lejucaijing.com/news-7524312112928847493.html";
const SRC_FANG_WUHAN = "https://fangjia.fang.com/wuhan/";
const SRC_ANJUKE_YCH = "https://mobile.anjuke.com/esf/wh-cm847252/";
const SRC_FANG_TIANHUI = "https://wuhan.newhouse.fang.com/duibi/2610171936_2610156580.htm";

const PROJECT = {
  name: "华侨城·天荟",
  address: "洪山区团结大道与信和路交汇处",
  district: "杨春湖高铁商务区 · 东湖新城（东湖北岸）",
  developer: "武汉天创置业有限公司（华侨城）",
  builder: "中国建筑第八工程局有限公司",
  property: "华侨城物业（集团）有限公司武汉分公司",
  landParcel: "P（2024）149号地块 · 备案名：东湖新城149地块项目",
  landDeal: "2024-12-13 以底价 24.2 亿元竞得，成交楼面地价 7700 元/㎡",
  landArea: "约 70,230 ㎡",
  gfa: "约 314,299 ㎡（施工许可口径；部分宣传口径含其他计容为 408,100 ㎡）",
  far: "4.48",
  greenRate: "30%",
  units: "1,986 户",
  parking: "2,351 个车位 · 配比约 1:1.18",
  product:
    "准四代住宅，平均得房率约 97% 及以上（分户型不同）；主力户型 105㎡ 三房 / 128㎡ 四房 / 139㎡ 四房，毛坯交付",
  phase1:
    "一期（03、04 地块）：7 栋住宅 + 1 栋约 200 米写字楼 + 1 栋 4 层商业楼，车位配比约 1:1.13",
  phase2: "二期（01、02 地块）：8 栋住宅 + 1 栋幼儿园 + 1 栋保障性租赁住房",
  delivery: "一期预计 2027-06-30 毛坯交付",
  firstOpen: "2025-07-11 首开，均价约 13,500 元/㎡（销售口径）",
  boundaries:
    "北至团结大道 · 南邻天兴洲绿岛小区 · 西临信和路与工业四路地铁口 · 东接欢乐天际中央区与杨春湖路",
  caveats:
    "容积率 4.48 偏高，部分楼栋临团结大道可能有交通噪音；周边处于持续开发中，自带商业、规划学校等配套的兑现节奏以官方公示为准；学区划片以洪山区教育主管部门当年公示为准，项目不作入学承诺。",
  sourceUrls: [SRC_MAIN, SRC_DEEP, SRC_2026],
};

type Place = {
  name: string;
  category: string;
  distanceText: string;
  distanceM: number;
  status: string;
  description: string;
  sourceUrl: string;
};

const PLACES: Place[] = [
  // 交通
  { name: "地铁 4 号线 · 工业四路站", category: "交通", distanceText: "约 177 米", distanceM: 177, status: "已运营", description: "B 口步行约 2 分钟。4 号线直达武昌火车站、中南路、楚河汉街，可换乘 2、3、7 号线通达三镇。", sourceUrl: SRC_MAIN },
  { name: "地铁 4 号线 · 杨春湖站", category: "交通", distanceText: "约 1 公里", distanceM: 1000, status: "已运营", description: "位于杨春湖路与明德路交汇处，4 号线一站达武汉站方向。", sourceUrl: SRC_MAIN },
  { name: "地铁 10 号线 / 新港线 · 北洋桥站", category: "交通", distanceText: "约 400 米", distanceM: 400, status: "在建", description: "新港线一期起点站，2023-12-22 开工。10 号线一期（汉口火车站—北洋桥）同步在建，设计时速 120 公里，通车后武汉站↔汉口站地铁约 25 分钟（现约 1 小时）。", sourceUrl: SRC_BENDIBAO },
  { name: "公交 · 团结大道地铁工业四路站", category: "交通", distanceText: "约 259 米", distanceM: 259, status: "已运营", description: "最近公交站，周边约 10 条线路；片区 1 公里内有多个站点、多条线路覆盖（宣传口径）。", sourceUrl: SRC_MAIN },
  { name: "武汉站（高铁）", category: "交通", distanceText: "约 1.5 公里", distanceM: 1500, status: "已运营", description: "经杨春湖路/团结大道可达；城际与高铁通达武汉城市圈及全国主要城市。", sourceUrl: SRC_MAIN },
  { name: "地铁 19 号线 · 武汉站西广场站", category: "交通", distanceText: "约 1.5 公里", distanceM: 1500, status: "已运营", description: "19 号线连接武汉站与光谷方向，可在武汉站西广场换乘。", sourceUrl: SRC_MAIN },
  { name: "团结大道 / 欢乐大道 / 友谊大道", category: "交通", distanceText: "门口主干道", distanceM: 60, status: "已运营", description: "“三横两纵”路网骨架，团结大道双向 6 车道，可快速接驳二环线、三环线。临主干道楼栋需留意高峰车流噪音。", sourceUrl: SRC_DEEP },
  // 商业
  { name: "天荟自带社区商业", category: "商业", distanceText: "社区内 · 约 6,000 ㎡", distanceM: 30, status: "规划中", description: "规划引入生鲜超市、便民药房、特色餐饮等日常业态，覆盖买菜、早餐、洗衣、理发等高频需求；一期另有 4 层商业楼。", sourceUrl: SRC_DEEP },
  { name: "山姆会员店（洪山店 · 武汉第 5 家）", category: "商业", distanceText: "片区内 · 团结大道南侧", distanceM: 900, status: "在建", description: "2026-09-29 随杨春湖高铁商务区科创产业园开工：门店约 7.5 万㎡，配套 1000 个专属车位，武汉首座按绿建三星标准建设的山姆；东侧地块为 14.8 万㎡科创产业园（总部办公、五星级酒店、人才公寓）。", sourceUrl: SRC_SAM },
  { name: "武汉金诺奥特莱斯", category: "商业", distanceText: "和平街道 · 紧邻团结大道", distanceM: 9999, status: "在建", description: "2026-11-04 在洪山区和平街道正式开工，选址和平村 C3、C4 产业用地。定位“奥莱+购物公园”，业态包括名品零售、休闲体验、生活配套、潮流消费；总占地 130.12 亩，总投资约 10 亿元，规划总建筑面积约 17 万㎡，紧邻团结大道，地铁 4 号线、12 号线双轨环绕。建成后将成为杨春湖片区规模领先的商业综合体，与山姆会员店洪山店形成互补。开业/建成时间尚未公布，以官方后续公示为准。", sourceUrl: SRC_JINNUO },
  { name: "欢乐天际广场区", category: "商业", distanceText: "紧邻东侧", distanceM: 350, status: "在建", description: "华侨城欢乐天际中央区组成部分，规划写字楼、公寓、购物中心（奥特莱斯方向）与开放式餐饮街区，正在逐步落地。", sourceUrl: SRC_DEEP },
  { name: "金地广场", category: "商业", distanceText: "约 2.6 公里", distanceM: 2600, status: "已运营", description: "地铁 4 号线一站可达，购物、餐饮、影院、亲子业态齐全，是目前片区最成熟的日常大商业。", sourceUrl: SRC_MAIN },
  { name: "东方里 / 原溪商业街", category: "商业", distanceText: "近距离 · 街区商业", distanceM: 1200, status: "已运营", description: "周边社区街区商业，补充餐饮与生活服务。", sourceUrl: SRC_DEEP },
  { name: "武汉印象城", category: "商业", distanceText: "约 4.9 公里", distanceM: 4900, status: "已运营", description: "青山方向大型购物中心，驱车或公交可达。", sourceUrl: SRC_MAIN },
  { name: "武商城市奥莱", category: "商业", distanceText: "约 5 公里", distanceM: 5000, status: "已运营", description: "奥特莱斯业态，品牌折扣购物。", sourceUrl: SRC_MAIN },
  // 教育
  { name: "武汉小学洪山华侨城分校", category: "教育", distanceText: "约 493 米", distanceM: 493, status: "已运营", description: "2023 年秋季开学，纳入武汉小学教育管理集团体系。2025 年洪山区划片中，华侨城欢乐天际对口该校；天荟交付后划片以当年官方公示为准。", sourceUrl: SRC_MAIN },
  { name: "街道口小学教育集团北洋桥分校", category: "教育", distanceText: "约 988 米", distanceM: 988, status: "已运营", description: "项目周边小学之一（直线距离）。", sourceUrl: SRC_MAIN },
  { name: "街道口小学（东方雅园分校）", category: "教育", distanceText: "约 994 米", distanceM: 994, status: "已运营", description: "项目周边小学之一（直线距离）。", sourceUrl: SRC_MAIN },
  { name: "七一华源中学（东湖分校）", category: "教育", distanceText: "1 公里以外", distanceM: 1300, status: "规划中", description: "片区规划中学，宣传口径预计 2027 年开学；以教育主管部门正式公示为准。", sourceUrl: SRC_DEEP },
  { name: "武汉市钢城第十二中学", category: "教育", distanceText: "约 1.7 公里", distanceM: 1700, status: "已运营", description: "周边中学（直线距离）。", sourceUrl: SRC_MAIN },
  { name: "武汉市钢城第十六中学", category: "教育", distanceText: "约 1.8 公里", distanceM: 1800, status: "已运营", description: "周边中学（直线距离）。", sourceUrl: SRC_MAIN },
  { name: "武汉杨春湖实验学校", category: "教育", distanceText: "约 2.7 公里", distanceM: 2700, status: "已运营", description: "片区九年一贯制学校（直线距离）。", sourceUrl: SRC_MAIN },
  { name: "天荟二期幼儿园", category: "教育", distanceText: "社区内（二期地块）", distanceM: 100, status: "规划中", description: "二期 01、02 地块规划 1 栋幼儿园，随二期建设。", sourceUrl: SRC_MAIN },
  // 医疗
  { name: "武汉市中心医院杨春湖院区", category: "医疗", distanceText: "约 1.2 公里", distanceM: 1200, status: "已运营", description: "三级甲等综合医院新院区（洪山区礼和路 188 号），已投入运营，是片区最重要的医疗资源；距本项目直线约 1.2 公里（图钉实测约 1.15 公里）。部分售楼宣传口径称约 2.1 公里，与图钉实测不符，应为行车/配套测距口径，此处以实测直线距离为准。", sourceUrl: SRC_MAIN },
  { name: "华润武钢总医院", category: "医疗", distanceText: "约 3.9 公里", distanceM: 3900, status: "已运营", description: "青山方向综合医院（直线距离）。", sourceUrl: SRC_MAIN },
  { name: "武汉大学人民医院（省人民医院）青山院区", category: "医疗", distanceText: "约 4.5 公里", distanceM: 4500, status: "已运营", description: "三甲医院院区（直线距离）。", sourceUrl: SRC_MAIN },
  { name: "武汉市第九医院", category: "医疗", distanceText: "约 4.8 公里", distanceM: 4800, status: "已运营", description: "青山方向综合医院（直线距离）。", sourceUrl: SRC_MAIN },
  // 生态文旅
  { name: "两港公园", category: "生态文旅", distanceText: "约 500 米", distanceM: 500, status: "已运营", description: "沿港渠景观公园，日常散步、亲子活动空间。", sourceUrl: SRC_DEEP },
  { name: "东湖风景区", category: "生态文旅", distanceText: "约 700 米", distanceM: 700, status: "已运营", description: "项目紧邻东湖北岸；高铁商务区规划 18 公里绿道与 6.7 公里水上游线，串联湖岸生态。", sourceUrl: SRC_DEEP },
  { name: "杨春湖公园", category: "生态文旅", distanceText: "约 800 米", distanceM: 800, status: "已运营", description: "武汉站旁的湖泊公园，与北洋桥中央生态公园、两港公园构成片区绿地体系。", sourceUrl: SRC_DEEP },
  { name: "北洋桥中央生态公园", category: "生态文旅", distanceText: "片区内", distanceM: 600, status: "在建", description: "东湖新城核心区公园，洪山区政府答复称计划 2025 年 12 月底基本完成主体建设。", sourceUrl: SRC_GOV },
  { name: "武汉欢乐谷 / 玛雅海滩水公园", category: "生态文旅", distanceText: "欢乐大道沿线", distanceM: 2800, status: "已运营", description: "华侨城在武汉的文旅旗舰，周末休闲目的地，地铁/自驾均可达。", sourceUrl: SRC_DEEP },
];

/* Map geometry for the catalog above, keyed by place name. Coordinates were
   verified in Nov 2026 against OpenStreetMap / Nominatim and Wikipedia
   station data, cross-checked against the catalog distances (see
   DATA-PLAN.md). Polygons are the places' real OpenStreetMap outlines
   (simplified). Every catalog place now has an entry: most coordinates are
   verified against OSM/Wikipedia and cross-checked against the catalog
   distances; a few whose location is certain but whose exact coordinate
   could not be verified carry a best-estimate pin inside the known location
   range, explicitly labeled 近似定位 in pinNote (user direction,
   2026-11-17). pinNote explains placements that are intra-plot, linear, or
   otherwise approximate. */
type PlaceGeo = {
  lat: number;
  lng: number;
  polygon?: [number, number][];
  pinNote?: string;
};

const PLACE_GEO: Record<string, PlaceGeo> = {
  "地铁 4 号线 · 工业四路站": { lat: 30.6102194, lng: 114.4000694 },
  "地铁 4 号线 · 杨春湖站": { lat: 30.61194, lng: 114.41139 },
  "地铁 10 号线 / 新港线 · 北洋桥站": {
    lat: 30.60839,
    lng: 114.39588,
    pinNote: "图钉为北洋桥位置，车站在其一带施工中",
  },
  "武汉站（高铁）": { lat: 30.60956, lng: 114.419 },
  "地铁 19 号线 · 武汉站西广场站": { lat: 30.607475, lng: 114.41702 },
  "团结大道 / 欢乐大道 / 友谊大道": {
    lat: 30.61035,
    lng: 114.4015,
    pinNote: "主干道为线性道路，图钉落在项目北侧的团结大道门前路段",
  },
  "天荟自带社区商业": {
    lat: 30.60975,
    lng: 114.4013,
    pinNote: "社区商业位于项目地块内，图钉为地块内示意位置",
  },
  "欢乐天际广场区": {
    lat: 30.6093,
    lng: 114.4043,
    pinNote: "图钉落在项目东侧的欢乐天际中央区内；广场区为片区型商业，具体位置以现场为准",
  },
  "金地广场": {
    lat: 30.6077,
    lng: 114.382,
    pinNote: "按公开地址（仁和路地铁站 D 口西约 150 米、团结大道 1335 号）落在仁和路口西侧",
  },
  "东方里 / 原溪商业街": { lat: 30.598873, lng: 114.395827 },
  "武汉印象城": {
    lat: 30.63472,
    lng: 114.38517,
    polygon: [
      [114.382593, 30.633813],
      [114.385502, 30.633619],
      [114.38581, 30.635279],
      [114.385493, 30.635733],
      [114.382593, 30.633813],
    ],
  },
  "武商城市奥莱": {
    lat: 30.629231,
    lng: 114.371864,
    polygon: [
      [114.369812, 30.62879],
      [114.370694, 30.627766],
      [114.373163, 30.628969],
      [114.373303, 30.62993],
      [114.37271, 30.630559],
      [114.369812, 30.62879],
    ],
  },
  "街道口小学（东方雅园分校）": { lat: 30.61642, lng: 114.39566 },
  "武汉市钢城第十二中学": {
    lat: 30.624241,
    lng: 114.398579,
    polygon: [
      [114.397797, 30.624791],
      [114.397806, 30.623686],
      [114.399356, 30.62369],
      [114.399357, 30.624799],
      [114.397797, 30.624791],
    ],
  },
  "武汉市钢城第十六中学": { lat: 30.6228, lng: 114.391274 },
  "天荟二期幼儿园": {
    lat: 30.60885,
    lng: 114.4017,
    pinNote: "幼儿园位于二期地块内，图钉为地块内示意位置",
  },
  "华润武钢总医院": {
    lat: 30.634875,
    lng: 114.397866,
    polygon: [
      [114.396732, 30.635439],
      [114.396744, 30.633366],
      [114.399351, 30.633515],
      [114.398845, 30.635429],
      [114.396732, 30.635439],
    ],
  },
  "武汉市第九医院": {
    lat: 30.625916,
    lng: 114.374294,
    polygon: [
      [114.372729, 30.625622],
      [114.373452, 30.624754],
      [114.376279, 30.626453],
      [114.374721, 30.626866],
      [114.372729, 30.625622],
    ],
  },
  "两港公园": {
    lat: 30.605267,
    lng: 114.395761,
    pinNote: "两港公园沿东湖港、南湖港带状分布，图钉为东湖港沿线靠近项目的一段",
  },
  "杨春湖公园": {
    lat: 30.61672,
    lng: 114.41197,
    pinNote: "图钉落在杨春湖靠项目一侧，公园沿湖分布",
  },
  "北洋桥中央生态公园": {
    lat: 30.607,
    lng: 114.396,
    pinNote: "公园在北洋桥一带建设中，图钉为公园大致中心位置（示意）",
  },
  "武汉欢乐谷 / 玛雅海滩水公园": {
    lat: 30.59369,
    lng: 114.38739,
    polygon: [
      [114.385001, 30.592391],
      [114.385106, 30.590645],
      [114.38717, 30.590293],
      [114.390216, 30.59233],
      [114.388948, 30.593183],
      [114.39075, 30.594827],
      [114.39023, 30.59695],
      [114.386894, 30.596664],
      [114.385001, 30.592391],
    ],
  },
  "街道口小学教育集团北洋桥分校": {
    lat: 30.61813,
    lng: 114.40059,
    polygon: [
      [114.400105, 30.61864],
      [114.400007, 30.618432],
      [114.400059, 30.618411],
      [114.399964, 30.618037],
      [114.400913, 30.617626],
      [114.401077, 30.617947],
      [114.401081, 30.618065],
      [114.401222, 30.618327],
      [114.400748, 30.618599],
      [114.400105, 30.61864],
    ],
    pinNote:
      "OpenStreetMap 将该校园标注为「武汉市洪山区北洋桥小学」（地址信和路 19 号），多边形为校园实测轮廓；本条目口径距离约 988 米与该校园实测距离（约 990 米）吻合",
  },
  "武汉杨春湖实验学校": {
    lat: 30.6146,
    lng: 114.4285,
    polygon: [
      [114.428164, 30.615318],
      [114.42737, 30.614522],
      [114.428078, 30.613911],
      [114.428145, 30.613957],
      [114.428325, 30.613876],
      [114.429096, 30.613931],
      [114.429139, 30.614],
      [114.429269, 30.613911],
      [114.429626, 30.614275],
      [114.428164, 30.615318],
    ],
    pinNote:
      "校园轮廓为 OpenStreetMap 实测范围（标注为该校小学部）；学校地址为团结大道与青王路交汇处（洪山区教育局公示），实测距离与目录口径约 2.7 公里吻合",
  },
  "武汉市中心医院杨春湖院区": {
    lat: 30.6016,
    lng: 114.3933,
    pinNote:
      "院区位于沙湖港北路与礼和路交汇处（礼和路 188 号，加挂洪山区人民医院；地址见武汉市卫健委医疗机构名单与院方经中新网的介绍）；图钉落在交汇处一带（礼和路跨沙湖港桥位，OSM 礼和路与沙湖港要素在此交汇），OpenStreetMap 尚未收录该院区建筑轮廓。距离交叉校验：图钉距本项目图钉直线实测约 1.15 公里，与条目「约 1.2 公里」一致；武汉本地宝交通指南称地铁 4 号线仁和路站 B 口步行/骑行 1.2 公里可达该院区，图钉距仁和路站直线约 1.14 公里，两者互证。此前条目沿用的「约 2.1 公里」为售楼配套测距口径，与图钉实测矛盾，已更正",
  },
  "武汉金诺奥特莱斯": {
    lat: 30.60242,
    lng: 114.37253,
    pinNote:
      "项目在和平街道园林路开工、紧邻团结大道（赢商网/观点网报道）；图钉落在园林路与团结大道交汇处（地铁 4 号线园林路站）一带，工地范围尚无公开实测轮廓",
  },
  "公交 · 团结大道地铁工业四路站": {
    lat: 30.61,
    lng: 114.3995,
    pinNote:
      "公交站与地铁 4 号线工业四路站同处团结大道与信和路路口；为便于与地铁站图钉区分点选，图钉沿团结大道略移约 60 米，站点本身就在该路口",
  },
  "东湖风景区": {
    lat: 30.60072,
    lng: 114.40469,
    polygon: [
      [114.348076, 30.548555], [114.3601, 30.548237], [114.368284, 30.54452], [114.372236, 30.536815], [114.376756, 30.536554], [114.374071, 30.536568],
      [114.368571, 30.524531], [114.375214, 30.526247], [114.376794, 30.521644], [114.384699, 30.515639], [114.384434, 30.520884], [114.382244, 30.521314],
      [114.377124, 30.530885], [114.376826, 30.536549], [114.37984, 30.538774], [114.389497, 30.539298], [114.389239, 30.541943], [114.389748, 30.54347],
      [114.398417, 30.547445], [114.401488, 30.55809], [114.401911, 30.555975], [114.428781, 30.552897], [114.421151, 30.548185], [114.421789, 30.542375],
      [114.418823, 30.543808], [114.42356, 30.540777], [114.420465, 30.538168], [114.425433, 30.53702], [114.423058, 30.526804], [114.424447, 30.520741],
      [114.431991, 30.521477], [114.427738, 30.522694], [114.428178, 30.529635], [114.425905, 30.532218], [114.430725, 30.536481], [114.439433, 30.529728],
      [114.439477, 30.532903], [114.441481, 30.533145], [114.452521, 30.527574], [114.460319, 30.528526], [114.446189, 30.537654], [114.449092, 30.539955],
      [114.445539, 30.540472], [114.446509, 30.543551], [114.444931, 30.544214], [114.443164, 30.540377], [114.439396, 30.541729], [114.441695, 30.544908],
      [114.440378, 30.546796], [114.440035, 30.543754], [114.438183, 30.545752], [114.436808, 30.544298], [114.434224, 30.548365], [114.435221, 30.551585],
      [114.437828, 30.553196], [114.439751, 30.550508], [114.444307, 30.551128], [114.439877, 30.554732], [114.437865, 30.553295], [114.438742, 30.557098],
      [114.436712, 30.554644], [114.430175, 30.553331], [114.435525, 30.557738], [114.432247, 30.557134], [114.432894, 30.561864], [114.430096, 30.557364],
      [114.429259, 30.562229], [114.427072, 30.559975], [114.431544, 30.565342], [114.428111, 30.564367], [114.428894, 30.568815], [114.424994, 30.562788],
      [114.422869, 30.5719], [114.423549, 30.575074], [114.428828, 30.578047], [114.427358, 30.579339], [114.419288, 30.573558], [114.419665, 30.571247],
      [114.418503, 30.567271], [114.417948, 30.576062], [114.415218, 30.576134], [114.41567, 30.573671], [114.411895, 30.570638], [114.414502, 30.567355],
      [114.418229, 30.567428], [114.419498, 30.560972], [114.415493, 30.560481], [114.414417, 30.561321], [114.416868, 30.563314], [114.415521, 30.565529],
      [114.412473, 30.565014], [114.411785, 30.567563], [114.406675, 30.566555], [114.403755, 30.561921], [114.401734, 30.561787], [114.401706, 30.558283],
      [114.401437, 30.561768], [114.398584, 30.562314], [114.402648, 30.56232], [114.403955, 30.566869], [114.407509, 30.567457], [114.405634, 30.569717],
      [114.406684, 30.573652], [114.40448, 30.574892], [114.407132, 30.578167], [114.40577, 30.58046], [114.411775, 30.578591], [114.411077, 30.586347],
      [114.405497, 30.591404], [114.408794, 30.588774], [114.412979, 30.593478], [114.41326, 30.590976], [114.419149, 30.592511], [114.421608, 30.597967],
      [114.418124, 30.600434], [114.413337, 30.593765], [114.404689, 30.600718], [114.403219, 30.600377], [114.402913, 30.599862], [114.402972, 30.59917],
      [114.402105, 30.598227], [114.400994, 30.598714], [114.400531, 30.594522], [114.404802, 30.592063], [114.404665, 30.591896], [114.391656, 30.59316],
      [114.387452, 30.585004], [114.389276, 30.579083], [114.386725, 30.574038], [114.387457, 30.571057], [114.393905, 30.569037], [114.394352, 30.564746],
      [114.392144, 30.569034], [114.386117, 30.571568], [114.387878, 30.579609], [114.385295, 30.583376], [114.382324, 30.58339], [114.385151, 30.583673],
      [114.387451, 30.589612], [114.382763, 30.59041], [114.378881, 30.58466], [114.382073, 30.583235], [114.37243, 30.580918], [114.370203, 30.577549],
      [114.374685, 30.577554], [114.376903, 30.57479], [114.370034, 30.569806], [114.37069, 30.562068], [114.367231, 30.554544], [114.365663, 30.558455],
      [114.362758, 30.558325], [114.363351, 30.553829], [114.349053, 30.553071], [114.348076, 30.548555],
    ],
    pinNote:
      "多边形为 OpenStreetMap 东湖主湖区水域轮廓（简化）；图钉落在东湖北岸距项目最近的湖岸点，风景区陆域范围大于水域轮廓",
  },
  /* Approximate pins (added 2026-11-17 at the user's direction): the place's
     location is certain from public sources but no precise coordinate could
     be verified, so the pin sits at the most likely point inside the known
     location range and pinNote labels it 近似定位. See DATA-PLAN.md. */
  "山姆会员店（洪山店 · 武汉第 5 家）": {
    lat: 30.6075,
    lng: 114.4095,
    pinNote:
      "近似定位：项目选址洪山区和平街道团结大道南侧核心地块（杨春湖高铁商务区科创产业园，公开报道），山姆位于园区西地块；地块四至未公示，图钉按「团结大道南侧、高铁商务区核心区西部」落在杨春湖站西南侧一带，为近似位置，待官方公布地块范围后校正",
  },
  "武汉小学洪山华侨城分校": {
    lat: 30.6098,
    lng: 114.4072,
    pinNote:
      "近似定位：该校即洪山区东湖新城小学，洪山区教育局 2026 年责任督学名单载明其地址为和平街道团结大道，对口欢乐天际等小区；OpenStreetMap 未收录该校。图钉按门牌所在路段与公开测距（约 0.49-0.66 公里，图钉实测约 0.55 公里）落在团结大道南侧、欢乐天际一带，为近似位置",
  },
  "七一华源中学（东湖分校）": {
    lat: 30.6088,
    lng: 114.415,
    pinNote:
      "近似定位：该校为东湖新城规划中学，洪山区政府 2025 年政协提案答复称仍在设计招标阶段、力争开工，选址未公示；图钉按条目口径（1 公里以外、约 1.3 公里，图钉实测约 1.3 公里）落在东湖新城核心区（杨春湖站南侧）一带，为近似位置，待官方公布选址后校正",
  },
  "武汉大学人民医院（省人民医院）青山院区": {
    lat: 30.6435,
    lng: 114.4008,
    pinNote:
      "近似定位：公开来源（Moovit 交通指南、社区医疗点地址）载明该院区位于青山区红钢四街 5 号一带；OpenStreetMap 未收录红钢四街与该院区要素。图钉按 OSM 红钢一街、二街、三街的走向与间距推定四街位置后落在红钢城片区内，为近似位置；条目距离为售楼配套测距口径",
  },
};

/* The project pin itself. OSM has no official marker for the project; the
   pin sits at the geometric centre of the plot (south of 团结大道, east of
   信和路, ~160m × ~250m per the Nov 2026 OSM field check). The polygon is a
   schematic rectangle drawn from those measured dimensions — it is NOT the
   official land red-line boundary. */
const PROJECT_PIN = {
  label: "华侨城·天荟",
  category: "项目",
  lat: 30.6092,
  lng: 114.4015,
  status: "在建",
  note: "团结大道以南、信和路以东地块；图钉为该地块的几何中心（近似值，OpenStreetMap 暂无该项目的官方标注点）。地铁 4 号线工业四路站 B 口约 177 米",
  pinNote:
    "地块范围多边形按实测尺寸（东西约 160 米 × 南北约 250 米）以几何中心绘制，为示意范围，非官方用地红线",
  polygon: [
    [114.400665, 30.608073],
    [114.402335, 30.608073],
    [114.402335, 30.610327],
    [114.400665, 30.610327],
    [114.400665, 30.608073],
  ] as [number, number][],
};

type Milestone = {
  dateText: string;
  title: string;
  description: string;
  category: string;
  future: boolean;
  sourceUrl: string;
};

const MILESTONES: Milestone[] = [
  { dateText: "2023-09", title: "武汉小学洪山华侨城分校开学", description: "片区教育配套先行落地，纳入武汉小学教育管理集团体系。", category: "教育医疗", future: false, sourceUrl: SRC_MAIN },
  { dateText: "2023-12-22", title: "新港线一期北洋桥站开工", description: "北洋桥站第一段地下连续墙导墙浇筑完成，车站正式开工——未来的 10 号线/新港线站点距天荟约 400 米。", category: "交通", future: false, sourceUrl: SRC_BENDIBAO },
  { dateText: "2024-12-13", title: "天荟地块成交", description: "P（2024）149 号地块（原欢乐天际中央区 TOD 地块调规后重新挂牌）由武汉天创置业以底价 24.2 亿元竞得，楼面地价 7700 元/㎡，规划由写字楼/商业为主调整为住宅为主、商业办公为辅。", category: "开发进展", future: false, sourceUrl: SRC_MAIN },
  { dateText: "2025-07-11", title: "天荟一期首开", description: "首开取证约 310 套，开盘均价约 13,500 元/㎡（销售口径）。", category: "开发进展", future: false, sourceUrl: SRC_MAIN },
  { dateText: "2025", title: "杨春湖提档升级为“东湖新城”", description: "洪山区政府答复政协提案：恢复东湖新城市区联席会议机制，核心区道路（礼和路、信和路等）、高压线迁改、北洋桥公园等配套全面推进，重点项目纳入区级包保。", category: "片区规划", future: false, sourceUrl: SRC_GOV },
  { dateText: "2026-09-29", title: "山姆会员店 + 科创产业园开工", description: "杨春湖高铁商务区科创产业园暨武汉第 5 家山姆会员店开工：占地 105 亩、总投资近 20 亿元、总建面约 22.3 万㎡。", category: "商业", future: false, sourceUrl: SRC_SAM },
  { dateText: "2026-10", title: "地铁 10 号线越江盾构完成 45%", description: "余家头站越江大盾构已掘进 700 环；10 号线一期全长约 19 公里、8 站 7 换乘，设计时速 120 公里。", category: "交通", future: false, sourceUrl: SRC_BENDIBAO },
  { dateText: "2026-11-05", title: "地铁 10 号线盾构下穿 5 号线", description: "余家头—钢都花园区间盾构顺利下穿运营中的 5 号线，监测指标受控，实现“毫米级”穿越（长江日报）。", category: "交通", future: false, sourceUrl: SRC_METRO10 },
  { dateText: "2027-06-30", title: "天荟一期预计交付", description: "一期 7 栋住宅预计毛坯交付（以开发商正式交付通知为准）。", category: "开发进展", future: true, sourceUrl: SRC_MAIN },
  { dateText: "2027（预计）", title: "七一华源中学东湖分校预计开学", description: "片区规划中学，宣传口径预计 2027 年投入使用；以官方公示为准。", category: "教育医疗", future: true, sourceUrl: SRC_DEEP },
];

/* ------------------------------------------------------------------ */
/* Price data (researched 2026-11-17; see DATA-PLAN.md). Every figure  */
/* keeps its source caliber: 备案 (filed) ≠ 在售 (asking) ≠ 成交 (dealt) */
/* ≠ 挂牌 (listed). Per-type trend points only use figures the cited   */
/* source states for that type/building; derived totals are computed   */
/* in the client from the stated unit price × area and labeled 估算.   */
/* ------------------------------------------------------------------ */

type PricePoint = { stage: string; dateText: string; price: number; kind: string };

type UnitTypePrice = {
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
  trend: PricePoint[];
  note: string;
};

const PRICES = {
  asOf: "2026-11-17",
  currentRef: 12500,
  currentRefNote: "房天下 / 安居客平台参考均价（2026-11）",
  firstOpenAvg: 13500,
  onSaleFromAvg: 13000,
  fourRoomDealAvg: 11444,
  unitTypes: [
    {
      id: "a105",
      label: "105㎡ 三房",
      shortLabel: "105㎡",
      area: 105,
      rooms: "三室两厅两卫",
      building: "3# 超高层 · 中间户 · 三梯四户",
      efficiency: "约 97%",
      filingAvg: 15878,
      filingNote: "3# 整栋备案均价，105㎡ 与 128㎡（超高层）同组",
      saleTotalFromWan: 140,
      trend: [
        { stage: "备案均价", dateText: "2025-07 取证", price: 15878, kind: "备案" },
        { stage: "在售均价", dateText: "2026-02 售楼处口径", price: 13500, kind: "在售" },
      ],
      note: "刚需入门户型。售楼处口径均价约 13,500 元/㎡、总价约 140 万起、首付约 21 万起；实际一房一价按楼层、朝向浮动。",
    },
    {
      id: "b128",
      label: "128㎡ 四房（超高层）",
      shortLabel: "128㎡超高层",
      area: 128,
      rooms: "四室两厅两卫",
      building: "3# 超高层 · 边户 · 三梯四户",
      efficiency: "约 98%–100%",
      filingAvg: 15878,
      filingNote: "3# 整栋备案均价，与 105㎡ 同组",
      saleTotalFromWan: 160,
      trend: [
        { stage: "备案均价", dateText: "2025-07 取证", price: 15878, kind: "备案" },
        { stage: "在售折算", dateText: "2026-02 按总价 160 万起折算", price: 12500, kind: "在售" },
        { stage: "四房成交参考", dateText: "2026-09 克而瑞四房口径", price: 11444, kind: "成交" },
      ],
      note: "售楼处口径总价约 16X 万起、首付约 25 万起，在售单价为按总价起价折算的约数。成交参考是天荟全部四房（128㎡/139㎡）的整体成交均价，不是本户型单独成交价。",
    },
    {
      id: "c128",
      label: "128㎡ 四房（小高层）",
      shortLabel: "128㎡小高层",
      area: 128,
      rooms: "四室两厅两卫",
      building: "4# 小高层 · 10 层 · 一梯两户",
      efficiency: "约 98%–100%",
      filingAvg: 20082,
      filingNote: "4# 整栋备案均价，低密小高层溢价明显",
      saleTotalFromWan: null,
      trend: [
        { stage: "备案均价", dateText: "2025-07 取证", price: 20082, kind: "备案" },
      ],
      note: "全盘备案价最高的户型：10 层低密、一梯两户、部分房源可瞰湖。目前公开渠道暂无该栋单独的在售均价与成交数据，具体以售楼处一房一价公示为准。",
    },
    {
      id: "d139",
      label: "139㎡ 四房",
      shortLabel: "139㎡",
      area: 139,
      rooms: "四室两厅两卫",
      building: "5# 高层 · 两梯两户 · 三面采光",
      efficiency: "约 97%–102%（分户型）",
      filingAvg: 16821,
      filingNote: "5# 整栋备案均价（139㎡/143㎡）",
      saleTotalFromWan: 180,
      trend: [
        { stage: "备案均价", dateText: "2025-07 取证", price: 16821, kind: "备案" },
        { stage: "在售折算", dateText: "2026-02 按总价 180 万起折算", price: 12950, kind: "在售" },
        { stage: "四房成交参考", dateText: "2026-09 克而瑞四房口径", price: 11444, kind: "成交" },
      ],
      note: "售楼处口径总价约 18X 万起、首付约 29 万起，在售单价为按总价起价折算的约数。成交参考是天荟全部四房的整体成交均价，不是本户型单独成交价。",
    },
    {
      id: "e170",
      label: "170㎡ 大四房",
      shortLabel: "170㎡",
      area: 170,
      rooms: "四室两厅两卫（大四居）",
      building: "后期推出 · 楼栋待公示",
      efficiency: "待公示",
      filingAvg: null,
      filingNote: "尚未取证，暂无备案价",
      saleTotalFromWan: null,
      trend: [],
      note: "主力户型规划包含 170㎡，售楼处口径为后期推出。目前没有公开的备案价、在售价或成交数据，取证后本页会补上。",
    },
  ] as UnitTypePrice[],
  projectTrend: [
    { stage: "首开均价", dateText: "2025-07", asking: 13500, deal: null as number | null },
    { stage: "在售均价起", dateText: "2026-02", asking: 13000, deal: null as number | null },
    { stage: "四房成交均价", dateText: "2026-09", asking: null as number | null, deal: 11444 },
    { stage: "平台参考均价", dateText: "2026-11", asking: 12500, deal: null as number | null },
  ],
  hongshanMonthly2025: [
    { month: "1月", price: 18146 },
    { month: "2月", price: 18146 },
    { month: "3月", price: 18146 },
    { month: "4月", price: 18146 },
    { month: "5月", price: 18047 },
    { month: "6月", price: 17915 },
    { month: "7月", price: 17915 },
    { month: "8月", price: 17915 },
    { month: "9月", price: 17915 },
    { month: "10月", price: 17915 },
    { month: "11月", price: 17915 },
    { month: "12月", price: 18158 },
  ],
  hongshanYearAvg2025: 18023,
  yangchunhuListing: [
    { month: "2025-09", price: 14200, approx: true },
    { month: "2025-11", price: 13800, approx: true },
    { month: "2026-01", price: 13500, approx: true },
    { month: "2026-03", price: 13100, approx: true },
    { month: "2026-05", price: 12800, approx: true },
    { month: "2026-06", price: 12848, approx: false },
    { month: "2026-07", price: 12892, approx: false },
  ],
  yangchunhuListingNote:
    "杨春湖畔（友谊大道 1388 号）安居客二手挂牌均价；2026-07 为 12,892 元/㎡，环比 +0.34%、同比 −8.83%。早期月份为走势图万元取整约数。",
  sectorDealAvg: 10948,
  sectorDealNote:
    "2026-09 杨春湖板块二手房成交均价：21 个小区共成交 107 套、1.01 万㎡、1.11 亿元（克而瑞）。",
  neighbors: [
    { name: "东湖金茂府", listing: 19163, deal: 11978 },
    { name: "华侨城欢乐天际", listing: 17932, deal: 11142 },
    { name: "万科堤白", listing: 18115, deal: 12249 },
  ],
  market: [
    { label: "武汉新房成交均价", value: 15917, dateText: "2026-10", note: "克而瑞口径；10 月高端改善项目集中网签，结构性拉高，9 月为 13,780 元/㎡" },
    { label: "洪山区新房成交均价", value: 13344, dateText: "2026-10", note: "克而瑞分区域口径；洪山当月成交 436 套、5.31 万㎡，呈以价换量特征" },
    { label: "武汉新房参考均价", value: 13238, dateText: "2026-11", note: "房天下参考口径，环比 +0.65%" },
    { label: "武汉二手房参考均价", value: 12598, dateText: "2026-11", note: "房天下按挂牌房源计算的参考均价" },
    { label: "洪山区二手房参考均价", value: 12287, dateText: "2026-11", note: "房天下区县榜，环比 −2.84%" },
  ],
  sources: [
    { name: "天荟备案价与首开价（网易·项目公示）", url: SRC_MAIN },
    { name: "天荟分户型在售总价（搜狐焦点·售楼处）", url: SRC_PRICE_SALES },
    { name: "天荟四房成交榜（乐居财经·克而瑞）", url: SRC_TIANHUI_SEP },
    { name: "天荟平台参考价（房天下）", url: SRC_FANG_TIANHUI },
    { name: "洪山区新房月度均价（58 爱房）", url: SRC_HONGSHAN_58 },
    { name: "杨春湖板块二手成交（乐居财经·克而瑞）", url: SRC_YANGCHUNHU_SEP },
    { name: "杨春湖畔挂牌走势（安居客）", url: SRC_ANJUKE_YCH },
    { name: "武汉 2026-10 住宅市场报告（乐居财经·克而瑞）", url: SRC_WUHAN_OCT },
    { name: "武汉房价参考（房天下）", url: SRC_FANG_WUHAN },
  ],
};

const SITE_PHOTOS = {
  dateText: "2026-03-29",
  sourceName: "中建八局一公司（项目承建方）",
  sourceUrl: "https://www.cscec81.com/198/9171.html",
  progressNote:
    "承建方报道口径：一期施工范围含 3 栋高层、4 栋超高层，地下 2 层，地上最高 45 层，总建筑面积 15.56 万㎡；现场采用地下室快速穿插施工工艺，并设有交付、工艺、实测实量、材料四类样板展示区。2026 年 3 月 29 日，承建方组织人员到项目现场观摩交流、实地查看建设进展。以下照片为该报道配图，是目前公开可核实的最新工地实拍。",
  photos: [
    { key: "aerial", caption: "工地航拍：楼体已挂「华侨城·天荟」标识，多台塔吊仍在作业", alt: "华侨城天荟工地航拍：在建高层楼体上可见华侨城、天荟字样，周围有多台黄色塔吊" },
    { key: "visit", caption: "项目现场出入口：观摩人员实地查看建设进展与现场管理", alt: "华侨城天荟工地出入口，佩戴安全帽的观摩人员正在现场查看" },
    { key: "sample", caption: "样板展示区：交付、工艺、实测实量、材料四类样板", alt: "华侨城天荟工地样板展示区拼图，包含交付样板、工艺样板、实测实量样板和材料样板" },
  ],
};

const SEED_FEED = [
  {
    title: "武汉金诺奥特莱斯在和平街道开工，定位“奥莱+购物公园”",
    category: "商业" as const,
    summary:
      "2026 年 11 月 4 日，武汉金诺奥特莱斯在洪山区和平街道正式开工。项目选址和平村 C3、C4 产业用地，总占地 130.12 亩，总投资约 10 亿元，规划总建筑面积约 17 万㎡，定位“奥莱+购物公园”，业态涵盖名品零售、休闲体验、生活配套与潮流消费。项目紧邻团结大道，地铁 4 号线、12 号线双轨环绕；建成后将成为杨春湖片区规模领先的商业综合体，与已开工的山姆会员店洪山店形成互补。开业/建成时间尚未公布，以官方后续信息为准。观点网亦有报道佐证。",
    sourceName: "凤凰网（转载极目新闻）",
    sourceUrl: SRC_JINNUO,
    publishedDate: "2026-11-04",
  },
  {
    title: "武汉第 5 家山姆会员店在杨春湖开工，配套 1000 个专属车位",
    category: "商业" as const,
    summary:
      "9 月 29 日，洪山区杨春湖高铁商务区科创产业园暨山姆会员店项目开工。项目占地 105 亩、总投资近 20 亿元、总建面约 22.3 万㎡：西地块为山姆洪山店（约 7.5 万㎡，武汉首座绿建三星山姆），东地块为 14.8 万㎡科创产业园，布局总部办公、五星级酒店与人才公寓。建成后将明显提升片区商业能级。",
    sourceName: "凤凰网（来源：洪山区国投公司、洪山大学之城）",
    sourceUrl: SRC_SAM,
    publishedDate: "2026-09-29",
  },
  {
    title: "地铁 10 号线盾构顺利下穿运营中的 5 号线",
    category: "交通" as const,
    summary:
      "11 月 5 日长江日报报道：10 号线一期余家头—钢都花园区间右线盾构施工中，盾构机自余家头站始发后立即下穿 5 号线隧道，10 月 26 日启动、30 日完成，监测指标均在允许范围内。10 号线一期串联汉口火车站与武汉火车站，通车后两站地铁出行将由约 1 小时缩至 25 分钟。",
    sourceName: "凤凰网大风号（来源：长江日报）",
    sourceUrl: SRC_METRO10,
    publishedDate: "2026-11-05",
  },
  {
    title: "武汉地铁建设进展更新：10 号线越江盾构完成约 45%",
    category: "交通" as const,
    summary:
      "武汉本地宝 2026 年 10 月更新：10 号线一期（汉口火车站—北洋桥）全长约 19 公里、设 8 站、7 站可换乘；越江大盾构已掘进 700 环、完成隧道总量 45%。新港线一期（北洋桥—白玉山）全长约 10.71 公里、5 站，初期与 10 号线贯通运营。",
    sourceName: "武汉本地宝",
    sourceUrl: SRC_BENDIBAO,
    publishedDate: "2026-10-28",
  },
  {
    title: "克而瑞 2026 年 9 月洪山四房榜：华侨城天荟居第 2",
    category: "开发进展" as const,
    summary:
      "克而瑞好房点评发布 2026 年 9 月武汉洪山区四房产品销售套数榜（覆盖 11 个在售项目）：华侨城天荟成交四房 45 套、成交面积 6,336㎡、成交金额 7,251 万元、均价 11,444 元/㎡，位列第 2。数据为第三方统计口径，仅供参考。",
    sourceName: "克而瑞好房点评网",
    sourceUrl: SRC_SALES,
    publishedDate: "2026-11-06",
  },
  {
    title: "洪山区答复：杨春湖高铁商务区提档升级为东湖新城",
    category: "片区规划" as const,
    summary:
      "洪山区政府对市政协提案的答复披露：武汉市已将杨春湖高铁商务区提档升级为东湖新城，2025 年恢复市区联席会议机制；核心区高压线迁改基本完成，多条新建/改造道路推进中，北洋桥公园计划年底基本完成主体，武钢云谷 606、楚天都市春水行云等产业项目持续招商落地。同时坦承片区呈现度与社会投资意愿仍待提升。",
    sourceName: "洪山区人民政府（政协提案答复 PDF）",
    sourceUrl: SRC_GOV,
    publishedDate: null,
  },
  {
    title: "华侨城天荟 2026 年 11 月项目公示：把“日常”做扎实",
    category: "开发进展" as const,
    summary:
      "项目最新公示重申定位：团结大道与信和路交汇处、紧邻 4 号线工业四路站 B 口；总户数约 1,986 户、绿化率约 30%、车位配比约 1:1.18、毛坯交付；自带约 6,000㎡ 社区商业；武汉小学洪山华侨城分校已开学。公示同时说明：杨春湖大型商业仍在建设中，划片以教育主管部门当年公示为准。",
    sourceName: "网易订阅（项目公示）",
    sourceUrl: SRC_2026,
    publishedDate: null,
  },
];

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
});

type FeedRow = typeof schema.feedItems.$inferSelect;

function toFeedItem(row: FeedRow, bookmarkedIds: Set<number>) {
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
          };
        }),
        milestones: MILESTONES,
        feedCount: feedRows.length,
        bookmarkCount: bmRows.length,
        lastRefreshAt: logs[0] ? logs[0].createdAt.toISOString() : null,
        prices: PRICES,
        projectPin: PROJECT_PIN,
        sitePhotos: SITE_PHOTOS,
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
      return { items: rows.slice(0, args.limit).map((r) => toFeedItem(r, bookmarkedIds)) };
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
          "5) 教育医疗：洪山区学区划片公示、七一华源中学东湖分校、武汉市中心医院杨春湖院区动态；",
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
} satisfies ActionsModule;
