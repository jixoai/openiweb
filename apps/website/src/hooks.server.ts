// Orthogonal intents (2026-09-06): [site-i18n] per-locale <html lang>——
// app.html 模板携带 %lang% 占位符，本 hook 在页面解析期按 route id（/zh*
// → zh，其余 → en）替换。adapter-static 全量预渲染在构建期走同一管路，
// 产物 HTML 直接携带正确 lang；客户端路由后的 lang 同步由根布局的
// $effect 负责。
// [locale-negotiation] (2026-09-06) app.html 协商脚本的服务模式 base——
// 同源解析 SITE_BASE（与 svelte.config.js 的 resolveBase 同律；CNAME 模式
// 即 SITE_BASE 缺省 → 根路径），锚定引号替换，预渲染产物落正确值。
// Original request (2026-09-06, Asia/Shanghai): 所有站点需要至少提供中英两种
// 语言的支持；/ 保持英文（URL 稳定），/zh/ 为中文镜像。
import type { Handle } from "@sveltejs/kit";

/** 与 svelte.config.js 同律：规格化为 "" 或 "/openiweb" 形态。 */
function resolveBase(raw: string | undefined): string {
	if (!raw) return "";
	return `/${String(raw).replace(/^\/+|\/+$/g, "")}`;
}

const siteBase = resolveBase(process.env.SITE_BASE);

export const handle: Handle = ({ event, resolve }) => {
	const lang = event.route.id?.startsWith("/zh") ? "zh" : "en";
	return resolve(event, {
		// 锚定 lang 属性做全局替换：模板里若他处出现同形文本（注释等）
		// 不受影响（单次 String.replace 只命中首个匹配的坑，2026-09-06）。
		transformPageChunk: ({ html }) =>
			typeof html === "string"
				? html
						.replaceAll(`lang="%lang%"`, `lang="${lang}"`)
						.replaceAll(`"%site_base%"`, `"${siteBase}"`)
				: html,
	});
};
