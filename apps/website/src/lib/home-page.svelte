<!---
  Orthogonal intents (2026-09-06): [official-site] 首页叙事骨架——hero（面向
  普通人的个人应用节点）→ 特性栅格 → 单端口入口矩阵 → 演示应用 →
  quick-start 终端 → MCP 接入 → 安全边界 → 当前限制 → 生态链接；en/zh 两
  个路由（/ 与 /zh）共用本组件，文案全部来自 $lib/site-i18n 的同构字典；
  [locale-head] html lang 由 hooks.server 的 %lang% 变换承载，本组件只负责
  per-locale title/description 与 hreflang 三件套（en/zh/x-default，绝对
  URL 来自构建期注入的 __SITE_URL__）；
  [motion-law] data-reveal 静态标注（滚动驱动 CSS 法则，无运行时 action）。

  Original request (2026-09-06, Asia/Shanghai): 所有站点需要至少提供中英两种
  语言的支持；/ 保持英文（URL 稳定），/zh/ 为中文镜像。
-->
<script lang="ts">
  import CardGrid from "$lib/ui/card-grid/card-grid.svelte";
  import HeroSection from "$lib/ui/hero-section/hero-section.svelte";
  import PressButton from "$lib/ui/press-button/press-button.svelte";
  import SectionCard from "$lib/ui/section-card/section-card.svelte";
  import TerminalCard from "$lib/ui/terminal-card/terminal-card.svelte";
  import { SANDBOX_SPEC_URL } from "$lib/site";
  import { siteCopy, type LocaleCode } from "$lib/site-i18n";

  let { locale }: { locale: LocaleCode } = $props();

  const copy = $derived(siteCopy[locale]);

  // hreflang 三件套：en 为规范根（x-default 也指向 en），zh 为镜像页
  // （目录形态 /zh/，与 zh 路由的 trailingSlash 契约一致）。
  // 绝对 URL 的 origin+base 由 vite define 注入（__SITE_URL__，与
  // llms-txt 的 siteUrl 同源推导），两种服务形态（子路径/自定义域）零改动。
  const alternates = [
    { hreflang: "en", href: `${__SITE_URL__}/` },
    { hreflang: "zh", href: `${__SITE_URL__}/zh/` },
    { hreflang: "x-default", href: `${__SITE_URL__}/` },
  ];
</script>

<svelte:head>
  <title>{copy.meta.title}</title>
  <meta name="description" content={copy.meta.description} />
  {#each alternates as alternate (alternate.hreflang)}
    <link rel="alternate" hreflang={alternate.hreflang} href={alternate.href} />
  {/each}
</svelte:head>

<!-- Hero：Broadside 开放式导语 + quick-start 终端。 -->
<HeroSection
  eyebrow={copy.hero.eyebrow}
  summary={copy.hero.summary}
  copyCommand={copy.hero.terminal.command}
>
  {#snippet title()}
    {copy.hero.titleLead} <em>{copy.hero.titleEm}</em>
  {/snippet}
  {#snippet badges()}
    {#each copy.hero.badges as badge (badge)}
      <span>{badge}</span>
    {/each}
  {/snippet}
  {#snippet secondary()}
    {#each copy.hero.secondary as button (button.label)}
      <PressButton variant="outline" href={button.href} external={button.external}>
        {button.label}
      </PressButton>
    {/each}
  {/snippet}
  {#snippet terminal()}
    <TerminalCard
      barTitle={copy.hero.terminal.barTitle}
      command={copy.hero.terminal.command}
      outputs={copy.hero.terminal.outputs}
    />
  {/snippet}
</HeroSection>

<!-- What's inside：特性栅格。 -->
<section class="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8" aria-label={copy.insideHeading}>
  <h2
    class="font-nav flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]"
    data-reveal=""
  >
    {copy.insideHeading}
    <span class="bg-border h-px flex-1" aria-hidden="true"></span>
  </h2>
  <CardGrid class="mt-6">
    {#each copy.features as feature (feature.id)}
      <div data-reveal="">
        <SectionCard eyebrow={feature.eyebrow} title={feature.title}>
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">{feature.body}</p>
        </SectionCard>
      </div>
    {/each}
  </CardGrid>
</section>

<!-- 单端口入口矩阵。 -->
<div
  class="mx-auto w-full max-w-[90rem] px-4 pt-8 sm:px-6 lg:px-8"
  data-reveal=""
>
  <SectionCard
    eyebrow={copy.ingress.eyebrow}
    title={copy.ingress.title}
    summary={copy.ingress.summary}
  >
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>{copy.ingress.routeCol}</th>
            <th>{copy.ingress.servesCol}</th>
          </tr>
        </thead>
        <tbody>
          {#each copy.ingress.rows as row (row.route)}
            <tr>
              <td><code>{row.route}</code></td>
              <td>{row.serves}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="text-muted-foreground mt-4 text-[13px] leading-5">
      {copy.ingress.behind}
    </p>
  </SectionCard>
</div>

<!-- 演示应用。 -->
<div
  class="mx-auto w-full max-w-[90rem] px-4 pt-8 sm:px-6 lg:px-8"
  data-reveal=""
>
  <SectionCard
    eyebrow={copy.demos.eyebrow}
    title={copy.demos.title}
    summary={copy.demos.summary}
  >
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>{copy.demos.appCol}</th>
            <th>{copy.demos.hostCol}</th>
            <th>{copy.demos.demonstratesCol}</th>
          </tr>
        </thead>
        <tbody>
          {#each copy.demos.rows as demo (demo.app)}
            <tr>
              <td><code>{demo.app}</code></td>
              <td class="dim">{demo.host}</td>
              <td>{demo.demonstrates}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </SectionCard>
</div>

<!-- Quick start。 -->
<div
  id="quick-start"
  class="mx-auto w-full max-w-[90rem] scroll-mt-24 px-4 pt-8 sm:px-6 lg:px-8"
  data-reveal=""
>
  <SectionCard
    eyebrow={copy.quickStart.eyebrow}
    title={copy.quickStart.title}
    summary={copy.quickStart.summary}
  >
    <div class="flex flex-col gap-5">
      <div class="readonly-code">
        <div class="readonly-code-meta"><span class="prompt">$</span><span>shell</span></div>
        <pre><code>{#each copy.quickStart.code as line, index (index)}{index > 0 ? "\n" : ""}{#if line.comment}<span class="tok-comment">{line.text}</span>{:else}{line.text}{/if}{/each}</code></pre>
      </div>
      <p class="text-muted-foreground text-[13px] leading-5">
        {copy.quickStart.trailing}
      </p>
    </div>
  </SectionCard>
</div>

<!-- MCP 接入。 -->
<div
  class="mx-auto w-full max-w-[90rem] px-4 pt-8 sm:px-6 lg:px-8"
  data-reveal=""
>
  <SectionCard
    eyebrow={copy.mcp.eyebrow}
    title={copy.mcp.title}
    summary={copy.mcp.summary}
  >
    <div class="readonly-code">
      <div class="readonly-code-meta"><span>mcp.json</span></div>
      <pre><code>{copy.mcp.code}</code></pre>
    </div>
  </SectionCard>
</div>

<!-- 安全边界。 -->
<div
  id="security"
  class="mx-auto w-full max-w-[90rem] scroll-mt-24 px-4 pt-8 sm:px-6 lg:px-8"
  data-reveal=""
>
  <SectionCard
    eyebrow={copy.security.eyebrow}
    title={copy.security.title}
    summary={copy.security.summary}
  >
    <ul class="flex flex-col gap-2.5 text-[13px] leading-6">
      {#each copy.security.bullets as bullet (bullet.lead)}
        <li>
          <strong>{bullet.lead}</strong>
          {bullet.body}
        </li>
      {/each}
      <li>
        <strong>{copy.security.secrets.lead}</strong>
        {copy.security.secrets.body}
        {copy.security.lawPre}
        <a
          href={SANDBOX_SPEC_URL}
          class="text-primary underline underline-offset-2"
          >{copy.security.lawLink}</a
        >{copy.security.lawPost}
      </li>
    </ul>
  </SectionCard>
</div>

<!-- 当前限制 + 生态链接。 -->
<div
  class="mx-auto w-full max-w-[90rem] px-4 pt-8 sm:px-6 lg:px-8"
  data-reveal=""
>
  <SectionCard eyebrow={copy.honesty.eyebrow} title={copy.honesty.title}>
    <ul class="text-muted-foreground flex list-disc flex-col gap-1.5 ps-5 text-[13px] leading-6">
      {#each copy.honesty.items as limitation (limitation)}
        <li>{limitation}</li>
      {/each}
    </ul>
    <div class="mt-5 flex flex-wrap gap-3">
      {#each copy.honesty.buttons as button (button.label)}
        <PressButton variant="outline" href={button.href} external={button.external}>
          {button.label}
        </PressButton>
      {/each}
    </div>
  </SectionCard>
</div>
