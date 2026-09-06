// Orthogonal intents (2026-09-06): [site-i18n] 双语（en/zh）文案唯一信源
// ——en 逐字取自原英文首页（URL 稳定不改一字），zh 逐段取自仓库
// README-zh.md（不虚构任何能力）；[locale-meta] locale 元数据（html lang、
// 切换器标签）。en/zh 两个字典被 SiteCopy 类型锁成同构，形状漂移编译期
// 即报错。
// Original request (2026-09-06, Asia/Shanghai): 所有站点需要至少提供中英
// 两种语言的支持；/ 保持英文（URL 稳定），/zh/ 为中文镜像。
import { GITHUB_URL, README_URL, README_ZH_URL, SPECS_URL } from "./site";

export type LocaleCode = "en" | "zh";

export interface FeatureCard {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
}

export interface IngressRow {
  route: string;
  serves: string;
}

export interface DemoRow {
  app: string;
  host: string;
  demonstrates: string;
}

/** quick-start 终端里的一行；comment 行渲染为 tok-comment 高亮。 */
export interface CodeLine {
  text: string;
  comment?: boolean;
}

export interface LinkButton {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteCopy {
  htmlLang: string;
  headerSubtitle: string;
  switcherAria: string;
  meta: { title: string; description: string };
  nav: {
    landmark: string;
    overview: string;
    quickStart: string;
    security: string;
    github: string;
    language: string;
  };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleEm: string;
    summary: string;
    badges: string[];
    secondary: LinkButton[];
    terminal: { barTitle: string; command: string; outputs: string[] };
  };
  insideHeading: string;
  features: FeatureCard[];
  ingress: {
    eyebrow: string;
    title: string;
    summary: string;
    routeCol: string;
    servesCol: string;
    rows: IngressRow[];
    behind: string;
  };
  demos: {
    eyebrow: string;
    title: string;
    summary: string;
    appCol: string;
    hostCol: string;
    demonstratesCol: string;
    rows: DemoRow[];
  };
  quickStart: {
    eyebrow: string;
    title: string;
    summary: string;
    code: CodeLine[];
    trailing: string;
  };
  mcp: { eyebrow: string; title: string; summary: string; code: string };
  security: {
    eyebrow: string;
    title: string;
    summary: string;
    bullets: { lead: string; body: string }[];
    secrets: { lead: string; body: string };
    lawPre: string;
    lawLink: string;
    lawPost: string;
  };
  honesty: { eyebrow: string; title: string; items: string[]; buttons: LinkButton[] };
  footer: {
    projectTitle: string;
    specsTitle: string;
    docsLabel: string;
    docsUrl: string;
  };
}

const MCP_CONFIG = [
  '{ "mcpServers": { "iweb": { "url": "https://mcp.<base>/mcp",',
  '  "headers": { "Authorization": "Bearer <owner-key>" } } } }',
].join("\n");

const en: SiteCopy = {
  htmlLang: "en",
  headerSubtitle: "personal application node",
  switcherAria: "Language",
  meta: {
    title: "iweb — a personal application node",
    description:
      "iweb is an open-source personal application node for people who don't want to learn containers, databases, or network operations. An AI coding agent deploys and operates applications over MCP; you manage everything from a browser console.",
  },
  nav: {
    landmark: "Primary",
    overview: "Overview",
    quickStart: "Quick start",
    security: "Security",
    github: "GitHub",
    language: "Language",
  },
  hero: {
    eyebrow: "iweb · open-source personal application node",
    titleLead: "A personal application node.",
    titleEm: "Operated by your AI agent.",
    summary:
      "You don't need to learn containers, databases, or network operations. Hand your MCP endpoint and one owner key to an AI coding agent (Codex, Claude Code, …) — it deploys and operates applications on your own node. You manage everything from a browser console with a single key.",
    badges: ["Single-port Rust kernel", "MCP operations", "Two-tier trust runtime", "≤ 240 MB idle"],
    secondary: [
      { label: "Quick start", href: "#quick-start" },
      { label: "GitHub ↗", href: GITHUB_URL, external: true },
    ],
    terminal: {
      barTitle: "quick-start — zsh",
      command: "docker compose up -d --build",
      outputs: [
        "iweb-kernel listening :8080 — the only published port",
        'health: curl -H "Host: $IWEB_BASE_HOST" http://127.0.0.1:9010/_iweb/health',
        "console: https://admin.<base>/ — log in with an owner key",
      ],
    },
  },
  insideHeading: "What’s inside",
  features: [
    {
      id: "kernel",
      eyebrow: "Ingress · 01",
      title: "Single-port Rust kernel",
      body: "kernel-rs is a ~4MB static Rust binary and the node's only published port. It owns host routing, the recovery authority, owner-key auth, and a per-app proxy with WebSocket upgrade tunnels. Everything else — RustFS, the control API, every celld listener — stays on container-internal loopback.",
    },
    {
      id: "mcp",
      eyebrow: "Operations · 02",
      title: "MCP is the operator",
      body: "mcp.<base>/mcp is a protected system application: every JSON-RPC request — including initialize and tools/list — must carry an owner key as a Bearer token. Tools cover workspace read/write/delete and domain listing/registration. The worker forwards the credential per request and never stores it.",
    },
    {
      id: "runtime",
      eyebrow: "Trust · 03",
      title: "Two-tier runtime trust",
      body: "celld v0.3 (Cloudflare Workers API) is the trusted tier: image-seeded fleet apps, one process per app, watchdog soft limits. iweb-wasmd is the untrusted tier and the only runtime admission path: arbitrary or AI-generated packages execute as wasi:http 0.2 components under Wasmtime — engine-enforced isolation, host services, no socket capability.",
    },
    {
      id: "storage",
      eyebrow: "Storage · 04",
      title: "Built-in RustFS",
      body: "S3-compatible object storage (MinIO lineage), single-node friendly with a low memory envelope, loopback-only with no console. Buckets: iweb-workspace, iweb-cells-<app>, iweb-apps, iweb-system.",
    },
    {
      id: "keys",
      eyebrow: "Identity · 05",
      title: "Revocable owner keys",
      body: "One identity, many revocable tokens (the GitHub PAT model). Issue delegated keys (iwb_<id>_<secret>) with absolute expiry, copy a ready-to-paste deployment prompt for an AI agent, ban a key instantly, and read an append-only, per-key-attributed audit trail of every control-plane operation. The bootstrap IWEB_API_TOKEN cannot be banned — it is the credential face of the recovery law.",
    },
    {
      id: "console",
      eyebrow: "Console · 06",
      title: "Static console, tight envelope",
      body: "A SvelteKit + shadcn-svelte static app served as celld native assets — replaceable like any app, never a secret configuration screen. The whole node idles within ≤ 240 MB RssAnon (spec: openspec/specs/node-boundary/).",
    },
  ],
  ingress: {
    eyebrow: "Ingress",
    title: "One published port routes the whole node",
    summary:
      "iweb-kernel :8080 is the only published port (a single Rust binary). Everything except the Kernel ingress — RustFS, the control API, every celld listener — stays on container-internal loopback and is never published. One installation is one owner's personal node.",
    routeCol: "Route",
    servesCol: "Serves",
    rows: [
      { route: "api.<base>", serves: "Kernel control API (same router/auth as loopback)" },
      { route: "admin.<base>", serves: "per-app celld :8787 (Admin console)" },
      { route: "mcp.<base>/mcp", serves: "per-app celld :8797 (MCP endpoint)" },
      { route: "<app>.<base>", serves: "per-app celld (IWEB_CELLD_PORTS)" },
      { route: "<base>/<app>/app", serves: "path alias for the same application" },
    ],
    behind:
      "Behind the proxy: RustFS (S3-compatible, loopback-only, no console) backing the iweb-workspace / iweb-cells-<app> / iweb-apps / iweb-system buckets.",
  },
  demos: {
    eyebrow: "Demo apps",
    title: "Three reference applications ship in the image",
    summary:
      "They exercise the runtime end-to-end. Open collab on both of its domains in two browser windows — a message sent on one side jumps live on the other: the Durable Object cross-instance consistency demo.",
    appCol: "App",
    hostCol: "Host",
    demonstratesCol: "Demonstrates",
    rows: [
      {
        app: "hello",
        host: "hello.<base>",
        demonstrates: "Pure static site via celld's wrangler assets interface — no worker code.",
      },
      {
        app: "search",
        host: "search.<base>",
        demonstrates: "D1 (SQLite) database search with parameterized SQL.",
      },
      {
        app: "collab",
        host: "collab.<base>, collab-b.<base>",
        demonstrates:
          "Frontend/backend split; two celld instances share one Durable Object for cross-instance realtime collaboration over WebSocket.",
      },
    ],
  },
  quickStart: {
    eyebrow: "Quick start",
    title: "One compose command, one health check",
    summary:
      "IWEB_BASE_HOST is a hostname suffix only (no scheme/port/path). The container publishes one port (8080 — map it however you like); TLS is terminated in front of the node (1Panel, Caddy, nginx, …) and the kernel routes by HTTP Host header only.",
    code: [
      { text: "cp .env.example .env" },
      {
        text: "# Set a unique CELLD_NODE, IWEB_BASE_HOST, a long random IWEB_API_TOKEN,",
        comment: true,
      },
      { text: "# and the MinIO-compatible root + celld S3 secrets.", comment: true },
      { text: "docker compose up -d --build" },
      { text: 'curl -H "Host: $IWEB_BASE_HOST" http://127.0.0.1:9010/_iweb/health' },
    ],
    trailing:
      "Open the console at https://admin.<base>/ and log in with any valid owner key — the bootstrap IWEB_API_TOKEN, or a delegated key issued in the console. From the Keys & Audit view you can copy a ready-to-paste deployment prompt containing the MCP endpoint and key for an AI agent.",
  },
  mcp: {
    eyebrow: "MCP",
    title: "Point an agent at your node",
    summary:
      "Every JSON-RPC request — including initialize and tools/list — must carry Authorization: Bearer <owner-key> (bootstrap or delegated). Tools cover workspace read/write/delete and domain listing/registration.",
    code: MCP_CONFIG,
  },
  security: {
    eyebrow: "Security boundary",
    title: "Untrusted by default, isolated by design",
    summary:
      "Applications may be copied from the internet or generated by AI, so they are untrusted by default — isolating every application from the node control plane and from each other is the product's security bottom line.",
    bullets: [
      {
        lead: "celld is the trusted tier.",
        body: "Fleet applications (admin, mcp, notes, hello, search, collab) enter the node only through node images you build, run one process per app, and are bounded by a userspace resource watchdog (soft-limit SIGKILL plus per-app restart). There is no celld runtime admission; celld is never a hostile multi-tenant boundary.",
      },
      {
        lead: "wasm is the untrusted tier and the only runtime admission path.",
        body: "Arbitrary, network-sourced, or AI-generated packages execute as wasi:http 0.2 components under Wasmtime with engine-enforced limits (no socket/TLS/fs capability, host-mediated egress, fuel/epoch/store caps) and host services (KV/SQL/Logging) as the data plane.",
      },
    ],
    secrets: {
      lead: "Never place secrets in the workspace.",
      body: "Credentials live only in node environment or Kernel-issued keys.",
    },
    lawPre: "The law lives in",
    lawLink: "openspec/specs/application-sandbox",
    lawPost: ".",
  },
  honesty: {
    eyebrow: "Honesty",
    title: "Current limitations",
    items: [
      "TLS/wildcard certificates are a deployment concern (the kernel is HTTP Host-routing inside the container).",
      "Monitor metrics are per-Kernel-lifecycle, not durable history.",
      "notes is deployed but not routed (user routes target the wasm tier only).",
      "wasm publication stays fail-closed behind its acceptance record and switch; celld publication does not exist (image-only supply).",
    ],
    buttons: [
      { label: "GitHub ↗", href: GITHUB_URL, external: true },
      { label: "中文文档 ↗", href: README_ZH_URL, external: true },
      { label: "README ↗", href: README_URL, external: true },
      { label: "openspec specs ↗", href: SPECS_URL, external: true },
    ],
  },
  footer: {
    projectTitle: "project",
    specsTitle: "specs",
    docsLabel: "中文文档",
    docsUrl: README_ZH_URL,
  },
};

const zh: SiteCopy = {
  htmlLang: "zh",
  headerSubtitle: "个人应用节点",
  switcherAria: "语言",
  meta: {
    title: "iweb — 个人应用节点",
    description:
      "iweb 是一个面向普通人的开源个人应用节点：你不需要理解容器、数据库或网络运维，把 MCP 端点和一把密钥交给 AI 编程代理，应用就部署和运行在你自己的节点上；你用一个浏览器控制台和一把密钥管理一切。",
  },
  nav: {
    landmark: "主导航",
    overview: "总览",
    quickStart: "快速开始",
    security: "安全边界",
    github: "GitHub",
    language: "语言",
  },
  hero: {
    eyebrow: "iweb · 开源个人应用节点",
    titleLead: "个人应用节点。",
    titleEm: "由你的 AI 代理运维。",
    summary:
      "你不需要理解容器、数据库或网络运维，把 MCP 端点和一把密钥交给 AI 编程代理（Codex、Claude Code……），应用就部署和运行在你自己的节点上；你用一个浏览器控制台和一把密钥管理一切。",
    badges: ["单端口 Rust 内核", "MCP 运维", "两层信任运行时", "闲时 ≤ 240 MB"],
    secondary: [
      { label: "快速开始", href: "#quick-start" },
      { label: "GitHub ↗", href: GITHUB_URL, external: true },
    ],
    terminal: {
      barTitle: "quick-start — zsh",
      command: "docker compose up -d --build",
      outputs: [
        "iweb-kernel listening :8080 — 唯一发布端口",
        'health: curl -H "Host: $IWEB_BASE_HOST" http://127.0.0.1:9010/_iweb/health',
        "console: https://admin.<base>/ — 用 owner 密钥登录",
      ],
    },
  },
  insideHeading: "内部构成",
  features: [
    {
      id: "kernel",
      eyebrow: "入口 · 01",
      title: "单端口 Rust 内核",
      body: "kernel-rs 是 ~4MB 的 Rust 静态二进制，也是节点唯一发布的端口。它掌管 Host 路由、恢复权威、owner-key 鉴权，以及带 WebSocket 升级隧道的逐应用代理。其余一切——RustFS、控制 API、每个 celld 监听——都只在容器内回环。",
    },
    {
      id: "mcp",
      eyebrow: "运维 · 02",
      title: "MCP 即运维者",
      body: "mcp.<base>/mcp 是受保护的系统应用：每个 JSON-RPC 请求——包括 initialize 和 tools/list——都必须以 Bearer 令牌携带一把 owner 密钥。工具覆盖工作区读写删与域名清单/注册。Worker 逐请求转发凭据，绝不存储。",
    },
    {
      id: "runtime",
      eyebrow: "信任 · 03",
      title: "两层运行时信任",
      body: "celld v0.3（Cloudflare Workers API）是信任层：镜像种子舰队应用，每应用独立进程 + 看门狗软限。iweb-wasmd 是不可信层、也是唯一的运行时准入路径：任意或 AI 生成的应用包以 wasi:http 0.2 组件形态在 Wasmtime 中执行——引擎内强制隔离、宿主服务、无 socket 能力。",
    },
    {
      id: "storage",
      eyebrow: "存储 · 04",
      title: "内置 RustFS",
      body: "S3 兼容对象存储（MinIO 血统），单节点友好、低内存封套，仅回环、不开 console。桶：iweb-workspace、iweb-cells-<app>、iweb-apps、iweb-system。",
    },
    {
      id: "keys",
      eyebrow: "身份 · 05",
      title: "可吊销的 owner 密钥",
      body: "一个身份，多把可吊销令牌（GitHub PAT 模式）：签发带绝对过期的委托密钥（iwb_<id>_<secret>）、一键复制可直接粘给 AI 代理的部署提示词、即时吊销任意密钥，并读取 append-only、按密钥归因的控制面审计追踪。bootstrap IWEB_API_TOKEN 永远有效且不可吊销——即使所有委托密钥与 Admin 应用全部失守，owner 仍能直达 Kernel 控制 API。",
    },
    {
      id: "console",
      eyebrow: "控制台 · 06",
      title: "静态控制台，紧凑封套",
      body: "SvelteKit + shadcn-svelte 静态应用，以 celld 原生资产服务——和普通应用一样可替换，永远不是密钥配置界面。整节点闲时内存封套 ≤ 240 MB RssAnon（规格见 openspec/specs/node-boundary/）。",
    },
  ],
  ingress: {
    eyebrow: "入口",
    title: "一个发布端口路由整个节点",
    summary:
      "iweb-kernel :8080 是唯一发布端口（单个 Rust 二进制）。除 Kernel 入口外的所有监听——RustFS、控制 API、每个 celld——都只在容器内回环，绝不发布。一台 iweb 安装 = 一个 owner 的个人节点。",
    routeCol: "路由",
    servesCol: "承载",
    rows: [
      { route: "api.<base>", serves: "Kernel 控制 API（与回环监听同鉴权）" },
      { route: "admin.<base>", serves: "独立 celld :8787（管理控制台）" },
      { route: "mcp.<base>/mcp", serves: "独立 celld :8797（MCP 端点）" },
      { route: "<app>.<base>", serves: "各应用独立 celld（IWEB_CELLD_PORTS）" },
      { route: "<base>/<app>/app", serves: "同一应用的路径别名" },
    ],
    behind:
      "代理之后：RustFS（S3 兼容，仅回环，不开 console）支撑 iweb-workspace / iweb-cells-<app> / iweb-apps / iweb-system 桶。",
  },
  demos: {
    eyebrow: "演示应用",
    title: "镜像内置三个参考应用",
    summary:
      "它们端到端验证运行时能力。在 collab 的两个域名各开一个浏览器窗口，一边发消息另一边实时跳动——这就是 Durable Object 跨实例一致性的直观演示。",
    appCol: "应用",
    hostCol: "域名",
    demonstratesCol: "演示内容",
    rows: [
      {
        app: "hello",
        host: "hello.<base>",
        demonstrates: "纯静态站：只用 celld 的 wrangler assets 文件接口，无 Worker 代码。",
      },
      {
        app: "search",
        host: "search.<base>",
        demonstrates: "D1（SQLite）数据库搜索：参数化 SQL、中文检索。",
      },
      {
        app: "collab",
        host: "collab.<base>, collab-b.<base>",
        demonstrates: "前后端分离；两个 celld 实例共享同一个 Durable Object，WebSocket 跨实例实时协作白板。",
      },
    ],
  },
  quickStart: {
    eyebrow: "快速开始",
    title: "一条 compose 命令，一次健康检查",
    summary:
      "IWEB_BASE_HOST 只是一个主机名后缀（不含协议/端口/路径）。容器内只发布一个端口（8080，映射随意）；TLS 由前置层终止（1Panel、Caddy、nginx……），内核只按 HTTP Host 头路由。",
    code: [
      { text: "cp .env.example .env" },
      { text: "# 设置唯一的 CELLD_NODE、IWEB_BASE_HOST、足够长的随机 IWEB_API_TOKEN，", comment: true },
      { text: "# 以及 MinIO 兼容的 root 与 celld S3 凭据。", comment: true },
      { text: "docker compose up -d --build" },
      { text: 'curl -H "Host: $IWEB_BASE_HOST" http://127.0.0.1:9010/_iweb/health' },
    ],
    trailing:
      "打开 https://admin.<base>/，用任意有效 owner 密钥登录——bootstrap IWEB_API_TOKEN，或控制台签发的委托密钥。在「密钥与审计」视图可以一键复制部署提示词：MCP 端点与密钥已模板化的 Agent 指令，直接粘给任何 AI 代理。",
  },
  mcp: {
    eyebrow: "MCP",
    title: "把 AI 代理指向你的节点",
    summary:
      "每个 JSON-RPC 请求——包括 initialize 和 tools/list——都必须携带 Authorization: Bearer <owner-key>（bootstrap 或委托密钥均可）。工具覆盖工作区读写删与域名清单/注册。Worker 逐请求转发凭据，绝不存储。",
    code: MCP_CONFIG,
  },
  security: {
    eyebrow: "安全边界",
    title: "默认不可信，隔离即设计",
    summary:
      "应用代码可能来自网络复制或 AI 生成，因此默认不可信——把每个应用与节点控制面、与其他应用隔离开，是本产品的安全底线。",
    bullets: [
      {
        lead: "celld 是信任层。",
        body: "舰队应用（admin、mcp、notes、hello、search、collab）只能经你构建的节点镜像进入，每应用一个独立进程，由用户态资源看门狗约束（软限 SIGKILL + 单应用退避重启）。不存在 celld 运行时准入，celld 也从不承诺对抗性多租户边界。",
      },
      {
        lead: "wasm 是不可信层、也是唯一的运行时准入路径。",
        body: "任意来源（网络下载、AI 生成）的应用包以 wasi:http 0.2 组件形态在 Wasmtime 中执行，隔离由引擎强制（无 socket/TLS/文件系统能力、宿主中介出口、fuel/epoch/store 上限），数据面只有宿主服务（KV/SQL/Logging）。",
      },
    ],
    secrets: {
      lead: "绝不把密钥放进工作区。",
      body: "凭据只存在于节点环境变量或 Kernel 签发的密钥。",
    },
    lawPre: "法律见",
    lawLink: "openspec/specs/application-sandbox",
    lawPost: "。",
  },
  honesty: {
    eyebrow: "坦诚",
    title: "当前限制",
    items: [
      "TLS/泛域名证书是部署侧事务（容器内内核只做 HTTP Host 路由）。",
      "监控指标是 Kernel 进程生命周期内的，不是持久历史。",
      "notes 已部署但未路由（用户路由只指向 wasm 层）。",
      "wasm 发布在验收记录与开关就绪前保持关闭；celld 发布不存在（只经镜像供给）。",
    ],
    buttons: [
      { label: "GitHub ↗", href: GITHUB_URL, external: true },
      { label: "English README ↗", href: README_URL, external: true },
      { label: "openspec specs ↗", href: SPECS_URL, external: true },
    ],
  },
  footer: {
    projectTitle: "project",
    specsTitle: "specs",
    docsLabel: "English README",
    docsUrl: README_URL,
  },
};

export const siteCopy: Record<LocaleCode, SiteCopy> = { en, zh };

/** locale → 站内路径（不含 base 前缀；en 为根，zh 为 /zh/ 目录形态）。 */
export const localePath: Record<LocaleCode, string> = { en: "", zh: "/zh/" };
