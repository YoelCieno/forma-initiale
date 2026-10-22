# UI Wrapper Strategy Comparison

**Date:** 2026-05-24
**Topic:** Web component wrapper strategy for `packages/ui` in forma-initiale monorepo

## Research Question

What is the optimal strategy for managing UI wrappers inside `packages/ui` given:

- Must remain framework-agnostic (no Vue/React/Angular imports)
- Currently wraps `@awesome.me/webawesome` v3.7.0 (Lit-based web component library)
- Target apps: Vue 3 (active), future Angular/React
- Turborepo + bun monorepo
- WA components used directly in Vue templates as `<wa-button>`, etc.
- Architecture: Hexagonal, `packages/ui` is the framework-agnostic presentation layer

## Options Considered

### Option A: Keep Current Thin Wrappers (Status Quo)

- packages/ui just re-exports WA types + side-effect imports
- Example: `button.ts` imports WA button, re-exports type
- Apps use WA components directly in templates

### Option B: Lit (Google-backed, industry standard)

- WA itself built on Lit (`lit: ^3.2.1` dependency in WA)
- Class-based or decorator-based web components
- 5 KB min+gzip
- https://lit.dev

### Option C: Stencil (Compiler-based, Ionic team)

- Compiles TSX/JSX to vanilla WC, zero runtime
- Framework output targets (React, Vue, Angular wrappers generated automatically)
- Heavier tooling, build step
- https://stenciljs.com

### Option D: Atomico (Functional, React-like hooks)

- Functions + hooks + virtual-dom
- 1.3k stars, 2-5 KB
- TSX syntax, similar to React
- https://github.com/atomicojs/atomico

### Option E: Hybrids (Functional, plain objects)

- Plain objects + pure functions
- Built-in store, router, layout engine
- 3.2k stars, mature v9
- Unique declarative/functional architecture
- https://github.com/hybridsjs/hybrids

### Option F: Haunted (React hooks for WC)

- React hooks API for WC, uses lit-html
- 2.7k stars, BSD-2-Clause
- https://github.com/matthewp/haunted

### Option G: Elemento (Experimental, Lit + Preact Signals)

- Functional components with Lit templating + Preact Signals
- 7 stars, experimental
- https://github.com/dsolimando/elemento

### Option H: Uhtml (Micro template renderer)

- Template literal HTML/SVG renderer
- 1-2 KB, no component model
- 1.1k stars
- https://github.com/WebReflection/uhtml

### Option I: Raw Custom Elements (Vanilla)

- Use native `customElements.define()` + `HTMLElement` directly
- Zero dependencies
- Manual lifecycle, property, attribute management

## Resource Analysis

### Web Awesome (Current Dependency)

- **Official docs:** https://webawesome.com/docs/ — comprehensive, includes Vue/React/Angular/Svelte framework guides
- **Built with:** Lit v3.2.1 (confirmed in node_modules package.json)
- **License:** MIT
- **GitHub:** https://github.com/shoelace-style/webawesome (formerly Shoelace)
- **Vue integration:** Works directly as custom elements; Vue has built-in WC support since v3
- **Type support:** Ships Vue types at `dist/types/vue/index.d.ts`, React types at `dist/react/`
- **Framework wrappers:** Has `dist/react/` wrapper generation, does NOT ship Vue wrappers (Vue uses native WC support)
- **Current project usage:** Thin re-exports in packages/ui for type safety + registration side-effect

### Lit

- **Official docs:** https://lit.dev/docs/ — excellent, comprehensive
- **Version:** v3 (current), Google-backed, OpenJS Foundation
- **Size:** ~5 KB min+gzip
- **Community:** Largest WC library, used by Adobe Spectrum, Material Web, WA itself
- **TS support:** First-class decorators, reactive properties
- **SSR:** Lab stage support
- **GitHub stars:** ~19k
- **Benchmark:** https://web-components-benchmark.netlify.app/ — competitive performance

### Stencil

- **Official docs:** https://stenciljs.com/docs/introduction — good
- **Version:** v4.43 (current)
- **Size:** Zero runtime (compiler only), ~5 KB compiled output per component
- **Key feature:** Framework output targets (auto-generate React/Vue/Angular wrappers)
- **Used by:** Ionic, many enterprise design systems
- **GitHub stars:** ~12k
- **Build step:** Requires `stencil build` compilation
- **TSX:** Components written in TSX

### Atomico

- **Official docs:** https://atomico.gitbook.io/doc/ — available
- **Version:** v2.1.0 (released Apr 2026)
- **Size:** 2-5 KB
- **Architecture:** Functions + hooks + virtual-dom, React-like
- **GitHub stars:** 1.3k
- **TS support:** Yes, fully type-friendly
- **Community:** Small but active, Discord available
- **SSR:** Not documented

### Hybrids

- **Official docs:** https://hybrids.js.org/ — well-organized
- **Version:** v9.1.22 (Jan 2026)
- **Size:** ~10 KB
- **Architecture:** Plain objects + pure functions, unique
- **Built-in features:** Store (state management), Router, Layout Engine, Localization, HMR
- **GitHub stars:** 3.2k
- **TS support:** Yes
- **Overhead:** Significantly more than just WC wrapper layer

### Haunted

- **Official docs:** https://hauntedhooks.netlify.app
- **Version:** v6.1.0 (Feb 2025)
- **Size:** Depends on lit-html bundle
- **Architecture:** React hooks API for WC
- **GitHub stars:** 2.7k
- **TS support:** Yes (94.8% TS)
- **Rendering:** Uses lit-html or hyperHTML

### Elemento

- **Official docs:** https://dsolimando.github.io/elemento/
- **Version:** No releases published
- **Size:** Small (ESM modules)
- **Architecture:** Functional, Lit + Preact Signals
- **GitHub stars:** 7
- **TS support:** Yes
- **Maturity:** Effectively a prototype/hobby project

### Uhtml

- **Official docs:** README only
- **Version:** v5 (v4 is stable, v5 is rewrite in progress)
- **Size:** 1-2 KB
- **Architecture:** Template literal tagged functions
- **GitHub stars:** 1.1k
- **TS support:** Limited
- **SSR:** WIP
- **Note:** No component model — just rendering

## Conflicts Between Sources

1. **Maturity vs Minimalism:** Lit and Stencil are production-grade but heavier. Atomico and uhtml are lighter but have smaller communities. The choice depends on wrapper complexity needed.

2. **WA's own tech stack:** WA already uses Lit internally. If wrappers need to interoperate deeply with WA internals, Lit is the natural choice. But WA is a black-box dependency — wrappers should use public API only.

3. **"Framework-agnostic" constraint:** packages/ui must not import framework-specific code. All WC libraries (Lit, Stencil, Atomico, etc.) qualify. Hybrids' built-in store/router add features that may not fit the "just wrappers" scope.

4. **Bundle size concern:** Adding a WC library JUST for thin wrappers adds unnecessary bytes. If wrappers are truly thin re-exports, Option A (status quo) is optimal. A library only makes sense if building custom components with logic.

5. **Future app plans:** Angular and React support. Stencil's framework output targets are attractive for multi-framework, but WA already ships React wrappers at `dist/react/`. Angular can use WC directly.

## Comparison Table

| Criterion              | A: Current               | B: Lit              | C: Stencil              | D: Atomico          | E: Hybrids        | F: Haunted              | G: Elemento   | H: Uhtml                | I: Vanilla  |
| ---------------------- | ------------------------ | ------------------- | ----------------------- | ------------------- | ----------------- | ----------------------- | ------------- | ----------------------- | ----------- |
| **Setup effort**       | None                     | Low (npm install)   | Medium (compiler)       | Low                 | Low               | Low                     | Low           | Low                     | None        |
| **API style**          | Re-exports               | Class/decorators    | TSX + compiler          | Functions+hooks     | Objects+functions | React hooks             | Functions+Lit | Literal tags            | Native API  |
| **Bundle size added**  | 0 KB                     | ~5 KB               | 0 KB (compile time)     | ~3 KB               | ~10 KB            | ~5 KB                   | ~3 KB         | ~1.5 KB                 | 0 KB        |
| **Performance**        | Native                   | Excellent           | Excellent               | Excellent           | Excellent         | Good                    | Good          | Excellent               | Native      |
| **Ecosystem**          | WA only                  | Largest             | Large                   | Small               | Medium            | Medium                  | None          | Small                   | N/A         |
| **GitHub stars**       | N/A                      | ~19k                | ~12k                    | 1.3k                | 3.2k              | 2.7k                    | 7             | 1.1k                    | N/A         |
| **TS support**         | Good (re-export)         | First-class         | First-class             | Good                | Good              | Good                    | Good          | Basic                   | Manual      |
| **SSR support**        | WA handles               | Lab stage           | Yes                     | No                  | No                | No                      | No            | WIP                     | Manual      |
| **Framework outputs**  | No                       | No                  | Yes (React/Vue/Angular) | No                  | No                | No                      | No            | No                      | No          |
| **License**            | MIT (WA)                 | BSD-3-Clause        | MIT                     | MIT                 | MIT               | BSD-2-Clause            | MIT           | MIT                     | N/A         |
| **Integration effort** | Done                     | Low                 | Medium                  | Low                 | Medium            | Low                     | Low           | Low                     | High        |
| **Multi-framework**    | Uses WC directly         | WC directly         | WC + wrappers           | WC directly         | WC directly       | WC directly             | WC directly   | WC directly             | WC directly |
| **Longevity risk**     | Low (WA by Font Awesome) | Low (Google/OpenJS) | Low (Ionic)             | Medium (small team) | Low (stable v9)   | Medium (one maintainer) | High (hobby)  | Medium (one maintainer) | None        |

## Recommendation

### Winner: Option A — Keep Current Thin Wrappers (Status Quo)

**But with a layered evolution path.**

### Evidence-Based Justification

1. **Currently, packages/ui wraps WA components as thin re-export layers.** This is correct and sufficient for the current scope. Adding a WC library to packages/ui without a clear need for custom component logic would be premature complexity.

2. **WA (Shoelace) provides 50+ production-ready components.** The current project only uses button. Adding wrappers for more WA components should follow the same pattern:

   ```ts
   // packages/ui/components/input.ts
   import '@awesome.me/webawesome/dist/components/input/input.js'
   import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js'
   export type { WaInput }
   ```

3. **Vue 3 handles WC natively** — no wrapper compilation needed. The WA docs confirm this.

4. **Framework-agnostic constraint** is satisfied by re-export pattern. No framework code enters packages/ui.

5. **When custom component logic IS needed**, the recommendation is **Lit** (Option B):
   - WA itself uses Lit, ensuring compatible Shadow DOM behavior
   - Largest community, Google/OpenJS backing
   - First-class TS support (decorators, reactive properties)
   - Proven in production (Adobe Spectrum, Material Web, WA)
   - ~5 KB is acceptable for a component with custom logic
   - No build tool needed, works with Vite/Turborepo out of box

6. **Stencil** (Option C) is overkill for this project. Framework output targets are attractive but WA already provides React wrappers, and Vue/Angular consume WC directly. The compiler-based workflow adds complexity.

### Situational Recommendations

| Scenario                                               | Recommendation                           |
| ------------------------------------------------------ | ---------------------------------------- |
| WA component works as-is, just needs type re-export    | Option A — current thin wrapper          |
| Need to compose 2+ WA components into a compound UI    | Option B — Lit wrapper                   |
| Need controlled form components with custom validation | Option B — Lit + reactive properties     |
| Adding brand-new components not from WA                | Option B — Lit                           |
| Need React/Next.js support with SSR                    | Option C — Stencil framework outputs     |
| Ultra-bundle-sensitive context (<< 5 KB budget)        | Option H — uhtml or Option I — vanilla   |
| Small team, want React-like hooks for WC               | Option D — Atomico or Option F — Haunted |

## Open Questions

1. **Wrapper granularity:** Should `packages/ui` expose every WA component (50+) or only the subset used by apps? Current approach is opt-in per component.

2. **Custom component boundary:** When does a wrapper become a new component vs. a direct WA usage? Need a decision framework.

3. **Vue v-model with WA form controls:** WA docs note `v-model` has inconsistent support on WC. Should Vue apps use `:value + @input` pattern, or should packages/ui provide Lit wrappers that normalize form control behavior?

4. **Design tokens:** WA provides CSS custom properties for theming. Should packages/ui expose a token layer (like `packages/ui/styles/tokens.ts`) to centralize theme values?

5. **Testing strategy:** WA components are tested upstream. Should packages/ui test only the wrapper layer (integration tests) or also the underlying WA behavior?

6. **Tree-shaking:** Current side-effect imports (`import '@awesome.me/webawesome/...'`) are tree-shakable by Vite. Need to verify this holds for all bundlers.

## Execution Path (Recommended)

```
Phase 1 (Now) — Continue thin re-exports
  packages/ui/components/*.ts → import WA + re-export type
  Apps import from @repo/ui/<name>

Phase 2 (When custom logic needed) — Add Lit to packages/ui
  bun add lit@^3.2.1       (in packages/ui)
  Create packages/ui/lib/   for custom Lit-based wrappers
  Export as @repo/ui/custom/<name>

Phase 3 (Future multi-framework) — Evaluate Stencil output targets
  Only if Angular/React SSR becomes primary requirement
  Currently not needed — both frameworks consume WC directly
```
