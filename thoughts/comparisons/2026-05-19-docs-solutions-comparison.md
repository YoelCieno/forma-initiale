# Docs Solutions Comparison for forma-initiale monorepo

**Date:** 2026-05-19
**Context:** Turborepo + bun + Vite 5 monorepo at `/data/sites/build-systems/forma-initiale`
**Current:** Vanilla Vite TS app at `apps/docs/` (create-turbo template)
**Goal:** Replace with proper docs solution that is framework-agnostic (Vue now, Angular + React later)

---

## Candidates

| # | Solution | Base | Dep |
|---|----------|------|-----|
| 1 | VitePress | Vite + Vue | needs `vue` |
| 2 | Docusaurus | Webpack + React | needs `react` + `react-dom` |
| 3 | Rspress v2 | Rsbuild/Rspack + React | needs `react` + `react-dom` |
| 4 | Astro + Starlight | Vite-based, UI-agnostic | no framework dep |

---

## Scoring matrix (1-5, 5=best)

| Criterion | Weight | VitePress | Docusaurus | Rspress | Astro/Starlight |
|-----------|--------|-----------|------------|---------|-----------------|
| Framework-agnostic | HIGH (×5) | 1 | 1 | 2 | **5** |
| Setup effort | HIGH (×5) | 4 | 3 | 4 | 4 |
| Search built-in | MED (×3) | 4 | 3 | 4 | **5** |
| Theming/customization | MED (×3) | 4 | 4 | 4 | **5** |
| Turborepo compat | MED (×3) | **5** | 3 | 4 | **5** |
| Performance | LOW (×1) | 4 | 3 | **5** | **5** |
| Plugin ecosystem | LOW (×1) | 3 | **5** | 3 | 4 |

### Weighted totals

| Candidate | Score | Rank |
|-----------|-------|------|
| **Astro + Starlight** | **99** | 🥇 |
| Rspress v2 | 74 | 🥈 |
| VitePress | 71 | 🥉 |
| Docusaurus | 58 | 4th |

---

## Detailed analysis

### 1. Framework agnosticism (weight: HIGH) — THE deciding factor

**VitePress (1/5):** Deeply Vue-bound. Each `.md` file compiles to a Vue SFC. Vue is a peer dependency. The entire theming API requires Vue. Even if you "just write markdown," the toolchain pulls in Vue and the template engine processes pages as Vue components.

**Docusaurus (1/5):** Equally React-bound. Requires `react` + `react-dom`. MDX pages use React JSX. Custom themes = React components. Docs site cannot exist without React.

**Rspress (2/5):** Claims framework agnosticism via Rsbuild plugins, but the docs theme and MDX engine are React-based. Can embed Vue/Svelte components through iframe-based preview (`@rspress/plugin-preview` with `previewMode: 'iframe'`), but the docs shell itself requires React 18+. Somewhat more flexible than Docusaurus but still React by default.

**Astro/Starlight (5/5):** Truly framework-agnostic. Astro is explicitly "UI-agnostic" by design. Starlight docs theme works with plain MD/MDX. Can embed Vue, React, Svelte, Solid, etc. components as "islands" in any page — useful for interactive examples. No framework dependency for the docs site itself. You choose when/if to pull in a framework.

### 2. Setup effort (weight: HIGH)

All four are relatively simple to set up. Key differences:

- **VitePress (4/5):** One config file, write markdown in `docs/`. But needs `vue` as dep. Fits well since monorepo already has Vite.
- **Docusaurus (3/5):** Most boilerplate. Webpack config surface. More opinionated structure. Doesn't share Vite toolchain.
- **Rspress (4/5):** Single `@rspress/core` package. Convention-based routing. Simple config.
- **Astro/Starlight (4/5):** Need `astro` + `@astrojs/starlight`. Content collections config is one file. Slightly more setup than VitePress but still minimal.

All need: remove old boilerplate, create config, write markdown, update `package.json` scripts.

### 3. Search built-in (weight: MED)

- **VitePress (4/5):** Local search via MiniSearch — zero config, works out of box. Good for small-to-medium docs. Algolia DocSearch available for larger.
- **Docusaurus (3/5):** Algolia DocSearch required for full-text search. Needs account, API keys, crawling setup. Not zero-config.
- **Rspress (4/5):** Built-in full-text search, zero config. Algolia plugin available.
- **Astro/Starlight (5/5):** **Pagefind built-in.** Zero config, client-side, privacy-friendly, works offline. Generates search index at build time. No external service needed. Also supports Algolia DocSearch plugin. Best out-of-box search experience.

### 4. Theming/customization (weight: MED)

- **VitePress (4/5):** Clean default theme. CSS variables for branding. Can extend with custom Vue components.
- **Docusaurus (4/5):** Infima CSS framework. Component swizzling. Powerful but complex.
- **Rspress (4/5):** V2 theme is polished. CSS variables, custom components. Good DX.
- **Astro/Starlight (5/5):** Highly customizable via Astro components. Tailwind CSS plugin. Framework-agnostic component embedding. Best flexibility for multi-framework monorepo.

### 5. Turborepo compatibility (weight: MED)

- **VitePress (5/5):** Outputs to `docs/.vitepress/dist`. Standard build script. Vite-native.
- **Docusaurus (3/5):** Outputs to `build/`. Webpack-based — doesn't share Vite toolchain.
- **Rspress (4/5):** Outputs to `doc_build/`. Rsbuild, separate toolchain.
- **Astro/Starlight (5/5):** Vite-based like the rest of the monorepo. Outputs to `dist/`. Some historical monorepo issues with Astro (2023) but all resolved in Astro 6 / current versions.

### 6. Performance (weight: LOW)

- **VitePress (4/5):** Fast (Vite). Rollup-based builds.
- **Docusaurus (3/5):** Slowest. Webpack. Heavy.
- **Rspress (5/5):** Fastest builds. Rust-based Rspack. `lazyCompilation` default.
- **Astro/Starlight (5/5):** Zero JS shipped by default. Fast builds (Vite). Partial hydration.

### 7. Plugin ecosystem (weight: LOW)

- **VitePress (3/5):** Reuses Vite plugins. Limited docs-specific plugins.
- **Docusaurus (5/5):** Largest ecosystem. Many official + community plugins.
- **Rspress (3/5):** Growing. Rsbuild/Rspack ecosystem.
- **Astro/Starlight (4/5):** Large Astro integration ecosystem (100+). Starlight-specific plugins (DocSearch, Tailwind, Markdoc).

---

## Recommendation

### 🥇 Astro + Starlight — adopt

**Why:** Framework agnosticism is the #1 requirement. Astro/Starlight is the only candidate that truly delivers this — no Vue, React, or any other framework dependency for the docs site. It scores highest or tied on every other criterion:

- Best built-in search (Pagefind, zero config)
- Most flexible theming
- Vite-native (matches existing toolchain)
- Future-proof for multi-framework monorepo (Vue + Angular + React)

### 🥈 Rspress v2 — backup option

If the team strongly prefers React (already planned for future apps), Rspress is faster than Docusaurus with a cleaner setup. But it still requires React 18+ as a dependency, which contradicts the "framework-agnostic" requirement for the docs layer.

### 🥉 VitePress — only if Vue-focused

If the monorepo were Vue-only, VitePress would be top choice (used by Vite, Vue, Vitest teams). But with Angular + React planned, it adds an unnecessary Vue dep to the docs site.

### ❌ Docusaurus — skip

Heaviest, slowest, most boilerplate. Only advantage is plugin ecosystem, which isn't important for basic docs.

---

## Migration effort: apps/docs → Astro/Starlight

**Estimated effort: Medium (2-4 hours)**

### Steps

1. **Remove old boilerplate**
   ```
   rm -rf apps/docs/index.html apps/docs/src/ apps/docs/.eslintrc.cjs
   # keep: package.json, tsconfig.json, .turbo/
   ```

2. **Install dependencies**
   ```
   cd apps/docs
   bun add astro @astrojs/starlight
   bun remove vite @repo/eslint-config   # old deps no longer needed
   ```

3. **Create `apps/docs/astro.config.mjs`**
   ```js
   import { defineConfig } from 'astro/config';
   import starlight from '@astrojs/starlight';

   export default defineConfig({
     integrations: [
       starlight({
         title: 'Forma Initiale Docs',
         social: { github: 'https://github.com/org/forma-initiale' },
         // sidebar auto-generated from content/docs/ structure
       }),
     ],
   });
   ```

4. **Create `apps/docs/src/content.config.ts`**
   ```ts
   import { defineCollection } from 'astro:content';
   import { docsLoader } from '@astrojs/starlight/loaders';
   import { docsSchema } from '@astrojs/starlight/schema';

   export const collections = {
     docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
   };
   ```

5. **Write initial docs**
   ```
   apps/docs/src/content/docs/index.md
   apps/docs/src/content/docs/getting-started.md
   apps/docs/src/content/docs/architecture.md
   ```

6. **Update `apps/docs/package.json` scripts**
   ```json
   {
     "scripts": {
       "dev": "astro dev",
       "build": "astro build",
       "preview": "astro preview"
     }
   }
   ```

7. **Update `turbo.json` outputs**
   ```json
   {
     "tasks": {
       "build": {
         "dependsOn": ["^build"],
         "inputs": ["$TURBO_DEFAULT$", ".env*"],
         "outputs": ["dist/**"]
       }
     }
   }
   ```

8. **Add search config** (optional — Pagefind is on by default in Starlight)

### Key changes from current setup

| Aspect | Before | After |
|--------|--------|-------|
| Framework | Vite + TS | Astro + Starlight |
| Content | `index.html` + `src/main.ts` | `src/content/docs/*.md` |
| Build output | Vite `dist/` | Astro `dist/` |
| Dev server | `vite --clearScreen false` | `astro dev` |
| Framework deps | none | none (added) |

### Risks

- **Low:** Astro content collections API changed between v4→v5 (Content Layer API). Currently at Astro 6 / Starlight latest — stable.
- **Low:** If future custom theme needs framework components (e.g., interactive React demo in docs), that adds a framework dep voluntarily, not by force.
- **None:** Turborepo caching — standard `dist/**` output glob works.
- **None:** Existing Vite apps in monorepo unaffected.

---

## Summary

| Factor | Verdict |
|--------|---------|
| Framework lock-in | None (Astro is UI-agnostic) |
| Time to first docs page | ~15 min |
| Search out of box | ✅ Pagefind (zero config) |
| Theming | ✅ Full Astro component + Tailwind |
| Turborepo cache | ✅ Works |
| Future-proof | ✅ Can embed Vue/React/Angular components when needed |

**Final call: Replace `apps/docs` vanilla Vite TS with Astro + Starlight.**
