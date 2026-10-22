# Design

## Context

See proposal.md for motivation. Constraints that shape the approach:

- Angular shell `bootstrap/app.ts` hardcodes `root: App`; `WhiteLabelAppOptions` has no `appShell`.
- Vue shell already solves this: `resolveAppShell(opts)` returns `opts.appShell()?.default ?? (await import('../App.vue')).default`.
- `WhiteLabelApp.root` is `Type<unknown>`; `bootstrapApplication(root, config)` ignores the component selector.
- Angular components use named exports (no default-export convention like Vue SFCs).
- Shell nav active-state precedent: `app/app.html` uses `routerLinkActive` + `[routerLinkActiveOptions]="{ exact: true }"` — Angular has no `.router-link-exact-active` class equivalent.
- Tenant already omits `components` route (4.6.2), so shell nav's Components link is currently dead.

## Goals / Non-Goals

**Goals:**
- Shell gains a `appShell` option with `resolveAppShell` behavior parity with Vue.
- Tenant owns root component + nav (Products / About), wired via `appShell`.
- Tests first (TDD RED → GREEN), shell and tenant suites green.

**Non-Goals:**
- No shell nav refactor (shell default nav unchanged — `angular-pages-parity` requirement stays valid).
- No generator work (4.7) — nav shipping strategy deferred there.
- No metaMap (4.6.4), brand tokens (4.6.5), or MSW (4.6.6) work.

## Decisions

### D1 — `appShell` signature: `() => Promise<Type<unknown>>` (chosen) over Vue's `{ default }` shape

- **Chosen:** `appShell?: () => Promise<Type<unknown>>`; tenant call: `appShell: () => import('./app/app.component').then((m) => m.FpApp)`.
- **Rejected (B):** literal Vue parity `() => Promise<{ default: Type<unknown> }>` — forces `export default class FpApp`, non-idiomatic Angular (named exports).
- **Rejected (C):** union accepting module namespace or Type — over-engineered.
- Parity goal is *behavior* (shell override works), not identical TS shape. Vue's `{ default }` reflects ESM default = Vue SFC convention.

### D2 — default path: static `return App` over lazy `await import('../app/app')`

- `app.ts` already statically imports `App`; a lazy default import defers nothing and adds a fake dynamism branch.
- `resolveAppShell` stays `async` (tenant override is a lazy import).
- **Rejected:** lazy default import for literal Vue parity — zero bundle or behavior benefit in Angular.

### D3 — tenant root component: standalone, inline template + styles

- `FpApp` with `imports: [RouterOutlet, RouterLink, RouterLinkActive]`, BEM `.fp-nav__*` styles using design tokens (`--color-border`, `--color-text-body`, `--brand-fill-loud` — same tokens shell/`App.vue` use).
- Active state via `routerLinkActive="fp-nav__link--active"` + exact-match options on Products (Angular precedent in shell `app.html`).
- **Rejected:** extracting shared nav styles into shell — shell holds defaults, tenant holds diffs (established layer rule); shared nav abstraction is generator (4.7) territory.

### D4 — styles verified by human, not tests

- Spec requires human side-by-side vs `fake-plants-vue` `App.vue` nav (spacing, colors, active treatment). Style parity is not reliably test-assertable; recorded as manual validation check in plan 4.6.3.

## Risks / Trade-offs

- [Signature divergence from Vue complicates generator (4.7)] → Generator templates are per-framework anyway (Vue/Angular already diverge in routes: slash-less paths); one more per-framework signature is consistent, not new debt.
- [Nav CSS copied shell → tenant drifts] → Accepted: tenant-holds-diffs rule; drift caught in human parity check.
- [Static `App` in default branch means shell App always bundled] → Same as today (no lazy default today); tenant override is the lazy path, unchanged.
- [Selector assumption on bootstrapped root] → `bootstrapApplication` ignores selector; if Angular v22 compiler objects at impl time, add a harmless selector (`fp-root`) — no spec impact.

## Migration Plan

Purely additive shell API + new tenant file. No breaking change, no deprecation. Rollback = revert commit; shell default path identical to current behavior.

## Open Questions

- How the generator (4.7) ships nav: override-only (current mechanism) vs shell nav slots/menus. Deferred by design — requires evaluating all four override axes (routes, appShell, metaMap, tokens) together.
