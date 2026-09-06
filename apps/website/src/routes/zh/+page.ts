// Orthogonal intents (2026-09-06): [site-i18n] zh 镜像路由的预渲染形态
// ——trailingSlash "always"（覆盖根布局的 "never"）让 /zh/ 预渲染为
// zh/index.html 目录形态（而非平铺 zh.html）：哑静态服务器（python
// http.server 本地抽查）与 GitHub Pages 都能以 /zh/ 直接命中 200，且
// /zh/ 是 locale 镜像的惯例 URL 形态；en 根的 URL 契约不变。
// Original request (2026-09-06, Asia/Shanghai): 所有站点需要至少提供中英两种
// 语言的支持；/ 保持英文（URL 稳定），/zh/ 为中文镜像。
export const prerender = true;
export const trailingSlash = "always";
