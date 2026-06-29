# Phase 2 — Web Awesome UI Layer

**Status:** ✅ COMPLETE
**Last updated:** 2026-06-11

## Goal

Integrate Web Awesome (WC library, works Vue 3 + Angular + React) as base UI layer. Components live as thin re-export wrappers in `packages/ui/` so all apps import from `@repo/ui/*` not WA directly. Apps use `fe-*` elements (e.g., `<fe-button>`) in templates — never `<wa-*>`. Theming via CSS custom property overrides with DS token files in `packages/ui/styles/`.

## Key Constraint

`packages/ui` must stay **framework-agnostic** (vanilla TS / WC). No Vue/React/Angular imports in `packages/ui/`. Apps MUST use only `fe-*` elements in templates, never `wa-*` directly. `fe-*` wrappers are single entry point for all framework apps.

## Research Required

### WC framework for custom wrappers

Evaluate Lit, Stencil, Atomico, Hybrids, Haunted, Elemento, Uhtml + raw CE → **hybridJS selected** (v9.1.22, 0 deps, plain objects + pure fns, auto attr reflection).

### Web Awesome evaluation

Chosen as best pragmatic option — mature, well-typed, framework-agnostic WC library.

### API mocking strategy

MSW selected — single tool for dev + test, realistic `fetch` interception, type-safe handlers. Handlers in `packages/infra/mocks/`.

See [`phase-2/2.1-architecture-decision.md`](./phase-2/2.1-architecture-decision.md) for full evaluation.

## Tasks

- [x] Research AgnosticUI → rejected (alpha, Lit dep, no Angular)
- [x] Research multi-framework unstyled alternatives → no ideal product exists
- [x] Evaluate 6+ WC frameworks → hybridJS selected
- [x] Web Awesome selected as best pragmatic option
- [x] Create native CE fe-button (temporal commit `8216e3f`)
- [x] Remove old boilerplate (counter.ts, header.ts, utils/counter.ts)
- [x] Refactor pages: move ProductsPage to `apps/web-vue/src/pages/`
- [x] Add Vue Router with hash history
- [x] Stale ref cleanup (components.d.ts old ButtonDemo entry)
- [x] Install hybridJS in `packages/ui/` (`bun add hybrids@^9`)
- [x] Rewrite `packages/ui/components/fe-button.ts` using hybridJS `define()`
- [x] Update fe-button spec to test hybridJS component
- [x] Adopt MSW as API mocking strategy — add MSW dep to web-vue + infra, create handler structure, verify dev + test interception
- [x] Set up DS tokens scaffold (`packages/ui/styles/tokens/`) with `--wa-*` CSS var overrides
- [x] Adopt BEM CSS naming convention across all component styles
- [x] Add fe-icon component (`packages/ui/components/fe-icon.ts`)
- [x] Add fe-card component (`packages/ui/components/fe-card.ts`)
- [x] **[Demo Page Expansion](./phase-2/2.6-demo-page-expansion.md)** — fe-icon + fe-card + fe-rating showcases, UX polish, component rename (Demo* → *Container), route /demo → /components
- [x] **[Product Integration](./phase-2/2.7-product-integration.md)** — domain model update, presenter layer, ProductsPage grid refactor with fe-card/fe-icon/fe-rating, tests
- [x] **[Component Refinement](./phase-2/2.8-component-refinement.md)** — fe-card hybridJS conversion, disabled property, fe-async-content component, ProductsPage integration
- [x] Create Vue integration doc (`docs/integrations/*.md`)

## Decisions

| #   | Decision                             | Choice                         | Rationale                                                                                                                   |
| --- | ------------------------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | WC library for custom wrappers       | hybridJS v9.1.22               | Plain objects + pure fns, 0 deps, 3.2k ⭐, auto attr reflection, framework-agnostic                                         |
| 2   | Framework-specific wrappers in apps  | Do not create                  | Defeats single-source-of-truth purpose of packages/ui                                                                       |
| 3   | `v-model` on WA form controls in Vue | Use `:value + @input` pattern  | WC `v-model` support inconsistent across components                                                                         |
| 4   | Future custom components             | Build with hybridJS            | Already in use, fits project philosophy better than Lit                                                                     |
| 5   | Component registration               | Side-effect import per wrapper | Tree-shakable, avoids global bundle                                                                                         |
| 6   | Token directory location             | `packages/ui/styles/tokens/`   | Co-located with styles barrel, separate from components                                                                     |
| 7   | Testing thin wrappers                | No unit tests                  | Pure type re-exports, no logic to cover                                                                                     |
| 8   | API mocking                          | MSW                            | Single tool for dev + test, realistic fetch interception                                                                    |
| 9   | Mock handler location                | `packages/infra/mocks/`        | Co-located with infra adapters                                                                                              |
| 10  | Data generation                      | Factories + fixtures           | Sequential counter + sensible defaults, test isolation                                                                      |
| 11  | fe-card implementation               | hybridJS `define()`            | WaCard shadow DOM is isolated; hybridJS rewrite using `define()` + `html` + `shadow: true` with `<wa-card>` inside template |
| 12  | fe-rating implementation             | hybridJS `define()`            | wa-rating not registered by default, hybridJS is the standard approach                                                      |
| 13  | WA attr reflection in tests          | Use `Reflect.get()`            | WA components don't reflect boolean/string props to attrs                                                                   |
| 14  | fe-async-content (new)               | hybridJS `define()`            | Pure view-state component: loading/error/default. No data-fetching logic, no framework coupling.                            |

## Notes

- **hybridJS supersedes Lit** — Lit was initially considered for custom WC logic. Replaced by hybridJS (v9.1.22, 0 deps, MIT). Plain object + function model better fits project philosophy.
- **`sideEffects` field** — `packages/ui/package.json` omits `sideEffects` (= treated as `true`). This is correct because every component file registers a CE as side effect. Switching to `false` would break registrations. If pure TS modules added later, switch to fine-grained array `["./components/fe-*.ts", "./styles/*.ts"]`.
- **jsdom limitations** — does not fully implement CE lifecycle. Tests verify presence + basic interaction, not shadow DOM. Browser E2E (Playwright) planned for Phase 3.

## Reference Docs

| Document                                                                         | Content                                                                                                                    |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`phase-2/2.1-architecture-decision.md`](./phase-2/2.1-architecture-decision.md) | hybridJS selection rationale, Native CE vs hybridJS comparison, fe-\* wrapper rule, when to use hybridJS vs thin re-export |
| [`phase-2/2.2-package-structure.md`](./phase-2/2.2-package-structure.md)         | packages/ui directory layout, export convention, component onboarding 7-step process, sideEffects guidance                 |
| [`phase-2/2.3-theming.md`](./phase-2/2.3-theming.md)                             | Design token strategy, CSS custom property overrides, per-component and app-level theming                                  |
| [`phase-2/2.4-app-integration.md`](./phase-2/2.4-app-integration.md)             | Vue 3, Angular (future), React (future) integration patterns, code examples                                                |
| [`phase-2/2.5-testing-strategy.md`](./phase-2/2.5-testing-strategy.md)           | packages/ui testing approach, app integration tests, current coverage table, targets                                       |
| [`phase-2/2.6-demo-page-expansion.md`](./phase-2/2.6-demo-page-expansion.md)     | Demo page: fe-icon + fe-card showcases, CSS UX polish                                                                      |
| [`phase-2/2.7-product-integration.md`](./phase-2/2.7-product-integration.md)     | Domain model update, presenter layer, fe-card wrapper, products grid, tests                                                |
