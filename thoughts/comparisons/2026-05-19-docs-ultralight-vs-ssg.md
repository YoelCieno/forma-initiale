# Ultra-Light Docs Tools vs Astro/Starlight — for forma-initiale monorepo

**Date:** 2026-05-19
**Context:** Turborepo + bun + Vite 5 monorepo at `/data/sites/build-systems/forma-initiale`
**Current:** Vanilla Vite TS app at `apps/docs/` (create-turbo template)
**Requirement:** Framework-agnostic (Vue now, Angular + React later)
**Prompt from user:** "like Docsify" — zero-build, ultra-light alternatives

---

## 1. Tool Profiles

### Docsify

| Property | Value |
|----------|-------|
| **GitHub** | docsifyjs/docsify — **31.2K stars**, 5.8K forks |
| **Status** | Active. v5.0.0-rc.4 (Mar 2026). Last push May 2026. 180 contributors. |
| **Architecture** | Pure client-side SPA. Single `index.html` loads JS from CDN, fetches markdown files, renders in-browser. **No build step.** |
| **Payload** | ~21KB gzipped (JS + CSS) |
| **DX** | Create `index.html` + markdown files, deploy to any static host. Done. |
| **Search** | Plugin-based (full-text, client-side index using Dexie.js in v5) |
| **Themes** | Multiple built-in, CSS overrides, Vue component embedding |
| **i18n** | Supported via plugin |
| **SEO** | **Poor** — content rendered client-side. Crawlers may miss content. |
| **Performance** | Initial load fetches + renders all markdown via XHR. Slower on large doc sets. |
| **Plugin ecosystem** | Mature (search, GA, emoji, code copy, mermaid, pagination, etc.) |
| **Turborepo fit** | No build to cache. Just markdown files. `turbo.json` would have no `build` task for docs. |

**Strengths:** Zero setup, zero build, deploy anywhere, mature project with huge community (31K stars).
**Weaknesses:** No SEO, no static HTML, can't use Turbo caching, performance degrades with size.

### Docute

| Property | Value |
|----------|-------|
| **GitHub** | egoist/docute — **3.8K stars**, 414 forks |
| **Status** | **ARCHIVED** (Mar 2025). Last release v4.23.3 (Oct 2019). Last commit Sep 2023. **Dead project.** |
| **Architecture** | Same client-side SPA model as Docsify. Vue-based. CDN or npm install. |
| **Verdict** | **Do not use.** Archived, unmaintained, security risk. Included only because user mentioned it. |

### DocMD (@docmd/core)

| Property | Value |
|----------|-------|
| **GitHub** | docmd-io/docmd — **1.5K stars**, 87 forks |
| **Status** | **Very new, very active.** Created May 2025. v0.8.3 (May 2026). 64 releases in 1 year. 7.4K weekly npm downloads. |
| **Architecture** | **Hybrid SSG.** Builds static HTML at build time (SEO-friendly), then serves with SPA-style navigation client-side. Built on esbuild + Node.js. |
| **Payload** | ~18KB total (12KB JS + 6KB CSS) — claims 100 Lighthouse. |
| **DX** | `npx @docmd/core dev` — zero-config. Auto-detects markdown files, builds sidebar from folder structure, generates search index. |
| **Build speed** | ~340ms for 12 files, ~1.2s cold build |
| **Search** | Built-in offline full-text fuzzy search. Per-locale indexes. No external API. |
| **i18n** | Native, locale-first URLs, per-locale search indexes |
| **Versioning** | Native versioning (combined with i18n) |
| **SEO** | **Good** — static HTML generation with sitemap, canonical URLs, Open Graph |
| **Multi-project** | **Native multi-project support** (unique — interesting for monorepo) |
| **Plugins** | Built-in: search, seo, sitemap, git, analytics, llms.txt, mermaid, openapi. Optional: pwa, threads, math. |
| **Turborepo fit** | Has a build step — `docmd build` outputs to `./site/` — cacheable by Turbo. |

**Strengths:** Zero-config start, hybrid SSG (best of both worlds), native multi-project, built-in everything, tiny payload.
**Weaknesses:** Very young project (1 year old), small community, risk of abandonment, API may change before 1.0.

### Astro + Starlight

| Property | Value |
|----------|-------|
| **GitHub** | withastro/starlight — **8.4K stars** (Astro: 60K+) |
| **Status** | Active. v0.38.0 (Mar 2026) supports Astro 6. Rapid development. |
| **Architecture** | **Full SSG** with Astro Islands architecture. Pre-builds static HTML, zero JS by default. Interactive components hydrate independently. |
| **Payload** | ~50KB initial (but zero JS for 95% of docs pages) |
| **DX** | `pnpm create astro --template starlight` or manual setup in existing Astro project. |
| **Build speed** | ~4s for 100 pages (Rust-based tooling underneath) |
| **Search** | **Built-in Pagefind** — offline, WASM-based, generates index at build time. Best-in-class. |
| **i18n** | **Built-in** with locale-first URLs — one of the most complete i18n systems |
| **Versioning** | Plugin (`starlight-versions`) or branch-based — not built-in |
| **SEO** | **Excellent** — static HTML, sitemap, canonical, Open Graph, structured data, zero JS |
| **Framework-agnostic** | **Yes** — use React, Vue, Svelte, Solid, Lit components via Islands |
| **Theming** | Component overrides, CSS custom properties, expressive code blocks (best-in-class) |
| **MDX** | Native support with custom components |
| **Ecosystem** | Growing rapidly, official plugins (OpenAPI, Tailwind, etc.) |
| **Turborepo fit** | Build step cacheable by Turbo — `astro build` outputs to `dist/` |

**Strengths:** Best SEO, best search (Pagefind), zero-JS output, framework-agnostic, mature Astro ecosystem, fast builds.
**Weaknesses:** Heavier setup (~30min), needs Astro project dependency, versioning not built-in (plugin-only), larger dependency tree.

---

## 2. Direct Feature Comparison

| Dimension | Docsify | DocMD | Astro/Starlight |
|-----------|---------|-------|-----------------|
| **Build step** | None | Yes (~1.2s) | Yes (~4s per 100p) |
| **Output** | Client-rendered SPA | Static HTML + SPA JS | Static HTML, zero JS |
| **Setup time** | 2 min | 1 min | ~30 min |
| **Config required** | None (single HTML) | Zero (auto-detect) | `astro.config.mjs` + content collections |
| **Framework dep** | None (vanilla JS) | None (vanilla output) | None (Astro, UI-agnostic) |
| **Total payload** | ~21KB gzipped | ~18KB total | ~50KB (0KB JS on doc pages) |
| **SEO** | Poor | Good | Excellent |
| **Search quality** | Decent (plugin, degrades) | Good (fuse.js) | Excellent (Pagefind WASM) |
| **i18n** | Plugin | Native | Native (best-in-class) |
| **Versioning** | Manual | Native | Plugin / branch |
| **Multi-project** | Manual | Native | Manual |
| **MDX / custom components** | No (Vue only) | Limited | MDX + any framework |
| **Theming** | CSS overrides | Limited themes | Component overrides |
| **Code highlighting** | Plugin | Built-in | Expressive Code (best) |
| **Mermaid diagrams** | Plugin | Built-in | Plugin |
| **Stars** | 31.2K | 1.5K | 8.4K |
| **Project age** | ~9 years | ~1 year | ~3 years |
| **Abandonment risk** | Low | Medium-High | Low (Astro team) |
| **Turbo cacheable** | No | Yes (`site/`) | Yes (`dist/`) |
| **Dependencies** | CDN (0 deps) | 19 deps | Large (Astro + deps) |

---

## 3. KISSME Analysis: Simplicity Over the Lifetime

KISSME = Keep It Simple, Simon — but "simple" over the full lifecycle, not just day 1.

### 1-Week Cost

| Activity | Docsify | DocMD | Starlight |
|----------|---------|-------|-----------|
| Setup & first page | 2 min | 1 min | 30 min |
| Sidebar nav | Manual in HTML | Auto-generated | Auto from file tree |
| Search working | Install plugin, config | Built-in, instant | Built-in, instant |
| Theming | Pick theme, CSS tweaks | Pick theme | Default is excellent |
| First 5 pages | 15 min | 10 min | 45 min (incl setup) |
| Deploy | Drag folder to Netlify | `docmd build` -> deploy | `astro build` -> deploy |

**Winner (week 1): DocMD** — setup in 1 min, auto-everything, near-instant build.

Starlight loses at week 1 purely due to setup overhead. But once that's paid, the gap shrinks.

### 1-Year Cost

| Activity | Docsify | DocMD | Starlight |
|----------|---------|-------|-----------|
| 50+ pages | Degrades (all fetched) | ~3s build | ~4s build |
| SEO fixes | Impossible (client-render) | Already good | Already excellent |
| Search quality | Degrades with size | Stable (index) | Stable (WASM index) |
| Add i18n (French) | Plugin, manual URLs | Config array | Built-in, auto-detect |
| Version docs (v1, v2) | Manual subdirs | Built-in toggle | Plugin or branch |
| Custom component | Can't (JS-only) | Custom JS/CSS | Vue/React/Svelte comp |
| Performance over time | Degrades linearly | Stable (pre-built) | Stable (pre-built) |
| Dep updates | CDN bump version | `npm update` | `npm update` (bigger) |
| Team onboarding | Show markdown + HTML | Show `docmd dev` | Teach Astro basics |
| Google indexing | Won't happen | Happens | Happens well |
| Lighthouse | ~85 (JS-dependent) | ~100 | ~100 |

**Winner (year 1): Astro/Starlight** — search quality, SEO, i18n, custom components, all scale.

DocMD is competitive at year 1 *if it survives*. Risk: 1-year-old project, small community, no major backer.

Docsify loses hard at year 1. No SEO means your public docs are invisible to search. That's a dealbreaker.

---

## 4. The Critical Tradeoff: Zero-Build vs Feature Completeness

The user wants "like Docsify" — zero-build simplicity. Honest accounting:

### What zero-build costs you:

1. **SEO = invisible.** Docsify content is client-rendered. Google may index some JS-rendered content now, but it's unreliable and slow. Your docs might as well not exist for search.
2. **Performance degrades.** Every page visit fetches ALL markdown via XHR. 5MB doc set = seconds before content appears.
3. **Search degrades.** Docsify's search indexes client-side. 100+ pages = noticeable index download + parse latency.
4. **No Turbo caching.** Turborepo caches build outputs. If there's no build, Turbo adds zero value for docs.
5. **No versioning, no i18n.** Both are manual hacks. You'll reinvent wheels poorly.
6. **No custom components.** Want an interactive API playground? A live code editor? Docsify can't do it (well). Starlight can use React/Vue components.

### What zero-build gives you:

1. **Truly instant setup.** `index.html` + `README.md` = docs site. 2 minutes flat.
2. **No CI build step.** Push markdown -> deploy. No build pipeline needed.
3. **Edit on GitHub, see instantly.** No rebuild needed for content changes.
4. **Zero npm deps in production.** Docsify loads from CDN. Nothing to maintain.

### Honest verdict:

| Use case | Best tool | Why |
|----------|-----------|-----|
| Internal wiki / project README | **Docsify** | SEO irrelevant, 2 min setup, just works |
| Public docs for a product/platform | **Astro/Starlight** | SEO mandatory, search quality, i18n, components |
| Want zero-config but need SEO | **DocMD** | Hybrid SSG, best of both, but risky (young project) |
| Need multi-project versioned docs | **DocMD** | Only tool with native multi-project support |

---

## 5. Recommendation

### For forma-initiale (public docs, framework-agnostic monorepo):

**First choice: Astro/Starlight**

Why this beats both ultra-light options for this specific project:

1. **Framework-agnostic by design.** Vue now, but Angular + React later. Starlight supports all three via Islands. Docsify/DocMD don't offer custom components at all.
2. **SEO is non-negotiable.** forma-initiale is a public build system. Users will search for it. Docsify gives zero SEO. Starlight gives excellent SEO.
3. **Pagefind search** is best-in-class, offline, no API key, no ongoing cost. Docsify's search degrades. DocMD's is decent but not Pagefind-level.
4. **Turbo caching works.** `astro build` -> `dist/` -> cached by Turbo. The build output changes only when content changes.
5. **i18n is built-in.** When you need multi-language docs (and you will for a build tool), it's there and complete.
6. **Zero JS on doc pages.** Users on slow connections get instant content. Docsify requires JS to show anything.
7. **Mature ecosystem.** Astro has 60K stars, Starlight has the Astro team. This is not going anywhere.

**Second choice: DocMD**

If setup simplicity trumps everything and you accept the risk:

- Hybrid SSG gives you SEO + SPA feel
- Native multi-project support is genuinely compelling for monorepo
- But: 1 year old, 1.5K stars, API not stable, small ecosystem
- Worth revisiting at v1.0

**Not recommended for this project:**

- **Docsify** — internal wikis only. forma-initiale needs public docs.
- **Docute** — archived and dead.

### Migration path (from `apps/docs/` Vite app -> Starlight):

1. `cd apps && mkdir docs-starlight && cd docs-starlight`
2. `bun create astro --template starlight`
3. Move markdown content into `src/content/docs/`
4. Add to `turbo.json`: `"build": { "dependsOn": ["^build"], "outputs": ["dist/**"] }`
5. Add to root `package.json` workspaces: `"apps/docs-starlight"`
6. Remove old `apps/docs/` Vite app (or keep for transition)
7. Deploy output from `apps/docs-starlight/dist/`

---

## 6. Quick Reference Matrix

```
             Setup   SEO   Search  i18n   Ver   Multi   Turbo   Stable
Docsify      2 min   Poor  Decent  Plug   No    No      No      Yes (9yr)
DocMD        1 min   Good  Good    Yes    Yes   Yes     Yes     Risk (1yr)
Starlight   30 min   Exc   Exc     Yes    Plug  No      Yes     Yes (3yr)
Docute       DEAD — archived March 2025, last release 2019, do not use
```

---

*Written 2026-05-19 for forma-initiale decision-making.*
