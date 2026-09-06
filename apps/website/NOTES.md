# iweb website 实施记录（NOTES）

`apps/website`（包名 `website`）——iweb 官方静态站点，2026-09-06 从零建立。
结构先例：unipty `packages/www`；视觉信源：jixoai-website skill +
ui.jixoai.com registry（jixoai-ui 0.3.0）。

## Registry 消费（2026-09-06）

- `components.json` 先于 CLI 手写（`jixoai-ui init` 无 components.json 直接
  fail）：style new-york、`tsx: true`（shadcn schema 强制，Svelte 项目同样
  必填）、aliases `ui → src/lib/ui`、`lib → src/lib`、css `src/app.css`、
  `registries.@jixoai`、`jixoai.brandHue: 253`。
- `npx jixoai-ui init --hue 253` 安装 `jixoai-theme` → `src/lib/jixoai.css`
  （92KB token 表，0.3.0 已自带 popover/destructive/input/ring/shadow 的
  `@theme inline` 映射与滚动驱动 reveal 法则）。
- 站点项：`scrollbar-measure`、`website-scaffold`、`terminal-header`、
  `terminal-footer`、`theme-toggle`、`hero-section`、`section-card`、
  `press-button`、`terminal-card`、`card-grid`、`llms-txt`。
- **依赖闭包显式 add 入锁**（shadcn 装依赖文件但只有显式名字进
  `jixoai-ui.lock`；`upgrade` 只刷 locked 项）：`icons`、`defaults`、
  `utils`、`jixoai-theme`、`navigation-menu`、`popover`、`density`、
  `paint`、`separator`、`figure`、`context-plugin`。
- **排除项**：`toc-engine` / `toc`——本站无文档页 ToC，没有任何已装项拉入
  它，磁盘上不存在，不入锁。`surface-motion.ts` 随 `popover` 项发行
  （`@lib/surface-motion.ts`），不单独成项。
- 0.3.0 布局为目录式（`src/lib/ui/<item>/<file>` + `index.ts` barrel），
  与 unipty 时代的扁平布局（0.2.0，`src/lib/ui/<item>.svelte`）不同；
  组件内部 import 已是 `$lib/...`（SvelteKit 原生别名），无需 unipty
  NOTES 记录的 import 修正。
- `llms-txt` 项的 target 是项目相对路径 `vite-plugins/llms-txt.mjs`，但
  shadcn 在 svelte-kit 框架下把它放进了 `src/vite-plugins/`；已移回
  `vite-plugins/` 以对齐 lock 记录与 skill 文档的路径契约。
- **language-switcher**（2026-09-06 i18n change 单项 add）：一次成功落盘
  于 `src/lib/ui/language-switcher/`（本项未触发 `src/@lib` 字面目录陷阱，
  registry paths 直接是 alias 形态）；utils/icons/defaults 三个依赖闭包
  文件已在盘且哈希一致，CLI 识别为 identical 跳过；lock 新增 3 文件
  哈希全 MATCH。
- **已知偏差（pre-existing，非本次引入）**：`jixoai-ui.lock` 里
  `jixoai-theme` 的 `jixoai.css` 哈希与磁盘不符——CLI 记录的是 registry
  原始表哈希，而 wrapper 落盘后重放了 `--brand-hue: 253`（磁盘文件与
  git HEAD 一致，本次 add 前后字节不变）。属 wrapper 记账口径问题，
  待上游修；不影响 upgrade 语义之外的使用。

## app.css 补充映射（tasks 2.4 的核验结果）

unipty NOTES 的坑（registry 主题表留空 popover/destructive/input/ring/
radius/shadows 映射）在 jixoai-theme 0.3.0 已消除：除 `--radius-*:
initial`（封杀 Tailwind 默认 rounded 刻度）外全部由 registry 表自带映射；
`src/app.css` 只补 radius 封杀 + `@layer base` 规则 + 站点表面
（data-table / readonly-code）。

## 站点 i18n / 中文镜像（2026-09-06）

- **决策**：`/` 保持英文（URL 稳定），`/zh/` 为中文镜像；zh 文案唯一信源
  是仓库 `README-zh.md`（`src/lib/site-i18n.ts` 的 `SiteCopy` 类型把 en/zh
  两字典锁成同构，形状漂移编译期报错）。en 文案逐字从原首页收敛进字典，
  未改一字。
- **共享骨架**：`src/lib/home-page.svelte` 承载整页叙事，`src/routes/
  +page.svelte` 与 `src/routes/zh/+page.svelte` 只是 locale 装配层。
- **per-locale `<html lang>`**：SvelteKit（2.70.3）没有 lang 模板占位符，
  采用社区标准形态——`src/app.html` 写 `lang="%lang%"`，`src/hooks.server.ts`
  的 `transformPageChunk` 按 route id（`/zh*` → zh）替换；adapter-static
  预渲染在构建期走同一管路，产物直接落正确值。客户端路由后的 lang 同步
  由根布局 `$effect` 承载。
  **坑**：`String.replace` 只替换首个匹配——app.html 头部注释里若出现
  字面 `%lang%`，会抢先吃掉替换（实测踩中）；hooks 已改为
  `replaceAll('lang="%lang%"', …)` 属性锚定形态。
- **`/zh/` 目录形态**：根布局 `trailingSlash: "never"` 会把 /zh 预渲染成
  平铺 `zh.html`（哑静态服务器 `/zh/` 404）；`src/routes/zh/+page.ts` 以
  路由级 `trailingSlash: "always"` 覆盖，产物为 `zh/index.html`，
  `/zh/` 直接 200（python http.server 实测）。站内 locale 链接一律目录
  形态带尾斜杠（`${base}/`、`${base}/zh/`）。
- **hreflang**：两页均发 en / zh / x-default（x-default 指 en 根）三件套，
  绝对 URL 由 vite `define` 注入的 `__SITE_URL__`（与 llms-txt 的
  `siteUrl` 同源推导：`SITE_URL` > 按 `SITE_BASE` 推导），子路径/自定义域
  两种服务形态零代码改动（两种形态均构建验证通过）。
- **language-switcher**（registry `add`，单项）：`variant="pair"` 与
  compact `ThemeToggle` 并列接入 terminal-header 右翼 `switcher` snippet。
  两者共用同一 bezel 配方（各自 1px currentColor 边框），故传
  `switcherFrame={false}` 关掉 header 外框——顺手修复了原布局"注释声称
  关框但没传 prop"的 framed-in-frame 遗留问题。切换链接携带当前
  `page.url.hash`（`$app/state` 响应式），锚点/路径跨 locale 保持；SSR
  预渲染时 hash 为空串，无 JS 退化为跳页顶。locale 派生自 `page.route.id`
  （不含 base，预渲染期同样可用）。
- **llms 双 locale**：`vite.config.ts` 给 `llmsTxt()` 配
  `locale: { segments: ["zh"], default: "en" }`——产物为根 `llms.txt`
  （en + "Other languages" 节链 `/zh/llms.txt`）、`zh/llms.txt`、
  `index.md`、`zh/index.md`、`llms-full.txt`（仅默认 locale，混语言检索
  反而有害——插件既定设计）。**上游缺口（记录不本地补丁）**：插件只有
  单一 title/summary 配置，`zh/llms.txt` 的索引头仍是英文标题+摘要
  （正文条目是中文）；与 skill 记录的 "flat .html routes" 缺口同类。
- **字节一致性**：AI 导出层（llms.txt / llms-full.txt / index.md /
  zh/llms.txt / zh/index.md）双构建 sha256 全等；页面 HTML 除 vite chunk
  hash 文件名与每构建随机的 `__sveltekit_*` 引导 token 外内容全等
  （vite 8 产物不可复现是 skill 已记录的上游事实，字节恒等法则只约束
  AI 导出层）。
- **check-static 扩展**：双页存在性 + `<html lang>` 期望值 + hreflang
  三件套 + base 前缀 + 本地目标解析，双 llms 版绝对链接 + 根版链接
  zh 版的交叉证明。

## 与 skill 的已记录分歧（历史）

- **theme-color = `#008bff`**（proposal 裁定：favicon/theme-color 携带项目
  图标色），而非 skill tech-stack 建议的暗色画布 `#000000`。favicon /
  header logo 直接复用 `apps/admin-console/src/lib/assets/favicon.svg`
  （多彩项目图标，蓝 `#0b81fd` ≈ oklch hue 253.4）。
- **reveal 为 0.3.0 滚动驱动 CSS**（`animation-timeline: view()`，静态
  `data-reveal=""` 标注，无运行时 action、无 html.js 门）；skill motion.md
  描述的 IntersectionObserver action 是 0.2.0 时代实现。`app.html` 仍保留
  `html.js` 标记（表面族的 no-JS 回退分支依旧门控于它）。

## 构建与服务形态

- `SITE_BASE=/openiweb` → `kit.paths.base`（`paths.relative: false`，绝对资源
  URL 带 `/iweb` 前缀）；站内链接经 `$app/paths` 的 `base`。
- `scripts/postbuild.mjs`：`SITE_CNAME=1`（域名取 `SITE_CNAME_DOMAIN`，
  默认 `iweb.jixoai.com`——Owner 未定 DNS 前的占位约定，切换时改环境即可）
  写 `dist/CNAME`；其余构建零写入。
- `scripts/check-static.mjs`：产物存在性、绝对 URL base 前缀、本地链接
  落盘可解析、llms 导出三件套 + 绝对链接、CNAME 门控。
- 本地抽查法：`dist` 符号链接为 `iweb` 后 `python3 -m http.server` 起根目录，
  `/iweb/`、`/iweb/favicon.svg`、`/iweb/llms.txt`、`/iweb/index.md`、
  `/iweb/_app/...`（js/css/woff2）全部 200。

## 内容信源

全部文案取自仓库 `README.md` / `README-zh.md`（定位、技术选型、入口矩阵、
演示应用、快速开始、MCP 接入、两层信任、当前限制）；未虚构任何能力；
许可证信息仓库未声明，站点不做许可声明（footer 仅 `© iweb contributors`）。
