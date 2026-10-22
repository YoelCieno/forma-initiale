# Design

## Context

Angular consumers render overridden components with explicit plumbing: `ng-container` + `ngComponentOutlet` + `ngComponentOutletInputs` + a per-page `cardInputs()` mapper (see `apps/white-label-angular/src/pages/products-page.component.ts:34-37`). Vue consumers write a plain `<ProductCard>`. Additionally, every tenant override needs a hand-typed `componentOverrides` literal in `apps/fake-plants-angular/src/main.ts:14`. The override mechanism itself (registry, `injectComponentOverride()`, factory option — `apps/white-label-angular/src/bootstrap/init.ts`) is shipped and stays fixed on both axes. Discovery candidates were evaluated in `.opencode/thoughts/research/2026-09-30-angular-component-auto-discovery.md` (Option A generated barrel recommended; `import.meta.glob` rejected — Vite = dev-server only). Task-level behavior specs also live in `.opencode/plans/core-foundation/phase-4/4.6-fake-plants-angular.md` §4.6.7-§4.6.8 (this change executes both).

## Goals / Non-Goals

**Goals:**
- One-line consumer template: `<product-card [product]="product" />`
- Zero manual registry edits when adding a tenant component (filename wins, Vue parity)
- All override plumbing (accessor + outlet + input mapping) in one shell component, written once
- Visual/layout parity — zero CSS regressions
- Registry API, accessor, factory option untouched (both axes compose on the same map)

**Non-Goals:**
- esbuild plugin / custom builder (research Option B) — private API, R11 fragility; only revisit if codegen re-run friction becomes real
- `import.meta.glob` — dev/build/test divergence, rejected in research
- Generic multi-slot "override host" abstraction — `product-card` slot only; more slots repeat the pattern (KISSME: write what's used)
- Watch-mode auto-regeneration during a running dev server (pre-hooks cover start-up; adding files mid-session = rerun or restart)
- Renaming impl selectors (`app-`/`fp-`) or class names (`FpProductCard`)

## Decisions

### 1. Wrapper component over build-time aliasing
**Choice:** shell wrapper, selector `product-card`, input `[product]: ProductCardInputs`.
**Why:** starts simple, keeps shipped registry green, no 3-pipeline (`vp`/`ng build`/`ng test`) tsconfig `paths` verification. Aliasing would unify classes but reworks 4.6.5 wiring and breaks the integration spec asserting `fp-product-card` ×7 / `app-product-card` ×0.
**Alternative considered:** build-time module aliasing (discussion Option A) — rejected for now, revisit per Q4 answer.

### 2. Neutral wrapper selector `product-card`; impls keep prefixes
Wrapper takes the bare slot name (consumer-facing). Impl selectors only name the dynamic host tag created by the outlet — prefixes double as runtime proof of which impl rendered (keeps tenant integration spec green, zero renames). No selector clash: impls are never element-matched in any template (wrapper imports the shell class only as accessor fallback, not as a template directive).

### 3. Single object input `[product]`
**Choice:** one typed object, mapping site lives once inside the wrapper (`cardInputs()` moves page → wrapper).
**Why (KISSME):** fewer props, single mapping to maintain if card surface grows; per-product binding mirrors Vue `v-bind="product"` closely enough.
**Alternative:** individual inputs mirroring card surface — more verbose, N mapping sites if more slots added.

### 4. Layout: `display: contents` on wrapper host
Wrapper adds a DOM node per card; `:host { display: contents }` removes it from layout so the inner card remains the effective grid item. Vue has no extra node → this restores parity.
**Alternative:** `:host { display: block }` + grid fixes on inner — rejected, would alter tracks.

### 5. Discovery = generated barrel (research Option A) — folds §4.6.7
**Choice:** bun script scanning `src/components/*.component.ts` → emits `overrides.gen.ts`; pre-hooks (`predev`/`prebuild`/`pretest`) run it. Script is created through `@repo/generator`: template lives in the generator package (plan 4.7.1), emitted tenant copy carries a header comment "Created by @repo/generator — do not hand-edit; edit the template and re-run" (`import-meta-env.d.ts` precedent); tenant wiring = plan 4.7.4. This change owns requirements, plan 4.7 owns execution.
**Why:** only candidate that is AOT-safe (plain static imports), consistent across `ng build`/`ng serve`/`ng test`, private-API-free, `ng update`-proof. Research doc has full comparison.
**Alternatives rejected:** esbuild plugin (Option B — `private.d.ts`, R11), schematic alone (Option C — only fires on `ng generate`), runtime glob (Option D — impossible in browser), `import.meta.glob` (Vite dev-server only → build emits raw call → runtime crash).

### 6. Key = filename stem; rename tenant file to `product-card.component.ts`
**Choice:** script derives key = filename stem with `.component.ts` stripped; tenant file renamed `fp-product-card.component.ts` → `product-card.component.ts` (4 import sites updated). Class `FpProductCard` + selector `fp-product-card` unchanged.
**Why:** exact Vue parity — `fake-plants-vue` overrides with plain `ProductCard.vue`, no prefix. Filename must equal the white-label filename or the key never matches `'product-card'`. Zero prefix-stripping magic in the script.
**Alternative rejected:** keep `fp-` prefix, script strips known prefix — hidden convention, fragile as tenants multiply.
**Convention documented:** tenant `src/components/<white-label-filename>` wins — same rule as Vue `componentDirs`.

### 7. Generated file gitignored + pre-hook regeneration
**Choice:** `overrides.gen.ts` gitignored, regenerated by `predev`/`prebuild`/`pretest`.
**Why:** mirrors unplugin's `components.d.ts`/`auto-imports.d.ts` pattern already used in the Vue app; no VCS churn, no stale-committed barrel. Pre-hooks make all three pipelines consistent.
**Alternative:** commit generated file — grep-able, but merge conflicts + staleness; rejected.

### 8. Merge order: explicit > generated
`main.ts` may keep explicit entries as escape hatch for cases codegen can't derive (non-file-based overrides). Generated map is the base, explicit entries override per key.

### 9. TDD order
RED spec first — wrapper (fallback render, override render, input forwarding, consumer template shape) + codegen script (temp-dir scan → barrel with stem key). GREEN impls, then consumer swap + `main.ts` swap, then gates (`ng test` ×2, `lint`, `build`).

## Risks / Trade-offs

- [Extra DOM nesting per card] → `display: contents`; spec scenario "Grid child positioning" locks parity.
- [ProductsPage spec asserts `app-product-card` grid children] → assertions retarget `product-card` hosts; shell card still renders inside wrapper so count assertions hold.
- [Wrapper `imports` array pulls shell ProductCard class — could it element-match its own selector?] → no: directive matching only sees the consumer template's directive scope; the wrapper template contains no `app-product-card` element. Keep ProductCard referenced via accessor fallback only.
- [`display: contents` accessibility caveats] → wrapper is a plain container with no semantics (not table/interactive); negligible.
- [File add during running dev server not picked up until pre-hook rerun] → acceptable; research Option B is the watch-mode answer if friction becomes real.
- [Class-name extraction via regex fragile] → convention `export class <Pascal>` in `*.component.ts`, documented; script errors loudly on no-match.
- [`main.wiring.spec.ts` asserts explicit literal wiring] → spec updated to assert generated barrel wiring; explicit-merge behavior gets its own scenario.
- [Future slots copy boilerplate] → accepted for KISSME; generator (4.7) + generic host deferred with aliasing decision.

## Migration Plan

Single-PR, app-internal, two workstreams (either lands independently; wrapper first):
1. Wrapper: RED spec → GREEN impl → page swap → spec retarget (rollback = revert, page restores outlet plumbing).
2. Discovery: rename tenant file + 4 imports → script + RED spec → pre-hooks → `main.ts` swap to generated map (rollback = re-add explicit literal).
Gates after both: tenant integration spec UNCHANGED, `ng test` ×2, `lint`, `build`, visual parity check.

## Open Questions

- Whether a second overrideable slot appears (affects when to reconsider a generic host) — deferred to §4.6.7/4.7 evolution, does not change this design.
