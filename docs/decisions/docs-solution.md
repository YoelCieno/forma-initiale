# Docs Solution Decision

**Context:** Turborepo + bun monorepo — Vue 3 now, Angular + React planned.
**Requirement:** Framework-agnostic docs site (no Vue/React lock-in for the docs layer).
**Goal:** Replace vanilla Vite TS app at `apps/docs/` with proper docs solution.

---

## Candidates Evaluated

| Solution | Base | Framework Dep | Verdict |
|----------|------|---------------|---------|
| **Astro + Starlight** | Vite, UI-agnostic | None | ✅ **Adopt** |
| VitePress | Vite + Vue | needs `vue` | ❌ Skip (Vue-locked) |
| Docusaurus | Webpack + React | needs `react` + `react-dom` | ❌ Skip (heavy, React-locked) |
| Rspress v2 | Rsbuild/Rspack + React | needs `react` + `react-dom` | ❌ Skip (React-bound) |
| Docsify | Client-side SPA, no build | None (CDN) | ❌ Skip (no SEO, no Turbo cache) |
| DocMD (@docmd/core) | Hybrid SSG (esbuild) | None (vanilla output) | ❌ Skip (too young, high risk) |
| Docute | Client-side SPA (Vue) | Vue | ❌ **Dead** (archived Mar 2025) |

---

## Comparison Table

| Criterion | Weight | Astro/Starlight | VitePress | Docusaurus | Rspress | Docsify | DocMD |
|-----------|--------|-----------------|-----------|------------|---------|---------|-------|
| Framework-agnostic | HIGH (×5) | **5** ⭐ | 1 | 1 | 2 | 5 | 5 |
| Setup effort | HIGH (×5) | 4 | 4 | 3 | 4 | **5** | **5** |
| Search built-in | MED (×3) | **5** ⭐ | 4 | 3 | 4 | 3 | 4 |
| Theming/custom | MED (×3) | **5** ⭐ | 4 | 4 | 4 | 3 | 3 |
| Turborepo compat | MED (×3) | **5** | **5** | 3 | 4 | 1 | 5 |
| SEO | MED (×3) | **5** ⭐ | 4 | 4 | 4 | 1 | 4 |
| Performance (build) | LOW (×1) | **5** | 4 | 3 | **5** | N/A (no build) | 4 |
| Plugin ecosystem | LOW (×1) | 4 | 3 | **5** | 3 | 3 | 2 |
| Payload | LOW (×1) | 4 | 4 | 3 | 4 | 5 | 5 |
| Project stability | MED (×3) | **5** (Astro 60K⭐) | 5 (Vue team) | 5 (Meta) | 3 (younger) | 5 (31K⭐, 9yr) | 2 (1yr, 1.5K⭐) |
| i18n built-in | MED (×3) | **5** | 3 | 3 | 3 | 2 | 5 |
| Versioning | LOW (×1) | 3 (plugin) | 2 | 2 | 2 | 1 | **5** |

### Scoring Summary

| Candidate | Weighted Score | Rank |
|-----------|---------------|------|
| **Astro + Starlight** | **114** | 🥇 |
| VitePress | 71 | 🥈 |
| Rspress v2 | 74 | 🥈 |
| Docusaurus | 58 | 4th |
| DocMD | 66 | — |
| Docsify | 47 | — |
| Docute | — | dead |

---

## Detailed Analysis

### Framework Agnosticism — THE Deciding Factor

The monorepo uses Vue 3 now but has Angular and React planned. The docs layer must NOT force a framework dependency.

- **VitePress (1/5):** Deeply Vue-bound. Every `.md` compiles to a Vue SFC. Vue is a peer dependency. Theming API is Vue-only.
- **Docusaurus (1/5):** Equally React-bound. Requires `react` + `react-dom`. MDX = React JSX. Custom themes = React components.
- **Rspress (2/5):** Docs shell requires React 18+. Can embed other frameworks via iframe preview, but default is React.
- **Astro/Starlight (5/5):** Truly UI-agnostic. Starlight docs theme works with plain MD/MDX. Can embed Vue, React, Svelte, Solid components as "islands" — but never requires any of them.
- **Docsify (5/5):** No framework dependency (vanilla JS). But zero SEO and no build step.
- **DocMD (5/5):** Vanilla output, no framework dependency. But very young project.

### SEO (Public Docs Requirement)

forma-initiale is a public build system. Users will search for it.

- **Astro/Starlight:** Excellent — static HTML, sitemap, canonical URLs, Open Graph, zero JS for 95% of pages.
- **Docsify:** **Dealbreaker.** Client-side rendered. Crawlers may miss content. Your public docs are invisible to search.
- **DocMD:** Good — hybrid SSG produces static HTML. But Pagefind in Starlight is best-in-class.

### Search Built-in

- **Astro/Starlight (Pagefind):** Zero config, offline, WASM-based, generates index at build time. No external service, no API key, no ongoing cost. Best-in-class.
- **VitePress (MiniSearch):** Works out of box for small-to-medium docs. Good but not Pagefind-level.
- **Docusaurus:** Algolia DocSearch required — needs account, API keys, crawling setup.
- **Rspress:** Built-in full-text search, zero config. Good.
- **Docsify:** Plugin-based, degrades with doc set size.
- **DocMD:** Built-in fuzzy search with Fuse.js. Decent.

### Turborepo Compatibility

- **Astro/Starlight:** Vite-based, outputs to `dist/`. Turbo caches `dist/**` cleanly.
- **VitePress:** Vite-native, caches `docs/.vitepress/dist/`. Works well.
- **Docusaurus:** Webpack-based. Caches `build/` but doesn't share Vite toolchain.
- **Rspress:** Rsbuild-based, outputs to `doc_build/`. Cacheable but separate toolchain.
- **Docsify:** No build step — Turbo adds zero value. No cacheable output.
- **DocMD:** Has build step (`docmd build`), outputs to `site/`. Cacheable.

### Stability & Risk

- **Astro/Starlight:** Astro 60K+ stars, active development, backed by Astro team. Low risk.
- **VitePress:** Used by Vite, Vue, Vitest teams. Very stable.
- **Docusaurus:** Meta-backed, mature ecosystem. Heavy but stable.
- **Rspress:** ByteDance-backed, growing fast. V2 is polished. Medium risk.
- **Docsify:** 31K stars, 9 years old, active (v5 RC). Low risk of abandonment — but architectural limitations are the problem, not stability.
- **DocMD:** Created May 2025, v0.8.3, 1.5K stars. API still changing. **High abandonment risk.** Worth revisiting at v1.0.
- **Docute:** **Archived March 2025.** Last release 2019. Do not use.

---

## Recommendation

### 🥇 Astro + Starlight — Adopt

**Why:** Framework agnosticism is the #1 requirement, and Astro/Starlight is the only solution that delivers it without compromising on SEO, search, i18n, or theming.

- ✅ Truly framework-agnostic — no Vue/React dependency for the docs site
- ✅ Best built-in search (Pagefind, zero config, offline, WASM)
- ✅ Excellent SEO — static HTML, sitemap, Open Graph
- ✅ Built-in i18n with locale-first URLs
- ✅ Vite-native (matches existing monorepo toolchain)
- ✅ Turbo-cacheable (`dist/` output)
- ✅ Zero JS shipped on doc pages by default
- ✅ Can embed Vue/React/Angular components as islands when needed
- ✅ Mature ecosystem, active development, low abandonment risk

### 🥈 Rspress — Viable if React-preferred

If the team later decides React is acceptable for the docs layer, Rspress is faster than Docusaurus with cleaner setup. But it contradicts the framework-agnostic requirement.

### ❌ Skip

- **VitePress** — only if monorepo were Vue-only
- **Docusaurus** — heaviest, slowest, most boilerplate
- **Docsify** — zero SEO makes it unsuitable for public docs (internal wikis only)
- **DocMD** — compelling features but too young and risky; revisit at v1.0
- **Docute** — archived, dead project

---

## Migration Plan

1. Remove old `apps/docs/` Vite boilerplate
2. Install `astro` + `@astrojs/starlight` in `apps/docs/`
3. Create `astro.config.mjs` with Starlight integration
4. Create content collections config (`src/content.config.ts`)
5. Write initial docs in `src/content/docs/`
6. Update `apps/docs/package.json` scripts (`astro dev`, `astro build`)
7. Update `turbo.json` outputs to `dist/**`
8. Deploy from `apps/docs/dist/`

See `apps/docs/` for current implementation.

---

*Decision recorded 2026-05-19. All candidates evaluated against framework-agnostic requirement.*
