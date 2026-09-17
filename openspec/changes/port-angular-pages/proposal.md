## Why

The Angular white-label shell (`apps/white-label-angular`) has structural page components (ProductsPage, ComponentsPage) but lacks critical parity with the Vue shell: incomplete CSS design tokens (13/63 lines), missing AppShell navigation, unwired metaMap metadata, shallow test coverage, and hardcoded layout values instead of CSS custom properties. Without these, the Angular shell cannot render pages correctly or serve as a viable tenant base.

## What Changes

- **Sync CSS design tokens** — copy full `tokens.css` (63 lines) and `base.css` (15 lines) from Vue to Angular, replacing hardcoded layout values with CSS custom properties
- **Add AppShell navigation** — mirror Vue's `App.vue` nav pattern (RouterLinks to `/` and `/components`) in Angular's `app.html`
- **Wire metaMap metadata** — create `metadata.ts` in Angular shell, pass `metaMap: frameworkMap` in `main.ts` so ProductsService receives metadata overrides
- **Add full signal behavior tests** — ProductsPage spec covering loading → loaded → error transitions, not just DOM presence
- **Remove debug console.log** — clean up `console.log('🚀~meta:', meta)` in `packages/presenters/src/modules/product.presenter.ts`
- **Replace hardcoded CSS values** — components-page template uses `28rem`/`75rem` instead of `var(--min-width-layout)`/`var(--max-width-layout)`

## Capabilities

### New Capabilities

- `angular-pages-parity`: Angular white-label shell achieves feature parity with Vue shell for ProductsPage, ComponentsPage, AppShell navigation, CSS design tokens, metadata injection, and test coverage

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- `apps/white-label-angular/src/styles/tokens.css` — full rewrite (13 → 63 lines)
- `apps/white-label-angular/src/styles/base.css` — extend (3 → 15 lines)
- `apps/white-label-angular/src/app/app.html` — add nav with RouterLinks
- `apps/white-label-angular/src/app/app.ts` — add RouterLink import
- `apps/white-label-angular/src/main.ts` — import metadata, pass metaMap
- `apps/white-label-angular/src/pages/products-page.component.spec.ts` — rewrite with signal behavior tests
- `apps/white-label-angular/src/pages/components-page.component.ts` — replace hardcoded CSS values
- `packages/presenters/src/modules/product.presenter.ts` — remove console.log
