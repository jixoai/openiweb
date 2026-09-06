// Orthogonal intents (2026-09-06): [site-i18n] per-locale <html lang>——
// app.html 模板携带 %lang% 占位符，本 hook 在页面解析期按 route id（/zh*
// → zh，其余 → en）替换。adapter-static 全量预渲染在构建期走同一管路，
// 产物 HTML 直接携带正确 lang；客户端路由后的 lang 同步由根布局的
// $effect 负责。
// Original request (2026-09-06, Asia/Shanghai): 所有站点需要至少提供中英两种
// 语言的支持；/ 保持英文（URL 稳定），/zh/ 为中文镜像。
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = ({ event, resolve }) => {
	const lang = event.route.id?.startsWith("/zh") ? "zh" : "en";
	return resolve(event, {
		// 锚定 lang 属性做全局替换：模板里若他处出现同形文本（注释等）
		// 不受影响（单次 String.replace 只命中首个匹配的坑，2026-09-06）。
		transformPageChunk: ({ html }) => html.replaceAll(`lang="%lang%"`, `lang="${lang}"`),
	});
};
