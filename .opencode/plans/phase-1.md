# Phase 1 — Docs & UI Layer

**Status:** ✅ COMPLETE

## Goal
Find KISSME docs solution (agnostic, simple), create composables layer for web-vue, finalize framework-agnostic UI components.

## Key Constraint
`packages/ui` must stay **framework-agnostic** (vanilla TS / web components). No Vue, React, or Angular imports in `packages/ui/`. Framework-specific wrappers live in each app's own `src/components/` or `src/composables/`.

## Research Required (do first)

### Docs solution
Evaluate alternatives to VitePress. Requirements:
- Agnostic (not tied to Vue ecosystem)
- Simple, minimal config
- Markdown → HTML
- Search, navigation, theming

Candidates:
- ~~VitePress~~ (Vue-locked)
- ~~Docusaurus~~ (React-locked, heavy)
- ~~Rspress~~ (React-bound)
- ✅ **Astro + Starlight** — winner (agnostic, Vite-native, search, i18n)
- ~~Docsify~~ (no SEO, no Turbo cache)
- ~~DocMD~~ (too new/risky)

Decision: KISSME — lowest effort for good docs.

## Tasks

- [x] Research and choose docs solution → Astro + Starlight
- [x] Replace `apps/docs` with Astro + Starlight
- [x] Audit `packages/ui/` — clean, zero framework deps
- [x] Create composables layer (`apps/web-vue/src/composables/`) — useProducts()
- [x] Integrate Vite+ (vp CLI) — replace raw Vite CLI, update turbo.json
- [x] Verify build + lint passes
- [x] Dependency maintenance strategy defined — taze+turbo (manual) + Renovate (automated, every 2 weeks, no automerge)

## Decisions

| Decision | Choice |
|----------|--------|
| Docs framework | Astro + Starlight ✅ |
| packages/ui paradigm | Framework‑agnostic (vanilla TS) |
| Vite+ integration | Phase 1 — complete ✅ |
| Deps maintenance | taze+turbo (manual) + Renovate (auto PR every 2 weeks, no automerge) |

## Notes

- **Astro 6 / Starlight 0.39 upgrade**: Breaking change (Astro 5 → 6, legacy collections removed). Defer to dedicated upgrade task.

- **Renovate + taze setup**: Renovate (GitHub) auto-creates PRs every 2 weeks — no automerge, all manual review. taze+turbo is the portable fallback for non-GitHub hosts. See [`/thoughts/dependency-management.md`] for full guide.
