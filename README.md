# 华侨城天荟周边生活信息

武汉市洪山区华侨城·天荟项目及杨春湖片区周边生活信息站：最新动态、房价走势（分户型）、周边配套地图、交付倒计时、施工进展等。原运行于 Muse 空间平台，本仓库为其源码与文档导出，用于自托管部署。

## 仓库内容

- `client/` — 前端（React 19 + TypeScript + Tailwind CSS 4，地图为 MapLibre GL）
- `server/` — 服务端 actions（Bun + TypeScript，数据层 Drizzle ORM + SQLite）
- `drizzle/` — 数据库迁移 SQL
- `AGENTS.md` / `DATA-PLAN.md` — 数据口径、来源与维护说明
- `space.json` / `package.json` / `bun.lock` — 平台与依赖配置

## 不在本仓库中的文件（二进制，另行打包提供）

- `app.db` — SQLite 数据库（含已抓取的动态条目等数据）
- `icon.webp` — 站点图标
- `client/src/assets/*.png`、`client/src/assets/*.jpg` — 施工实拍图与静态地图图

放回上述对应相对路径即可。

## 自托管须知（重要）

本项目原本运行在 Muse 空间运行时上，部署到自己的服务器前请注意：

1. `package.json` 依赖 `@hatch/space-sdk`（`file:/opt/hatch/...` 本地路径），这是平台 SDK，外部环境没有这个包；服务端 actions 的运行框架（请求路由、上下文注入）由它提供，需要自行实现等价的运行层，或改造 actions 的导出与调用方式。
2. 每日自动刷新（`space.json` 中的 `managedCronJobs: tianhui-daily-refresh`）依赖平台的定时任务与 AI 联网检索能力（`refreshFeed` 会派发检索研究任务），自托管时需用自己的定时任务 + 检索/LLM 服务重写这部分；其余页面展示与数据读写不依赖它。
3. 其余部分是标准 Bun + TypeScript：`bun install` 后可用 `bun run build` 构建 client 与 server；数据库为 SQLite，结构见 `server/src/schema.ts` 与 `drizzle/` 迁移。

## 数据口径

房价、距离、配套状态等数据的来源与核实口径见 `DATA-PLAN.md`；地图坐标为 WGS-84。
