## 1. CSS Design Token Sync

- [x] 1.1 Copy full `apps/white-label-vue/src/styles/tokens.css` (63 lines) into `apps/white-label-angular/src/styles/tokens.css`, replacing current 13-line version. Verify `bun run build` passes.
- [x] 1.2 Copy full `apps/white-label-vue/src/styles/base.css` (15 lines) into `apps/white-label-angular/src/styles/base.css`, replacing current 3-line version. Verify `bun run build` passes.
- [x] 1.3 Replace hardcoded `28rem`/`75rem` in `components-page.component.ts` with `var(--min-width-layout)`/`var(--max-width-layout)`. Verify template renders correctly.

## 2. AppShell Navigation

- [x] 2.1 Add `<nav>` with `routerLink` directives to `apps/white-label-angular/src/app/app.html` (mirror Vue App.vue pattern). Import `RouterLink` in `app.ts`. Verify nav renders both links.
- [x] 2.2 Add active link styling (bold + underline + brand color) using `routerLinkActive` directive. Verify active state matches Vue behavior.

## 3. MetaMap Metadata Wiring

- [x] 3.1 Create `apps/white-label-angular/metadata.ts` (copy from Vue `metadata.ts`). Verify file exports `frameworkMap` with same structure.
- [x] 3.2 Update `apps/white-label-angular/src/main.ts` to import `frameworkMap` and pass `metaMap: frameworkMap` to `createWhiteLabelApp()`. Verify metaMap provider is injected.

## 4. Signal Behavior Tests

- [x] 4.1 Rewrite `apps/white-label-angular/src/pages/products-page.component.spec.ts` with signal behavior tests: mock `ProductsService` with writable signals, test loading→fe-loader, loaded→product cards, error→error message. Verify all tests pass.
- [x] 4.2 Add signal behavior tests for `components-page.component.spec.ts` (heading presence, section structure). Verify all tests pass.

## 5. Cleanup

- [x] 5.1 Remove `console.log('🚀~meta:', meta)` from `packages/presenters/src/modules/product.presenter.ts`. Verify `bun run test` passes.

## 6. Integration Verification

- [x] 6.1 Run `bun run build` — verify Angular shell builds successfully.
- [x] 6.2 Run `bunx ng test --watch=false` — verify all Angular tests pass.
- [x] 6.3 Manual: `/` renders products with metaMap metadata, `/components` renders component showcase, nav works between routes.
