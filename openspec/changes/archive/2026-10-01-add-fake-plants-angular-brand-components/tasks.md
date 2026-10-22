# Tasks

## 1. Research: Angular auto-discovery equivalent (import.meta.glob)

- [x] 1.1 Research Angular mechanisms for filename-based tenant-component auto-discovery (custom `@angular/build`/esbuild plugin, generated barrel module, schematic/codegen, Vite glob exposure in Angular's builder) — verify AOT compatibility, maintenance cost, `ng update` fragility; write comparison + recommendation to `.opencode/thoughts/research/angular-component-auto-discovery.md` (deliverable: document exists with candidates, tradeoffs, migration path from explicit map, stated recommendation)

## 2. Shell registry (TDD RED first)

- [x] 2.1 Write failing shell spec: `injectComponentOverride('product-card', ProductCard)` returns fallback when registry empty, returns tenant class when map has key (verify: `ng test --watch=false` fails before impl)
- [x] 2.2 Write failing shell spec: `createWhiteLabelApp({ componentOverrides: {...} })` config contains `COMPONENT_OVERRIDES` provider; zero-override config contains none (verify: test fails before impl)
- [x] 2.3 Implement `COMPONENT_OVERRIDES` token (root factory `{}`), `injectComponentOverride<T>(name, fallback)` accessor (1 documented boundary cast), `componentOverrides` option + provider in `buildAppConfig()` (verify: tasks 2.1–2.2 pass, `ng test --watch=false` green)
- [x] 2.4 Write failing shell spec: `ProductsPage` with overridden `'product-card'` key renders the tenant dummy component with all 7 inputs bound (`id`, `title`, `description`, `image`, `imageFamily`, `price`, `previousPrice`, `rate`) (verify: test fails before impl)

## 3. Shell ProductsPage wiring (TDD)

- [x] 3.1 Switch `ProductsPage` to `injectComponentOverride('product-card', ProductCard)` + `ngComponentOutlet` + typed `cardInputs()` builder (verify: task 2.4 passes; existing ProductsPage specs asserting `app-product-card` still green — default fallback unchanged)
- [x] 3.2 Run full shell verification (verify: `bunx ng test --watch=false` green in `apps/white-label-angular`, `bun run build` green, no `as` casts beyond documented accessor boundary)

## 4. Green brand tokens

- [x] 4.1 Replace placeholder comment in `apps/fake-plants-angular/src/styles/tokens.css` with exact green brand block from `fake-plants-vue/src/styles/tokens.css` — same vars, values, `:where(:root)` selector (verify: spec asserting `--brand-fill-normal: #16a34a` etc. resolves via computed style passes; shell `tokens.css` unchanged)
- [x] 4.2 Add tenant token spec if not covered by 4.1 (verify: `ng test --watch=false` green in `apps/fake-plants-angular`)

## 5. fp-product-card component (TDD RED first)

- [x] 5.1 Write failing tenant spec for `fp-product-card`: renders `fe-img` with `src === getProductImageUrl(id)` (mocked per id), header title + price, description, footer `fe-rating` value = rate; signal inputs match shell card surface (verify: test fails — component missing)
- [x] 5.2 Implement `apps/fake-plants-angular/src/components/fp-product-card.component.ts` — standalone, `CUSTOM_ELEMENTS_SCHEMA`, photo layout parity with `fake-plants-vue/src/components/ProductCard.vue`, BEM `fp-product-card__*` classes, styles use only design-token custom properties (verify: task 5.1 passes, no hardcoded colors in styles)

## 6. Tenant wiring + verification

- [x] 6.1 Register override in `apps/fake-plants-angular/src/main.ts`: `componentOverrides: { 'product-card': FpProductCard }` (verify: wiring spec asserts accessor resolves `FpProductCard` for `'product-card'`)
- [x] 6.2 Write failing integration spec: Products page in tenant test renders `fp-product-card` elements (not `app-product-card`) for 7-plant data (verify: fails before 6.1, passes after)
- [x] 6.3 Run full verification (verify: `bunx ng test --watch=false` green in tenant + shell, `bun run build` green at repo root, `bun run lint` green)

## 7. Human parity check (plan 4.6 sign-off)

- [x] 7.1 Serve `fake-plants-vue` (3101) and `fake-plants-angular` (4201) side by side; inspect green brand tokens, photo ProductCards, `/about`, omitted `/components`, 7 plant cards (verify: human confirms parity; record result in `.opencode/plans/core-foundation/phase-4/4.6-fake-plants-angular.md` Validation Checks + Manual Confirmation, tick 4.6.5 boxes)
