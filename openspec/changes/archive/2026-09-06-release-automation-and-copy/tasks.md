## 1. Release automation

- [x] 1.1 Add `.github/workflows/release.yml`: workflow_dispatch(version)
  + tag push `v*` → create GitHub Release (notes template: what shipped,
  docker image ref, upgrade note).
- [x] 1.2 Bootstrap v0.1.0 via the new workflow (notes from README
  summary); verify via gh api; jixoai.com resolves it on next build.
  (Bootstrapped via the equivalent `gh release create v0.1.0 --target
  main` — the workflow file is not pushed yet under the no-commit
  constraint of this task; tag v0.1.0 → main e520bc7.)

## 2. Site copy upgrade

- [x] 2.1 Read intent sources (README pair, openspec/, AGENTS.md,
  CONTEXT.md); extract the audience-first narrative (who, what pain,
  why believable) and proof points.
- [x] 2.2 Rewrite hero + features copy in en and zh (i18n dictionary);
  purpose-led, facts only; keep quick-start factual.
- [x] 2.3 Rebuild both locales + both serving modes green; checks pass;
  NOTES.md updated; friction log reported.
