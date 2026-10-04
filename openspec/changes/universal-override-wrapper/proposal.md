# Proposal

## Why

Every overridable white-label Angular component needs its OWN typed wrapper file — today exactly one exists (`ProductCardWrapper`, selector `product-card`, `apps/white-label-angular/src/components/product-card-wrapper.component.ts`). Scale cost = O(N) wrapper files, each repeating the same registry lookup + `ngComponentOutlet` + input-forwarding boilerplate. The registry itself is shipped and correct on all axes (`COMPONENT_OVERRIDES` token, `injectComponentOverride()` accessor, `componentOverrides` factory option — `apps/white-label-angular/src/bootstrap/init.ts`); only the consumer-facing host is per-slot. The prior change (`product-card-wrapper`) explicitly deferred a generic host ("more slots repeat the pattern — KISSME"); this change revisits that deferral and replaces the per-component wrapper with ONE growing-selector host class. Follow-up to `.opencode/plans/core-foundation/phase-4/4.6-fake-plants-angular.md` §4.6.8.

**Primary constraint (user verdict): consumer DX.** The consumer template MUST stay `<product-card [product]="product" />`. A generic element host `<component-override key="product-card" [inputs]="product">` is REJECTED — worse DX and it breaks the Angular rule that a template element must equal the component selector. This mandate drives every decision below.

## What Changes

- **New shell host** `ComponentOverride` — ONE file `apps/white-label-angular/src/components/component-override.component.ts`, ONE class, selector = a GROWING list: `'product-card'` today, `'product-card, wl-header, ...'` as slots are added. Template (internal mechanics unchanged): `<ng-container [ngComponentOutlet]="resolved()" [ngComponentOutletInputs]="payload()" />`, `:host { display: contents }` for grid parity.
- **Key source = host element**: `inject(ElementRef).nativeElement.localName` — the neutral tag (`'product-card'`) IS the registry key. Read in the CONSTRUCTOR (injection context + value both available), resolved ONCE via the unchanged accessor `injectComponentOverride(localName, OVERRIDE_FALLBACKS[localName])`. This eliminates the previous design's lazy `runInInjectionContext` dance — the key no longer arrives post-constructor as an input. `OVERRIDE_FALLBACKS` is a module-level map `satisfies Record<string, Type<unknown>>`.
- **Per-key classic `@Input()` on the shared class**: `@Input() product?: ProductCardInputs` (future slots add `@Input header?: ...`). `ngOnChanges` sets `payload` = the changed input's `currentValue`; per instance exactly one input can fire (the selector guarantees it). `required: true` is IMPOSSIBLE on a shared class (sibling inputs would trip missing-required validation on every instance) → optional inputs + a LOUD runtime throw when payload is missing (mirrors the old unknown-key throw).
- **Typed pairing → per-input typing**: `ProductCardInputs` moves out of the retiring wrapper; each slot's input is typed by its own `@Input` declaration. No keyed-map union machinery (`OverrideInputsMap` dropped — per-input typing is strictly better: exact type at every call site, no union degradation at N=2).
- **Consumer swap**: `products-page.component.ts` changes ONLY its import + `imports: [ComponentOverride]`. The template stays byte-identical: `@for` + `<product-card [product]="product" />`. Plumbing stays hidden.
- **Retire per-slot wrapper**: delete `product-card-wrapper.component.ts` + its spec (scenarios migrate into the host spec). Page spec grid-child assertions need NO retargeting — template unchanged; task states "verify, likely untouched".
- **Per-new-slot cost**: +1 selector entry, +1 `@Input`, +1 fallback map entry — still ONE file.
- **Tenant path untouched**: `NgComponentOutlet` takes the class, not a selector — impl prefixes (`fp-`/`app-`) are irrelevant. `apps/fake-plants-angular/src/pages/products-page.integration.spec.ts` (NOT `src/pages/pages/`) stays byte-identical: `fp-product-card` ×7 / `app-product-card` ×0 remains green.
- **Registry invariant holds**: only the EXISTING `COMPONENT_OVERRIDES` map is read; accessor signature, token, and factory option all unchanged — the host is a consumer, not a registry change.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `angular-component-override`: (1) MODIFIED wrapper-host requirement — the per-slot neutral-selector wrapper (`product-card` element + `[product]` input) is replaced by a single growing-selector host class whose consumer template stays `<product-card [product]="product" />`, per-component wrapper files removed; (2) ADDED universal-host requirement — ONE host class serving all keys, key resolved from the host element's tag through the unchanged accessor, unknown key or missing payload fails loudly; (3) ADDED typed-pairing requirement — per-slot typing via one classic `@Input` per key on the shared class, forwarded to the outlet without type assertions; (4) MODIFIED extensibility requirement — a new slot = +1 selector entry +1 `@Input` +1 fallback entry in the SAME file, no new wrapper file, consumer template unchanged.

## Impact

- `apps/white-label-angular/src/components/component-override.component.ts` + `.spec.ts` — NEW (host + migrated/new scenarios).
- `apps/white-label-angular/src/components/product-card-wrapper.component.ts` + `.spec.ts` — DELETED (type `ProductCardInputs` moves to the new host module; only wrapper + its spec import it today).
- `apps/white-label-angular/src/pages/products-page.component.ts` — IMPORT swap only (`ProductCardWrapper` → `ComponentOverride` in `imports`); template byte-identical.
- `apps/white-label-angular/src/pages/products-page.component.spec.ts` — NO retargeting expected (template unchanged); verify, likely untouched.
- Unchanged: `apps/white-label-angular/src/bootstrap/init.ts` (registry API), tenant app source + integration spec, impl selectors/class names.
- Depends on open change `product-card-wrapper` (its wrapper-host requirement is superseded here — archive that change first or fold; see design.md Open Questions).
- Phase plan §4.6.8 wording ("generic host deferred") satisfied by this change; plan edit tracked outside this change (constraint: no files outside the change directory).
