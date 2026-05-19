# Phase 1 — Docs & UI Layer

**Status:** 🔍 RESEARCH

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
- [ ] Replace `apps/docs` with Astro + Starlight
- [ ] Audit `packages/ui/` — ensure zero framework deps
- [ ] Create composables layer (`apps/web-vue/src/composables/`) if needed
- [ ] Verify build + lint passes

## Decisions

| Decision | Choice |
|----------|--------|
| Docs framework | Astro + Starlight ✅ |
| packages/ui paradigm | Framework‑agnostic (vanilla TS) |
