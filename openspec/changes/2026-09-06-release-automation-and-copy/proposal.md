> Orthogonal intents (maintained 2026-09-06 Asia/Shanghai): release
> automation (GitHub Releases as L1); site copy upgrade from project
> first principles.
>
> Original request (2026-09-06 Asia/Shanghai): 官网文案要升级（子代理
> 深入理解项目目的与初衷）；把没有好好配置 github-releases 的仓库
> CI/CD 升级为实现自动发布，让 jixoai.com 能显示版本号。

## Why

The repo distributes via Docker images and has NO release automation at
all — no tags, no GitHub Releases, so jixoai.com's version pill reads
"v—" and the org blog has no L1 to link. The site copy is a feature
inventory from the README; it explains what iweb contains, not who it
is for and why it exists.

## What Changes

### 1. Release automation (L1)

- Add a release workflow: `workflow_dispatch` with a version input (or
  tag push `v*`) → tag → GitHub Release with notes (summary of what
  shipped, docker image reference, upgrade note). Versioning scheme:
  `vX.Y.Z` tracking the product milestones (start from v0.1.0).
- Bootstrap: cut the first release (v0.1.0) via the new workflow —
  notes summarize the current product state from README (kernel, MCP
  operations, two-tier trust, RustFS, owner keys, console, demos).

### 2. Site copy upgrade (en + zh)

- Deep-read the intent sources (README pair, openspec/ project docs,
  AGENTS.md/CONTEXT.md) and rewrite hero + features in BOTH locales:
  lead with the person ("普通人的个人应用节点" — someone who wants
  self-hosted apps without learning ops, delegating operations to an
  AI coding agent via MCP + one owner key), then the trust/runtime
  architecture as the reason to believe, then the demos as proof.
  Facts traceable; no invented claims.

## Capabilities

### Modified Capabilities

- `website`: copy upgrade (both locales).

## Non-goals

- No npm publishing, no kernel/runtime changes, no site registry/lock
  surface changes beyond copy.
