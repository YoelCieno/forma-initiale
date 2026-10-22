# Design

## Context

- Vue tenants override white-label components via `unplugin-vue-components` `componentDirs`: tenant dir scanned first, same filename wins — zero config, purely build-time. Angular has no equivalent; `ProductsPage` imports `ProductCard` directly, so a tenant cannot shadow it.
- `fake-plants-angular` already has env/metaMap/appShell/route overrides (4.6.1–4.6.4, 4.6.6); 4.6.5 (brand + ProductCard) is the last gap before the 4.7 generator.
- Angular DI supports component-class values in tokens (same pattern as Angular Material's `MAT_*` component tokens); `NgComponentOutlet` + `ngComponentOutletInputs` renders a runtime-resolved component with `setInput()` bindings (signal inputs dedupe unchanged values).
- Constraint: AOT-safe, no private APIs (`ɵsetComponentScope` rejected), factory option style must match existing `appShell`/`metaMap` conventions. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One generic registry that works for ANY white-label component — not a ProductCard-only token.
- Tenant = one component file in `src/components/` + one map entry; shell default preserved with zero config.
- Ship the Vue-parity green brand + photo ProductCard now.
- Produce the auto-discovery research artifact (Angular `import.meta.glob` equivalent) so filename-based "tenant wins" magic can land later without API churn.

**Non-Goals:**
- Implementing auto-discovery in this change (research only — outcome may introduce a plugin/module later).
- Overriding `CardContainer` — Vue's CardContainer uses an explicit relative import, so it is not overridable there either; parity means ProductsPage only.
- Overriding pages, routes, appShell, or metaMap (already covered by prior changes).
- Generator (4.7) template updates.

## Decisions

### D1: Single registry token + name-keyed map (vs per-component token)
`COMPONENT_OVERRIDES: InjectionToken<Record<string, Type<unknown>>>` with `providedIn: 'root'` factory returning `{}`; `injectComponentOverride<T>(name, fallback)` accessor used at each consumer.
- **Why:** per-component tokens (first proposal) don't scale — each new overridable component would need token + option + wiring. Name-keyed map makes adding component #N a one-line consumer change, mirroring Vue's filename semantics.
- **Alternatives:** per-component token (rejected: not generic); selector-matching directive (rejected: AOT doesn't dispatch by selector at runtime); `ɵsetComponentScope` (rejected: private API).

### D2: Explicit `componentOverrides` map in `main.ts` (vs auto-discovery) — with research task
Registration is an explicit `{ 'product-card': FpProductCard }` entry passed through a new `WhiteLabelAppOptions.componentOverrides` option, provided in `buildAppConfig()`.
- **Why now:** Angular AOT/esbuild has no `import.meta.glob`; filename auto-scan requires a custom builder plugin or codegen — too risky to build speculatively. Explicit map is AOT-safe, tree-shakable, grep-able, and is exactly the payload auto-discovery would generate.
- **Why research anyway (user condition):** the "tenant filename wins over white-label" magic is an important generator goal. Task group 1 researches Angular equivalents (custom `@angular/build` plugin / esbuild plugin, generated barrel module via schematic, `entryComponents`-style registry codegen, Vite glob if Angular's Vite-based builder exposes it) and recommends one. The registry API (D1) is chosen so the discovery mechanism can *populate the same map* later — swap the wiring, keep the contract.

### D3: `NgComponentOutlet` + typed `cardInputs()` builder (vs dynamic `ViewContainerRef`)
ProductsPage template renders `<ng-container [ngComponentOutlet]="ProductCardCmp" [ngComponentOutletInputs]="cardInputs(product)">`.
- **Why:** declarative, zoneless-safe, `setInput` diffing handled by framework; `@for` + `track product.id` reuses instances.
- **Typing:** outlet inputs are loosely typed at the framework edge; the `cardInputs(p: ProductView): ProductCardInputs` builder is the single typed boundary (no `as` casts; one documented boundary cast lives in the accessor, not here).
- **Alternative:** `ViewContainerRef.createComponent` in a loop (rejected: imperative, manual destroy/reuse logic).

### D4: Registry default = empty map, accessor fallback = shell component
Layer-fallback requirement ("tenant only holds diffs") is satisfied structurally: zero-override tenants/tests get shell defaults from the token factory + accessor fallback; no provider needed in TestBed.

### D5: Photo card parity with fake-plants-vue
`fp-product-card` mirrors `fake-plants-vue/src/components/ProductCard.vue`: `fe-img` (slot `media`, `getProductImageUrl(id)`), header title + `<strong>price</strong>`, description, footer `fe-rating`. Signal inputs match the shell card's input surface (structural contract from D1/`Type<unknown>` — inputs bound by name through the outlet). MetaMap already supplies `image: 'plant'`; the photo card deliberately uses product photos like Vue (plan text's "fe-icon" wording superseded by parity decision).
- Tokens: exact green block copied from `fake-plants-vue/src/styles/tokens.css` (`:where(:root)` selector preserved).

## Risks / Trade-offs

- [`ngComponentOutletInputs` loosens template type checking] → `cardInputs()` builder with explicit `ProductCardInputs` return type; shell spec asserts all 7 inputs arrive on the rendered component.
- [Registry is `Record<string, Type<unknown>>` — typo'd key silently falls back to shell default] → accessor called with literal keys only; spec covers override-present/absent; generator templates (4.7) will reuse the same literals. Renaming a key = grep-able string.
- [Single documented boundary cast in `injectComponentOverride`] → unavoidable: runtime map cannot carry per-key generics; documented inline. No other casts.
- [Shell ProductsPage spec asserts `app-product-card`] → default token factory keeps shell class → existing assertions stay green; new spec covers override path.
- [Research may recommend a mechanism with AOT/plugin costs] → research is an artifact, not a commitment; registry API stable either way, migration = populate same map.
- [Zoneless + outlet re-creation on component-class identity change] → accessor returns stable class reference (map lookup, not factory), so no re-create churn.

## Migration Plan

Additive only — new option/token, no breaking changes; shell consumers untouched except ProductsPage. Rollback: remove `componentOverrides` entry (shell defaults return). No data/schema migration.

## Open Questions

- Which auto-discovery mechanism wins (plugin vs generated module vs schematic) — deliberately deferred to the research task; outcome cannot change specs or registry API (D1/D2 fixed the contract), only the future wiring that populates `COMPONENT_OVERRIDES`.
