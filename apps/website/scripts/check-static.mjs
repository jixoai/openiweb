#!/usr/bin/env node
// Orthogonal intents (2026-09-06): [link-check] 构建产物的静态抽查——
// dist/index.html 与 dist/zh/index.html 存在、站内绝对 URL 均带 SITE_BASE
// 前缀、内部链接目标文件真实存在（base path 下 200 的等价静态证明）；
// [ai-export] llms.txt / llms-full.txt / 每页 .md 镜像存在且以绝对 URL
// 引用；[cname-gate] 非生产构建不得携带 CNAME；
// [site-i18n] (2026-09-06) 双 locale 面——每页 <html lang> 与期望 locale
// 一致（hooks.server 变换落盘证明）、hreflang 三件套（en/zh/x-default）
// 齐备、zh 侧 AI 导出（zh/llms.txt + zh/index.md）存在且被根 llms.txt
// 的 "Other languages" 节链接。
// Original request (2026-09-06, Asia/Shanghai): 新增 ./openiweb 官网站点。
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(packageRoot, "dist");
const base = process.env.SITE_BASE
  ? `/${String(process.env.SITE_BASE).replace(/^\/+|\/+$/g, "")}`
  : "";

const failures = [];
const ok = (message) => console.log(`[check-static] ok: ${message}`);
const fail = (message) => failures.push(message);

// 页面级检查：存在性、html lang、base 前缀、本地目标可解析、hreflang。
// zh 镜像是目录形态（zh/index.html，路由级 trailingSlash "always"），
// 服务 URL 为 ${base}/zh/。
const pages = [
  { rel: "index.html", lang: "en", pageUrl: `${base || ""}/` },
  { rel: "zh/index.html", lang: "zh", pageUrl: `${base}/zh/` },
];

for (const page of pages) {
  const pagePath = path.join(distDir, page.rel);
  if (!existsSync(pagePath)) {
    fail(`${page.rel} missing`);
    continue;
  }
  ok(`${page.rel} exists`);
  const html = readFileSync(pagePath, "utf8");

  // 1. per-locale <html lang>（hooks.server 的 %lang% 变换必须落盘）。
  if (!new RegExp(`<html[^>]*\\blang="${page.lang}"`).test(html)) {
    fail(`${page.rel}: expected <html lang="${page.lang}"> not found`);
  } else {
    ok(`${page.rel} carries lang="${page.lang}"`);
  }

  // 2. hreflang 三件套（绝对 URL，en/zh/x-default；x-default 指向 en 根）。
  const expectedOrigin = process.env.SITE_URL ?? (process.env.SITE_CNAME === '1' ? 'https://openiweb.jixoai.com' : `https://jixoai.github.io${base}`);
  const hreflangs = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*>/g)].map((m) => m[0]);
  for (const [code, href] of [
    ["en", `${expectedOrigin}/`],
    ["zh", `${expectedOrigin}/zh/`],
    ["x-default", `${expectedOrigin}/`],
  ]) {
    const found = hreflangs.some(
      (tag) => new RegExp(`hreflang="${code}"`).test(tag) && tag.includes(`href="${href}"`),
    );
    if (!found) fail(`${page.rel}: hreflang ${code} → ${href} missing`);
  }
  if (!failures.some((f) => f.startsWith(`${page.rel}: hreflang`))) {
    ok(`${page.rel} carries hreflang en/zh/x-default (origin ${expectedOrigin})`);
  }

  // 3. 站内绝对 URL 必须带 base 前缀（漏前缀 = 根路径 404）；等于 base
  //    本身的目录 URL（如品牌块 homeHref）合法。
  const absolute = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1]);
  const unprefixed = absolute.filter((url) => base && url !== base && !url.startsWith(`${base}/`));
  if (base && unprefixed.length > 0) {
    fail(`${page.rel}: absolute URLs missing the ${base} prefix: ${unprefixed.join(", ")}`);
  } else {
    ok(`${page.rel}: all ${absolute.length} absolute page URLs carry the base prefix`);
  }

  // 4. 页面引用的本地文件真实存在（base 剥离后落盘路径）。
  const missing = absolute
    .map((url) => url.replace(/[#?].*$/, ""))
    .filter((url) => !url.startsWith("//"))
    .filter((url) => {
      const rel = base ? url.slice(base.length) : url;
      if (rel === "/" || rel === "") return false;
      const target = path.join(distDir, rel);
      if (existsSync(target) && statSync(target).isFile()) return false;
      // 目录 URL 允许落点为 <dir>/index.html。
      const asDirectory = path.join(distDir, rel, "index.html");
      return !(existsSync(asDirectory) && statSync(asDirectory).isFile());
    });
  if (missing.length > 0) {
    fail(`${page.rel}: referenced local targets missing on disk: ${missing.join(", ")}`);
  } else {
    ok(`${page.rel}: every referenced local target resolves to a file in dist`);
  }
}

// 5. AI export 层（双 locale）。
const aiExportFiles = [
  "llms.txt",
  "llms-full.txt",
  "index.md",
  "zh/llms.txt",
  "zh/index.md",
];
for (const file of aiExportFiles) {
  const target = path.join(distDir, file);
  if (!existsSync(target)) fail(`${file} missing`);
  else ok(`${file} exists`);
}
const expectedOrigin = process.env.SITE_URL ?? (process.env.SITE_CNAME === '1' ? 'https://openiweb.jixoai.com' : `https://jixoai.github.io${base}`);
for (const file of ["llms.txt", "zh/llms.txt"]) {
  const target = path.join(distDir, file);
  if (!existsSync(target)) continue;
  const llms = readFileSync(target, "utf8");
  const relativeLinks = [...llms.matchAll(/\]\(([^)]+)\)/g)]
    .map((m) => m[1])
    .filter((url) => !/^[a-z]+:\/\//i.test(url) && !url.startsWith("#"));
  if (relativeLinks.length > 0) {
    fail(`${file} carries non-absolute links: ${relativeLinks.slice(0, 5).join(", ")}`);
  } else {
    ok(`${file} links are absolute (origin ${expectedOrigin})`);
  }
}
// 根 llms.txt 必须把 zh 版链接进 "Other languages"（locale 覆盖的交叉证明）。
const rootLlms = existsSync(path.join(distDir, "llms.txt"))
  ? readFileSync(path.join(distDir, "llms.txt"), "utf8")
  : "";
if (rootLlms && !rootLlms.includes(`${expectedOrigin}/zh/llms.txt`)) {
  fail(`llms.txt does not link the zh edition (${expectedOrigin}/zh/llms.txt)`);
} else if (rootLlms) {
  ok("llms.txt links the zh edition in Other languages");
}

// 6. CNAME 门控。
const cnamePath = path.join(distDir, "CNAME");
if (process.env.SITE_CNAME === "1") {
  if (!existsSync(cnamePath)) fail("SITE_CNAME=1 but dist/CNAME missing");
  else ok(`dist/CNAME exists (${readFileSync(cnamePath, "utf8").trim()})`);
} else if (existsSync(cnamePath)) {
  fail("dist/CNAME present without SITE_CNAME=1");
} else {
  ok("no CNAME in this build (subpath/preview mode)");
}

if (failures.length > 0) {
  console.error("[check-static] FAILED");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("[check-static] all checks passed");
