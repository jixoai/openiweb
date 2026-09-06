## 1. Site locale surface

- [x] 1.1 `/` = en (unchanged URLs); `/zh/` mirror page with copy from
  README-zh.md; `<html lang>` per locale; hreflang alternates
  (en/zh/x-default).
- [x] 1.2 `npx jixoai-ui add language-switcher` (one item, verify disk
  landed), wire into terminal-header; switcher preserves the current
  anchor/path across locales.
- [x] 1.3 llms export covers both locales; re-run builds byte-identical;
  static spot-check `/zh/` 200 under `/openiweb` mount; `bun run check`
  green (extend checks for the zh page).
- [x] 1.4 `SITE_BASE=/openiweb bun run build` green; NOTES.md updated;
  friction log reported.
