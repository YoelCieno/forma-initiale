# Tasks

## 1. Universal host (TDD)

- [x] 1.1 **RED** — new spec `apps/white-label-angular/src/components/component-override.component.spec.ts`: port all scenarios from `product-card-wrapper.component.spec.ts` (host present; registry empty → `app-product-card`; registry `'product-card'` → dummy tenant class → tenant host only; input forwarding title/price/rate; grid children) retargeted to `ComponentOverride` rendering under the SAME `product-card` consumer tag + `[product]` binding, PLUS new scenarios: key = host `localName` resolved in constructor via accessor, unknown key + no registry entry → descriptive throw, missing `[product]` payload → descriptive throw, `display: contents` host, consumer template stays `<product-card [product]="product" />`. Verify: `cd apps/white-label-angular && bunx ng test --watch=false` → FAILS (ComponentOverride missing).
- [x] 1.2 **GREEN** — implement `apps/white-label-angular/src/components/component-override.component.ts`: ONE class `ComponentOverride`, selector = growing list `'product-card'`; constructor: `const localName = inject(ElementRef).nativeElement.localName` → resolve ONCE via unchanged `injectComponentOverride(localName, OVERRIDE_FALLBACKS[localName])` (runs in the constructor's injection context — NO `runInInjectionContext`, no memoized getter); module-level `const OVERRIDE_FALLBACKS = { 'product-card': ProductCard } satisfies Record<string, Type<unknown>>`; classic optional `@Input() product?: ProductCardInputs` (classic — gotcha #6; `required: true` impossible on shared class); `ngOnChanges` sets payload = changed input's `currentValue`; LOUD throw naming the slot when payload missing; template `<ng-container [ngComponentOutlet]="resolved()" [ngComponentOutletInputs]="payload()" />` (payload passed with no cast); `:host { display: contents }`. Verify: 1.1 spec GREEN.
- [x] 1.3 **Types** — move `ProductCardInputs` into `component-override.component.ts` (no `OverrideInputsMap` — per-input typing supersedes the union); grep consumers: only wrapper + wrapper spec import the type today (swap in task 2 removes them). Verify: `cd apps/white-label-angular && bunx ng test --watch=false` GREEN; no `as` casts in the new host file (`rg ' as ' apps/white-label-angular/src/components/component-override*` → none).

## 2. Consumer swap + retire per-slot wrapper

- [x] 2.1 **Verify** — `apps/white-label-angular/src/pages/products-page.component.spec.ts`: template is byte-identical post-change ⇒ grid-child assertions are EXPECTED to pass untouched. Run the spec; ONLY if a genuine assertion mismatch appears, retarget it (do not preemptively edit). Verify: spec green with no edits, or minimal retarget documented.
- [x] 2.2 **GREEN** — swap `apps/white-label-angular/src/pages/products-page.component.ts` IMPORT ONLY: `ProductCardWrapper` → `ComponentOverride` in the component `imports`. Template UNTOUCHED: `@for` + `<product-card [product]="product" />` stays byte-identical. Verify: page spec GREEN: `cd apps/white-label-angular && bunx ng test --watch=false`.
- [x] 2.3 **Delete** — remove `product-card-wrapper.component.ts` + `product-card-wrapper.component.spec.ts` (scenarios ported in 1.1). Verify: `rg 'ProductCardWrapper|product-card-wrapper' apps/` → zero code refs, AND `cd apps/white-label-angular && bunx ng test --watch=false` GREEN.

## 3. Verification gates

- [x] 3.1 **Shell suite**: `cd apps/white-label-angular && bunx ng test --watch=false` → exit 0 (host spec, page spec, all others). Verify: all green.
- [x] 3.2 **Tenant regression (spec file UNCHANGED)**: `cd apps/fake-plants-angular && bunx ng test --watch=false` → `products-page.integration.spec.ts` green (`fp-product-card` ×7, `app-product-card` ×0). Verify: green AND `git status --porcelain apps/fake-plants-angular/src` → empty (byte-frozen).
- [x] 3.3 **Full gates**: `bun run lint && bun run build` at repo root. Verify: both exit 0.
- [x] 3.4 **Browser probe gate (BOTH ports)** — servers must be UP first, in separate shells:
  - `cd apps/fake-plants-angular && bun run dev` → port 4201
  - `cd apps/white-label-angular && bun run dev` → port 4200

  Then, after lint+build (task 3.3), run BOTH probes:

  ```
  bun /data/sites/ai/settings-opencode/scripts/probe.ts http://localhost:4201
  bun /data/sites/ai/settings-opencode/scripts/probe.ts http://localhost:4200
  ```

  Verify EACH run: prints `PASS`, prints `console errors: 0`, exits 0. Any `FAIL`, nonzero `console errors`, or nonzero exit → gate FAILS (fix before proceeding).
- [x] 3.5 **Settled screenshots / visual parity** — capture settled screenshots of both Products pages with a custom wait of ~5–6s (data fetch + grid render must settle before capture; reference pattern `/tmp/opencode/probe-settled.ts` if present — else adapt probe.ts with a longer settle wait). Verify: eyeball grid parity pre/post — auto-fill tracks unchanged, no extra gaps, `ComponentOverride` hosts invisible via `display: contents`, identical card count and content on 4200 + 4201.
