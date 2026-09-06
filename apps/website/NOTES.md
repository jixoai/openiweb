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

## 文案升级：受众优先叙事（2026-09-06，release-automation-and-copy）

- **叙事法则**（spec：Purpose-led bilingual copy）：hero 先说受众与痛点
  （想要自托管应用但不想学容器/数据库/网络运维），再说交接（一个 MCP 端点
  + 一把可吊销 owner 密钥交给 AI 代理），再给"凭什么信"（两层信任运行时 +
  单端口 Rust 内核），证据以数字与可点击的演示应用收尾。每张特性卡的第一
  句都是动机句（spec 场景硬性要求），第二句起才是事实清单。
- **改动面**：`site-i18n.ts` 的 meta.description、hero（eyebrow/summary/
  badges）、6 张特性卡 body、demos 标题+summary；en/zh 同步重写，
  `SiteCopy` 同构不变（类型形状 + 运行时形状双重验证，仅 `honesty.buttons`
  数量 en=4/zh=3 是既有的互链镜像设计，非本次引入）。quick-start、MCP、
  安全边界按 spec 保持事实形态不动。
- **信源升级**：i18n 文件头注释原"en 逐字取自原英文首页（不改一字）"法则
  随本次重写作废，改为"事实可溯源 README/specs + 叙事法则"；文件头注释已
  同步改写，避免遗留失效法律。
- **验证**：CNAME 模式（SITE_CNAME=1 + openiweb.jixoai.com）与子路径模式
  （SITE_BASE=/openiweb）双构建 + check-static 全绿；根 `bun run check`
  （tsc -b + admin-console svelte-check）0 错 0 警；产物 HTML 双 locale
  抽查确认新文案落盘。

## Release 自动化（L1，仓库级，2026-09-06）

- 新增 `.github/workflows/release.yml`：workflow_dispatch(version 输入，
  补 v 前缀 + `vX.Y.Z` 门禁) 或 tag push `v*` → 推 tag（dispatch 路径，
  已存在则复用）→ 生成 notes（本版要点占位 / Docker 镜像引用：本仓库无
  registry 镜像，为源码构建说明 / 升级说明 + compare 链接）→
  `gh release create --verify-tag`。actionlint 干净；与 deploy-website.yml
  完全正交，不触碰站点部署。
- 首个 Release **v0.1.0** 已创建并验证（tag → main e520bc7，
  draft/prerelease 均 false）：https://github.com/jixoai/openiweb/releases/tag/v0.1.0
  ——notes 从 README 提炼当前产品状态（单端口 Rust 内核、MCP 运维、两层
  信任、RustFS、可吊销 owner keys、静态控制台、三个演示应用、≤240MB、
  当前限制）。本地创建命令带 `env -u *_proxy`（宿主代理会劫持 gh API）。
  jixoai.com 版本号胶囊将在其下次构建时从 releases 解析出 v0.1.0。

## 语言协商（2026-09-06 locale-negotiation 变更）

- `src/app.html` 首帧前内联协商：zh 偏好访问者落在默认（en）面时，同路径同
  hash 一次性 `location.replace` 到 `/zh/` 镜像（不留历史）。优先级：显式
  选择（localStorage `lang`）> navigator.languages 逐项取主子标签的首个命中
  （zh-CN/zh-Hans → zh；en-US 命中即留——`['en-US','zh-CN']` 不跳，首个
  命中即定）。
- **法则：检测只在默认语言面发生，非默认面永不跳转。** 结构性防环：脚本只
  从默认面跳走、目标必带 `/zh/` 前缀（条件不再成立）、绝无从 `/zh/` 跳回。
  爬虫/无 JS 拿到静态默认面（hreflang 三件套已声明 alternates）。
- base 感知靠烘焙：`hooks.server.ts` 与 svelte.config.js 的 `resolveBase`
  同律解析 SITE_BASE（CNAME 模式即 SITE_BASE 缺省 → 根路径），锚定引号替换
  进协商脚本；双模式 dist 实测烘焙值为 `""` 与 `"/openiweb"`。
- 切换器持久化已移入 registry `language-switcher` 件本体
  （consumer-feedback-fixes P0-2，2026-09-06 upgrade 消费）：组件点击
  自写 localStorage `lang`，根布局的委托 click hack（bezel 包裹层读
  `hreflang`）已删除；显式点击此后永远压过检测。
- 验证（playwright-core 1.63 + 本机缓存 Chromium）：三站矩阵 × 双服务模式，
  zh-CN → `/zh/`（hash 保留）、zh-Hans-CN 主子标签命中、en-US 留、en-US
  优先列表留、pt-BR 优先列表走到 `/zh/`、stored zh 生效、stored en 在
  `/zh/` 不跳回、zh-CN 在 `/zh/` 不动（防环律）——每模式 16 例 + 真点击
  切换持久化全绿；双模式 build + check-static PASS；dev 抽查（opentray，
  同款 hook 管线）确认 dev 下占位符同样解析。

## 上游 consumer-feedback-fixes 消费（2026-09-06）

- `npx jixoai-ui upgrade`（registry ui.jixoai.com）：updated 8 /
  unchanged 56 / skipped 3（CLI 已锁未装防呆）。更新件与 opentray
  同批：`jixoai-theme`、`scrollbar-measure`、`theme-toggle`、
  `hero-section`、`press-button`、`defaults`、`context-plugin`、
  `language-switcher`。lock 23 → 23；lock↔磁盘哈希核对 63/64 精确
  （唯一偏差 `jixoai.css`——lock 记 pre-hue 规范哈希，盘上带 hue 253，
  upgrade 重涂后实测 `--brand-hue: 253`）。
- Hack 移除：`+layout.svelte` 的 `persistLocale` 事件委托（bezel
  包裹层 `onclick` 读 `a[hreflang]` 写 localStorage）删除——升级后的
  registry 切换器自带持久化契约（P0-2：click → `localStorage.lang`，
  try/catch 静默、纯锚点导航不 preventDefault）。头部注释的
  [locale-persist] 意图同步改写为组件内契约。
- `theme-toggle` 新增可选 `labels` prop（full 变体文案本地化）；本站
  用 `variant="compact"`（纯图标），无需传。
- `jixoai.css` 注释语境修正已消费（--brand-hue 注释现明确消费者用
  静态 hue；wall-clock 轮换是 ui.jixoai.com 站点本地行为）。
- 验证：bun install（根，无变化）→ 双模式 build PASS（缺省 subpath +
  SITE_CNAME=1 SITE_CNAME_DOMAIN=openiweb.jixoai.com
  SITE_URL=https://openiweb.jixoai.com，dist/CNAME 写入）+
  check-static PASS（CNAME 模式）；playwright 无头抽查 dev（13226）：
  点中文 → `lang=zh` 且落 `/zh/`、刷新留 zh（`<html lang="zh">`）、
  点 EN → `lang=en` 且刷新留 en——6/6 绿。
