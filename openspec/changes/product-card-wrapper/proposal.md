# Proposal

## Why

Two boilerplate sources block Vue-parity ergonomics for Angular overrides: (1) consumers render overrides with explicit `ng-container` + `ngComponentOutlet` + `ngComponentOutletInputs` + a per-page `cardInputs()` mapper — an abstract layer Vue hides behind a plain `<ProductCard>`; (2) every tenant override requires a hand-typed `componentOverrides` entry in `main.ts` — the manual step Vue's `componentDirs` (filename wins) eliminates. Research (`.opencode/thoughts/research/2026-09-30-angular-component-auto-discovery.md`) recommends Option A, generated barrel module, for (2); this change also delivers (1) and folds the §4.6.7 PENCIL decision.

## What Changes

**Workstream 1 — consumer template ergonomics:**
- Add a shell wrapper component, selector `product-card`, with a single typed input `[product]: ProductCardInputs`.
- Wrapper resolves its rendered class via `injectComponentOverride('product-card', ProductCard)` and forwards inputs through `ngComponentOutlet` — all plumbing moves inside the wrapper, once.
- ProductsPage template becomes `@for` + `<product-card [product]="product" />`; deletes `cardInputs()`, the `ProductCard` import, and the registry accessor call from the page.
- Wrapper host uses `display: contents` so grid layout parity is preserved (inner card remains the effective grid item).
- Impl selectors stay prefixed (`app-product-card`, `fp-product-card`) — they only name the dynamic host tag, proving which impl rendered.

**Workstream 2 — generated override discovery (research Option A, folds §4.6.7):**
- Codegen script scans `apps/fake-plants-angular/src/components/*.component.ts`, derives the registry key from the filename stem, and emits `src/components/overrides.gen.ts` (auto-generated barrel). The script itself is created through `@repo/generator` — template task plan 4.7.1 (emitted file carries a provenance comment: generator-owned, edit the template not the copy), tenant wiring in plan 4.7.4. This change owns the requirements; execution tracked in plan 4.7.
- `main.ts` passes the generated map to `componentOverrides` instead of the hand-typed literal; explicit entries remain an escape hatch (merge order: explicit > generated).
- Pre-hooks (`predev`/`prebuild`/`pretest` in tenant `package.json`) regenerate automatically; generated file gitignored (unplugin `components.d.ts` pattern).
- Rename tenant file `fp-product-card.component.ts` → `product-card.component.ts` so filename stem equals the white-label key `product-card` — exact Vue parity (Vue tenant uses plain `ProductCard.vue`). Class `FpProductCard` and selector `fp-product-card` unchanged; 4 import sites updated.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `angular-component-override`: (1) add a wrapper-host requirement — overrideable components render through a neutral-selector host element with a single object input, so consumers contain no outlet/accessor plumbing; (2) add a generated-discovery requirement — tenant overrides register by adding a filename-matching component file, no manual `main.ts` map edit; registry API, accessor, and factory option remain unchanged (discovery only populates the same map; wrapper only reads it).

## Impact

- `apps/white-label-angular/src/components/` — new wrapper component + spec.
- `apps/white-label-angular/src/pages/products-page.component.ts` — template swap, plumbing removed.
- `apps/white-label-angular/src/pages/products-page.component.spec.ts` — grid-child assertions target `product-card` hosts.
- `apps/fake-plants-angular/scripts/gen-component-overrides.ts` (emitted by generator, plan 4.7.1/4.7.4) + `package.json` pre-hooks — execution moved to plan 4.7 (decision 2026-10-04).
- `apps/fake-plants-angular/src/main.ts` — generated map replaces explicit literal.
- `apps/fake-plants-angular/src/components/fp-product-card.component.ts` → renamed `product-card.component.ts`; imports updated in `main.ts`, `main.wiring.spec.ts`, `products-page.integration.spec.ts`, `product-card.component.spec.ts`.
- Unchanged: `apps/white-label-angular/src/bootstrap/init.ts` (registry API), tenant integration spec host-tag assertions (`fp-product-card` ×7 / `app-product-card` ×0 stay green).
- CSS: wrapper host `display: contents` in component styles.
- Plan §4.6.7 PENCIL resolves to Option A, execution tracked here.
