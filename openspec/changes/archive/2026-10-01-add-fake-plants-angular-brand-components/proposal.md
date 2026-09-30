# Proposal

## Why

Plan 4.6.5: `fake-plants-angular` still renders white-label styling and default ProductCard — no visual parity with `fake-plants-vue` (green brand, photo cards). Also, Angular has no component-override mechanism equivalent to Vue's `componentDirs` name-clash resolution, which blocks the 4.7 generator from scaffolding tenant component overrides.

## What Changes

- **New generic component-override registry** in `white-label-angular`: a single `InjectionToken` map keyed by white-label component name (`'product-card'`), a factory option `componentOverrides` on `createWhiteLabelApp()`, and an `injectComponentOverride(name, fallback)` accessor. Consumers (starting with `ProductsPage`) resolve their component through the registry; absent override → shell default (layer fallback preserved).
- **`ProductsPage` switches to registry + `ngComponentOutlet`** with a typed `cardInputs()` builder; existing behavior unchanged when no override is registered.
- **Tenant `fp-product-card` component** — photo card parity with `fake-plants-vue`'s ProductCard (fe-img via `getProductImageUrl(id)`, header title+price, description, fe-rating footer), registered under `'product-card'`.
- **Green brand tokens** — `fake-plants-angular/src/styles/tokens.css` gets the `--brand-fill-*` / `--brand-border-*` / `--brand-on-*` green overrides matching `fake-plants-vue` (already wired via `angular.json` styles).
- **Research task** (not behavior-changing): find the Angular equivalent of Vite's `import.meta.glob` (custom builder plugin? generated module? schematic?) so filename-based auto-discovery — local tenant component wins over white-label on name match — can replace the explicit registry map later without changing the registry API.

## Capabilities

### New Capabilities

- `angular-component-override`: Generic registry mechanism letting a tenant replace any white-label Angular component by name key via factory option, with shell default fallback.
- `fake-plants-angular-brand`: Green brand token overrides and the tenant's photo ProductCard rendered on the Products page in place of the shell default.

### Modified Capabilities

(none — no existing spec-level requirements change; `angular-pages-parity` ProductsPage tests keep passing via default fallback)

## Impact

- **Shell (`apps/white-label-angular`):** `bootstrap/init.ts` (token, option, provider, accessor), `pages/products-page.component.ts` (registry + outlet), shell specs. Package export `./app` already re-exports `init.ts` — no export changes.
- **Tenant (`apps/fake-plants-angular`):** new `src/components/fp-product-card.component.ts` + spec, `main.ts` (one `componentOverrides` line), `src/styles/tokens.css`.
- **Tests:** shell specs for default + override paths; tenant spec for fp card; `ng test` / `bun run build` green both apps.
- **Future:** 4.7 Angular generator templates reference this pattern; research outcome may introduce a build plugin/module for auto-discovery.
- **Not touched:** `fake-plants-vue`, `CardContainer` (explicit relative import — not overridable in Vue either, parity preserved), route/appShell/metaMap options.
