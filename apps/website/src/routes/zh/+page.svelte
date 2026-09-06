<!---
  Orthogonal intents (2026-09-06): [site-i18n] 中文镜像页（/zh/，与英文根页
  同构，文案取自仓库 README-zh.md）；html lang 与 hreflang 由
  $lib/home-page.svelte + src/hooks.server.ts 承载。
  Original request (2026-09-06, Asia/Shanghai): 所有站点需要至少提供中英两种
  语言的支持；/ 保持英文（URL 稳定），/zh/ 为中文镜像。
-->
<script lang="ts">
  import HomePage from "$lib/home-page.svelte";
</script>

<HomePage locale="zh" />
