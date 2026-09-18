## Context

Angular shell (`apps/white-label-angular`) has page components and routing in place but lags behind Vue shell in CSS tokens, navigation, metadata wiring, and test depth. The Vue shell serves as the reference implementation. Angular uses `resource()` for async state, `input()` signals for component props, and `[prop]="value"` binding for `fe-*` elements (bare attrs broken per AGENTS.md gotcha #14).

## Goals / Non-Goals

**Goals:**
- Angular shell renders pages identically to Vue (same tokens, same layout)
- Nav provides same navigation UX as Vue shell
- ProductsService receives metaMap metadata overrides
- ProductsPage tests cover signal state transitions (loading/loaded/error)
- Debug console.log removed from presenter

**Non-Goals:**
- Changing Vue shell behavior
- Adding new fe-* components
- Modifying domain/infra/presenters logic beyond console.log removal
- Tenant app (`fake-plants-angular`) — future phase

## Decisions

### 1. CSS token sync strategy: full copy + adapt

**Decision:** Copy entire `tokens.css` and `base.css` from Vue to Angular, then replace hardcoded values in Angular templates with CSS vars.

**Rationale:** Angular tokens are 13/63 lines — partial sync risks drift. Full copy ensures parity. The Angular `components-page.component.ts` uses hardcoded `28rem`/`75rem` which MUST become `var(--min-width-layout)`/`var(--max-width-layout)` after tokens are synced.

**Alternatives considered:**
- Partial token sync (brand only) — rejected: leaves semantic colors, font scale, border radius missing
- Shared CSS file (cross-app import) — rejected: apps should own their token overrides for multi-brand safety

### 2. AppShell nav: inline template, RouterLink

**Decision:** Add `<nav>` with `<a routerLink>` directives directly in `app.html`. Import `RouterLink` in `app.ts`.

**Rationale:** Vue App.vue has nav inline. Angular equivalent is straightforward — no need for a separate nav component. `routerLinkActive` for active state styling.

**Alternatives considered:**
- Separate nav component — rejected: over-engineering for 2 links (KISSME)
- `<router-link>` custom element — doesn't exist in Angular; use `routerLink` directive

### 3. MetaMap wiring: metadata.ts + main.ts provide

**Decision:** Create `apps/white-label-angular/metadata.ts` (copy from Vue), import in `main.ts`, pass `metaMap: frameworkMap` to `createWhiteLabelApp()`.

**Rationale:** Same pattern as Vue. `ProductsService` already has `inject(META_MAP_INJECTION_KEY, { optional: true })` — just needs the provider to be supplied.

**Alternatives considered:**
- Move metadata.ts to shared package — deferred to 4.5.6 (separate concern)
- Default metaMap in factory — rejected: tenants should opt-in to metadata

### 4. Test strategy: signal behavior over DOM presence

**Decision:** Rewrite `products-page.component.spec.ts` to test signal transitions using mock `ProductsService` with writable signals.

**Rationale:** Current tests only check DOM structure. ADR requires tests that verify behavior. Signal-based tests cover the actual data flow: loading → render fe-loader, loaded → render product cards, error → render error message.

**Approach:** Mock `ProductsService` with writable signals, update signals between `fixture.detectChanges()` calls, assert DOM changes.

### 5. Console.log removal: separate commit after 4.5.4

**Decision:** Remove `console.log('🚀~meta:', meta)` from `product.presenter.ts` in a dedicated commit after the metaMap wiring task.

**Rationale:** Keeps each commit focused. Console.log is a debug artifact, not a behavioral change.

## Risks / Trade-offs

- **[Risk] CSS cascade differences** → Angular may load styles in different order than Vue. Mitigation: import tokens.css before component styles in angular.json `styles` array.
- **[Risk] RouterLink active class naming** → Vue uses `router-link-exact-active`, Angular uses `router-link-active`. Mitigation: use `routerLinkActive` directive with exact match.
- **[Risk] Signal test flakiness** → Angular signals settle asynchronously. Mitigation: use `fixture.whenStable()` + `Promise.resolve()` pattern (established in AGENTS.md gotcha #13).
