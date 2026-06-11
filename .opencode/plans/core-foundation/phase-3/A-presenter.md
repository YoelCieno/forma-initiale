# A. `@repo/presenter` — Domain→ViewModel Transformations

**Goal:** Extract presenter logic from `apps/web-vue/src/presenters/` into a shared, framework-agnostic `packages/presenter/` package.

## Sources

| Source file | Content |
|------------|---------|
| `apps/web-vue/src/presenters/product.presenter.ts` | Existing `ProductView` interface + `toProductView()`, `toProductViewList()` |
| `apps/web-vue/src/presenters/product.presenter.spec.ts` | 9 test cases (194 lines), ~95% coverage |
| `packages/domain/src/models/Product.ts` | Domain model consumed by presenter |
| `packages/domain/package.json` | Format reference for new package |

## Tasks

### A1. Scaffold `packages/presenter/` package

- [ ] Create `packages/presenter/package.json`
  - `name: "@repo/presenter"`, `private: true`, `type: "module"`
  - `exports: { ".": "./src/index.ts" }`
  - scripts: `lint`, `test`
  - devDeps: `@repo/eslint-config`, `@repo/typescript-config`, `typescript`, `vitest`, `eslint`
- [ ] Create `packages/presenter/tsconfig.json`
  - extends `@repo/typescript-config/base.json`
  - `include: ["src"]`
- [ ] Create `packages/presenter/.eslintrc.cjs` — extends `@repo/eslint-config/index.js`
- [ ] Create `packages/presenter/vitest.config.ts`
  - `import { defineConfig } from 'vitest/config'`
  - Environment: jsdom (for DOM types if needed by presenters)
  - Include: `src/**/*.spec.ts`

### A2. Move `ProductView` + transformation functions

- [ ] Create `packages/presenter/src/product.presenter.ts`
  - Export `ProductView` interface (from web-vue version)
  - Export `toProductView(product: Product): ProductView`
  - Export `toProductViewList(products: Product[]): ProductView[]`
  - Export internal helper `FrameworkMeta` interface + `frameworkMap` + `getFrameworkMeta()`
  - Import `type { Product } from '@repo/domain'`
  - No Vue/framework imports — pure TS only

### A3. Move tests

- [ ] Create `packages/presenter/src/product.presenter.spec.ts`
  - Copy all 9 test cases from web-vue version
  - Import from local `./product.presenter.ts` (not `@repo/presenter` in tests)
- [ ] Run `vitest run` in `packages/presenter/` — verify all pass
- [ ] Verify coverage ≥ 80%

### A4. Barrel export

- [ ] Create `packages/presenter/src/index.ts` — `export * from './product.presenter'`

### A5. Update web-vue imports

- [ ] `apps/web-vue/src/pages/ProductsPage.vue` — change import from `'../presenters/product.presenter'` to `'@repo/presenter'`
- [ ] `apps/web-vue/src/pages/ProductsPage.spec.ts` — same change

### A6. Remove old presenter directory

- [ ] Delete `apps/web-vue/src/presenters/` recursively

### A7. Verify

- [ ] `bun run build` — no type errors
- [ ] `bun run test` — all tests pass
- [ ] `bun run lint` — no lint errors

## ✅ Manual Confirmation

- [ ] Run `bun run dev` in `apps/web-vue` — products page renders correctly with data from `@repo/presenter`
- [ ] Human confirms: "A complete, proceed to B"
