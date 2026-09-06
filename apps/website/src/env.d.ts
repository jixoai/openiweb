// Orthogonal intents (2026-09-06): [site-i18n] hreflang 绝对 URL 的构建期
// 注入——vite.config.ts 的 define 以 llms-txt 同源的 siteUrl 推导填充
// __SITE_URL__（SITE_URL > 按 SITE_BASE 推导），子路径/自定义域两种服务
// 形态零代码改动。
declare const __SITE_URL__: string;
