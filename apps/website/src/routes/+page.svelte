<!---
  Orthogonal intents (2026-09-06): [official-site] 英文首页（站点根，URL 稳定
  不变）；[site-i18n] 仅作为 locale 装配层——叙事骨架与文案在
  $lib/home-page.svelte + $lib/site-i18n.ts，与 /zh/ 镜像同构。
  Original request (2026-09-06, Asia/Shanghai): 新增 ./openiweb 官网站点。
-->
<script lang="ts">
  import HomePage from "$lib/home-page.svelte";
</script>

<HomePage locale="en" />
