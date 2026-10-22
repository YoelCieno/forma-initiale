# AWESOME-WC + JSON RENDER RESEARCH

**Date:** 2026-05-23
**Context:** forma-initiale monorepo (Turborepo + bun, Vue 3 now, Angular + React planned)
**Goal:** Find cross-framework WC libs not yet evaluated; analyze JSON Render; compare vs Web Awesome

---

## 1. NEW CANDIDATES FROM AWESOME-WEB-COMPONENTS

Source: https://github.com/web-padawan/awesome-web-components (Component Libraries section ~50 entries)

### Filter Criteria

- Production-ready (not alpha/archived)
- Unstyled or customizable (not tied to a specific design system)
- Works across Vue 3 + Angular + React (Web Components)
- General-purpose UI components (not niche/domain-specific)

### Viable Candidates Found

| Library             | Stars | Last Release         | Framework Support                           | Unstyled?              | Components | Notes                                         |
| ------------------- | ----- | -------------------- | ------------------------------------------- | ---------------------- | ---------- | --------------------------------------------- |
| **AgnosticUI**      | 809   | Active (v2, ongoing) | React, Vue, Svelte, Lit (CLI copies source) | Yes (CSS custom props) | ~55        | **STRONG CANDIDATE**                          |
| **Elix**            | 836   | v15.0.1 (Nov 2021)   | Any (plain WC)                              | Yes (minimalist)       | ~30        | **DEAD** — no release since 2021              |
| **Ignite UI WC**    | 167   | v7.1.3 (Apr 2026)    | Any (WC)                                    | No (themed)            | 60+        | Enterprise; advanced grids commercial; styled |
| **AnywhereUI**      | 39    | v0.3.0 (Feb 2023)    | React, Vue, Angular                         | No (themed)            | Unknown    | **DEAD/ALPHA** — v0.x, last release 2023      |
| **Dile Components** | ~150  | Active               | Any (WC)                                    | Partial                | ~20        | Niche, small community                        |
| **Blaze UI Atoms**  | ~200  | Stale                | Any (WC)                                    | No (CSS framework)     | ~15        | Tied to Blaze CSS                             |

### Eliminated (Reasons)

| Library                 | Why Not                                        |
| ----------------------- | ---------------------------------------------- |
| AMP                     | Not a general UI lib — page framework          |
| Apollo Elements         | GraphQL-specific only                          |
| AXA Pattern Library     | Company-specific design                        |
| Blackstone UI           | Publisher-specific                             |
| Brightspace UI          | LMS-specific                                   |
| Burnish Components      | MCP-tool-output-specific                       |
| Clever Components       | Cloud-platform-specific                        |
| Curvenote               | Scientific articles only                       |
| DataFormsJS             | SPA router/data display                        |
| elements-sk             | Google-internal style                          |
| github-elements         | GitHub-specific                                |
| Furo                    | Eclipse-specific                               |
| Fusion Web Components   | Equinor-specific                               |
| Joomla UI               | Joomla CMS-specific                            |
| Ketch.UP                | SME.UP-specific                                |
| LRNWebComponents        | LMS-specific                                   |
| Medblocks UI            | Healthcare-specific                            |
| Microsoft Graph Toolkit | MS Graph-specific                              |
| Nightingale             | Life sciences viz                              |
| Nuxeo Elements          | Nuxeo CMS-specific                             |
| One Platform Components | Red Hat-specific                               |
| Pixano Elements         | Data annotation                                |
| Playground Elements     | Code playgrounds                               |
| Smart Web Components    | Commercial, enterprise                         |
| Tradeshift Elements     | Tradeshift-specific                            |
| Umbraco UI              | Umbraco CMS-specific                           |
| Vaadin                  | Already evaluated                              |
| Wired Elements          | Hand-drawn sketchy style only                  |
| Shoelace                | Already evaluated (predecessor of Web Awesome) |

### Design Systems Section (also in awesome-wc)

Many design systems were already evaluated (FAST, Material Web, Spectrum, Fluent UI, Carbon, etc.). These are design-system-tied, not unstyled.

---

## 2. STRONG ALTERNATIVES TO WEB AWESOME

### AgnosticUI — The Only Strong New Contender

**Why it stands out:**

1. **Source-first architecture** — CLI copies component source into your project (not hidden in node_modules). Files land in `src/components/ag/`. You own the code.

2. **Framework-native output** — CLI generates `.vue`, `.tsx`, `.svelte` files directly. No wrapper/indirection layer. Works natively with each framework's tooling.

3. **55 components** — Comparable to Web Awesome (50+). Includes Accordion, Button, Card, Checkbox, Dialog, Drawer, Input, Select, Table, Tabs, Toast, Tooltip, etc.

4. **CSS custom property theming** — Skin system via CSS vars. Swap entire theme with one CSS import. Multiple pre-built skins included (light, dark, brutalist).

5. **AI/agent-ready** — Built for LLM context. "AG Context Generator" outputs exact prop types/imports for AI tools. Playbooks for login, onboarding, dashboard.

6. **Apache 2.0** — Permissive license.

7. **Accessibility-first** — WAI-ARIA, keyboard nav, AA contrast, reduced motion.

**Drawbacks vs Web Awesome:**

- Smaller community (809 stars vs 13k+ for Shoelace/Web Awesome)
- Newer project (v2 rewrite)
- No Angular bindings yet (React, Vue, Svelte, Lit only)
- Less battle-tested
- No Angular support yet (planned?)
- Component source in your repo = more maintenance surface

---

## 3. JSON RENDER ANALYSIS

### What Is JSON Render?

**Category:** Generative UI Framework (NOT a component library)
**Author:** Vercel Labs
**GitHub:** https://github.com/vercel-labs/json-render
**Website:** https://json-render.dev
**License:** Apache 2.0
**First published:** Jan 14, 2026
**Latest version:** 0.19.0 (May 7, 2026)
**Weekly downloads (core):** 412K

### Architecture

```
User Prompt → AI → JSON Spec (constrained by catalog) → Renderer → UI
```

Key components:

- **@json-render/core** — Schemas, catalogs, AI prompts, stream utilities
- **@json-render/react** — React renderer (peer: react ^19.2)
- **@json-render/vue** — Vue 3 renderer (peer: vue ^3.5)
- **@json-render/svelte** — Svelte 5 renderer
- **@json-render/solid** — SolidJS renderer
- **@json-render/shadcn** — 36 pre-built shadcn/ui components
- **@json-render/next** — Full Next.js app generation

### Key Facts

1. **Cross-framework support:** YES — React, Vue 3, Svelte 5, SolidJS. Angular NOT supported.
2. **Production-ready:** NO — still v0.x (0.19.0), very young (5 months old)
3. **It's an AI UI generation framework** — you define a component catalog, AI generates JSON specs, renderer turns them into UI. Not a traditional component library you manually compose.
4. **36 pre-built components** via @json-render/shadcn (based on Radix UI + Tailwind)
5. **Streaming support** — renders progressively as JSON streams from LLM
6. **Data binding** — $state, $bindState, $item, $index
7. **Code export** — can export generated UI as standalone React code

### Can It Replace Web Awesome?

**No.** Different category entirely.

| Aspect          | Web Awesome                 | JSON Render                |
| --------------- | --------------------------- | -------------------------- |
| Type            | Component library           | AI UI generation framework |
| Use case        | Hand-crafted UI             | AI-generated dynamic UI    |
| Maturity        | Stable (Shoelace evolution) | v0.19, 5 months old        |
| Angular         | Works (WC)                  | Not supported              |
| Component count | 50+                         | 36 (shadcn) + custom       |
| Styling         | Default styles + CSS props  | Tailwind/shadcn            |
| Control         | Full developer control      | AI generates from prompt   |

### Could It Complement?

Potentially, for AI-powered admin panels or dashboards where you want LLM-generated UIs. But for the core shared component library, it's not a replacement.

---

## 4. COMPARISON TABLE — ALL VIABLE CANDIDATES

| Feature             | **Web Awesome**   | **AgnosticUI**          | **Lion**      | **FAST**             | **Material Web** | **Vaadin**          |
| ------------------- | ----------------- | ----------------------- | ------------- | -------------------- | ---------------- | ------------------- |
| **Stars**           | ~13k              | 809                     | ~1.8k         | ~9k                  | ~7k              | ~1.5k               |
| **Maturity**        | Mature            | Young (v2)              | Mature        | Mature (deprecated?) | Mature           | Mature              |
| **React**           | ✅ (WC)           | ✅ (native .tsx)        | ✅ (WC)       | ✅ (WC)              | ✅ (WC)          | ✅ (WC)             |
| **Vue 3**           | ✅ (WC)           | ✅ (native .vue)        | ✅ (WC)       | ✅ (WC)              | ✅ (WC)          | ✅ (WC)             |
| **Angular**         | ✅ (WC)           | ❌ (not yet)            | ✅ (WC)       | ✅ (WC)              | ✅ (WC)          | ✅ (WC)             |
| **Unstyled**        | ❌ (has defaults) | ✅ (CSS props)          | ✅            | ❌ (Fast design)     | ❌ (Material)    | ❌ (default styles) |
| **Component count** | 50+               | 55                      | ~40           | ~30                  | ~30              | ~30                 |
| **License**         | MIT (core)        | Apache 2.0              | MIT           | MIT                  | MIT              | Apache 2.0          |
| **Accessibility**   | ✅                | ✅                      | ✅            | ✅                   | ✅               | ✅                  |
| **Bundle size**     | Medium            | Small (per component)   | Medium        | Medium               | Large            | Medium              |
| **Build tool**      | Custom            | Lit-based               | Lit-based     | FAST Element         | Lit-based        | Lit-based           |
| **Theming**         | CSS props + parts | CSS props (skin system) | CSS props     | CSS props            | MDC tokens       | CSS props           |
| **Form support**    | ✅                | ✅                      | ✅            | ✅                   | ✅               | ✅                  |
| **Community**       | Large             | Small                   | Medium        | Large (MS)           | Large (Google)   | Medium              |
| **Angular support** | ✅ (WC)           | ❌                      | ✅ (WC)       | ✅ (WC)              | ✅ (WC)          | ✅ (WC)             |
| **Last release**    | Active (2026)     | Active (2026)           | Active (2026) | Stale (2023)         | Active (2026)    | Active (2026)       |

### Also Consider (Already Evaluated)

| Library          | Verdict                         |
| ---------------- | ------------------------------- |
| Spectrum (Adobe) | ❌ Design-system-tied, heavy    |
| PrimeTek         | ❌ Themed, commercial tier      |
| Headless UI      | ❌ React-only                   |
| Reka UI          | ❌ React/Vue only (no Angular)  |
| Ark UI           | ❌ React/Vue/Solid (no Angular) |
| Ariakit          | ❌ React-only                   |
| Elix             | ❌ Dead (last release Nov 2021) |

---

## 5. UPDATED RECOMMENDATION

### Primary: **Web Awesome** (still best overall)

**Why:** Works in all 3 frameworks (Vue 3, Angular, React) via WC interop. 50+ components. Largest community. MIT core. Actively maintained.

### Secondary Watch: **AgnosticUI**

**Why interesting:**

- Source-first architecture is genuinely novel for a WC lib
- Framework-native Vue/React/Svelte output (no wrapper overhead)
- Great for AI/agent-driven dev (which matches our LLM-heavy workflow)
- Strong theming via CSS custom properties

**Why not primary today:**

- No Angular support (planned for forma-initiale)
- Small community (809 stars)
- Young project (v2 rewrite)
- Less battle-tested

### Recommendation

**Go with Web Awesome** for cross-framework shared UI. Monitor AgnosticUI for Angular support and maturity. If AgnosticUI adds Angular bindings and matures in 6-12 months, it becomes a strong competitor (source-first approach is compelling for our monorepo patterns).

### JSON Render Verdict

**Not relevant** for the cross-framework component library decision. Different category (AI UI generation). Would only be considered if we build AI-powered dynamic UI features. Even then, it's too young (v0.x) and lacks Angular support.

---

## APPENDIX: Research Sources

- awesome-web-components: https://github.com/web-padawan/awesome-web-components
- AgnosticUI: https://github.com/AgnosticUI/agnosticui / https://agnosticui.com
- Elix: https://github.com/elix/elix / https://component.kitchen/elix
- Ignite UI WC: https://github.com/IgniteUI/igniteui-webcomponents
- AnywhereUI: https://github.com/adaleks/anywhere-ui
- JSON Render: https://json-render.dev / https://github.com/vercel-labs/json-render
- @json-render/vue: https://npmx.dev/package/@json-render/vue
