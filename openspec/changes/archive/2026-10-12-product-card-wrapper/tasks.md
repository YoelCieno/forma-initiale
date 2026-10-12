# Tasks

## 1. Shell wrapper (TDD)

- [x] 1.1 Write RED wrapper spec at `apps/white-label-angular/src/components/product-card-wrapper.component.spec.ts`: registry empty → `app-product-card` rendered inside `product-card` host; registry maps `'product-card'` → fake tenant class → tenant host present, `app-product-card` absent; `[product]` forwarding (title/price/rate reach card). Verify: `cd apps/white-label-angular && bunx ng test --watch=false` fails on missing component.
- [x] 1.2 Implement wrapper component `product-card-wrapper.component.ts` (selector `product-card`, input `[product]: ProductCardInputs`, internal `injectComponentOverride('product-card', ProductCard)` + `ngComponentOutlet` + `cardInputs()` mapping moved from page, `:host { display: contents }`). Verify: 1.1 spec green.
- [x] 1.3 Consumer-shape assertion in wrapper/page spec: rendered grid children are `product-card` hosts. Verify: `bunx ng test --watch=false` green for wrapper + page specs.

## 2. Consumer swap

- [x] 2.1 Rewrite `apps/white-label-angular/src/pages/products-page.component.ts` template to `@for` loop with `<product-card [product]="product" />`; delete `cardInputs()`, `ProductCard` + `injectComponentOverride` imports, `NgComponentOutlet` import. Verify: shell page spec passes after 2.2.
- [x] 2.2 Update `apps/white-label-angular/src/pages/products-page.component.spec.ts` — grid-child assertions target `product-card` hosts (RED → update → green). Verify: `cd apps/white-label-angular && bunx ng test --watch=false` green.

## 3. Verification gates

> Discovery workstream (research Option A) executed in plan `4.7-generator-angular.md` — script template 4.7.1, spec 4.7.3, wiring 4.7.4 (decision 2026-10-04: script created through `@repo/generator`). Requirements stay in this change's spec delta; archive after 4.7 completes.

- [x] 3.1 Tenant regression: `cd apps/fake-plants-angular && bunx ng test --watch=false` — `products-page.integration.spec.ts` stays green UNCHANGED (`fp-product-card` ×7, `app-product-card` ×0 — prefixes prove which impl rendered). Verify: suite green, spec file untouched.
- [x] 3.2 Full gates: `bun run lint` && `bun run build` at repo root. Verify: both exit 0.
- [x] 3.3 Visual parity: `bun run dev`, open white-label Products page — card grid layout identical to pre-change (auto-fill tracks unchanged, no extra gaps). Verify: eyeball / browser devtools grid tracks.
