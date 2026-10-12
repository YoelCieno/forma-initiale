# Design

## Context

Today the shell renders overrides through `ProductCardWrapper` (`apps/white-label-angular/src/components/product-card-wrapper.component.ts`): selector `product-card`, classic `@Input({ required: true }) product!: ProductCardInputs`, field-init `injectComponentOverride('product-card', ProductCard)` + `ngComponentOutlet` + `cardInputs()` mapping, `:host { display: contents }`. Consumers (`apps/white-label-angular/src/pages/products-page.component.ts`) use `@for` + `<product-card [product]="product" />`. The prior change (`openspec/changes/product-card-wrapper/`) shipped this deliberately as slot-specific and deferred a generic host (KISSME, N=1); this change folds that deferral as follow-up work in the phase-4 track (§4.6.8).

**Governing constraint (user verdict):** the consumer template MUST remain `<product-card [product]="product" />`. The previously considered generic element host `<component-override key="product-card" [inputs]="product">` is REJECTED — worse consumer DX, and it violates the Angular rule that a template element must equal the component selector (a selector list can match many tags; a single-tag generic selector cannot be reused under the slot's neutral tag). Every decision below is subordinate to this mandate.

Constraints verified against the code:

- **Accessor is inject-time**: `injectComponentOverride(name: string, fallback: Type<T>): Type<T>` (`bootstrap/init.ts:43-48`) — `name` is a plain runtime string used as `overrides[name]` (dynamic key content-wise OK), but the body calls `inject(COMPONENT_OVERRIDES)` → must execute inside an injection context. The host reads its key in the CONSTRUCTOR (see Decision 4), so the accessor call runs natively in the constructor's injection context — no `runInInjectionContext` needed.
- **Gotcha #6**: tenant tests externalize bare `white-label-angular/*` imports → JIT → signal inputs invisible → NG0950. Host consumed by tenants (via shell ProductsPage) MUST use classic `@Input()`.
- **Template checking**: `apps/white-label-angular/tsconfig.json` has NO `strictTemplates` — call-site checking is basic today.
- **Tenant regression**: `apps/fake-plants-angular/src/pages/products-page.integration.spec.ts` asserts `fp-product-card` ×7 / `app-product-card` ×0 (host tags created by the outlet, not by the wrapper). Byte-frozen for the previous change; this change must not need to edit it.
- **Current import graph**: only `product-card-wrapper.component.ts` and its spec reference `ProductCardWrapper`/`ProductCardInputs` (grep).

## Goals / Non-Goals

**Goals:**
- ONE host file/class serves every override key — O(1) wrapper files as slots grow
- **Consumer DX mandate (primary constraint)**: consumer template stays byte-identical `<product-card [product]="product" />` — no `<component-override>` element, no `key`/`inputs` bindings at the call site; still no outlet markup, mapper, or accessor call at the consumer
- Per-component wrapper + spec retired — single rendering path, no drift
- Per-slot input typing exact at every call site (per-key `@Input`, no union), no `as` casts anywhere in host/page code
- Registry invariant: token, accessor signature, and factory option untouched
- Layout parity (`display: contents`) and tenant rendering parity (integration spec untouched) preserved

**Non-Goals:**
- Signal inputs in the host (gotcha #6 forbids them for tenant-loaded code)
- Any registry change — new token, factory option, or `injectComponentOverride()` signature edits
- `required: true` on host inputs — impossible on a shared multi-selector class (Decision 2); a loud runtime guard substitutes
- Enabling `strictTemplates` repo-wide (separate concern — see Open Questions)
- Updating phase-4 plan files, archiving other changes, or touching any file outside this change directory
- Renaming impl selectors (`app-`/`fp-`) or tenant files

## Decisions

### 1. Selector: growing list on ONE class (DX mandate)
**Choice:** ONE file `component-override.component.ts`, ONE class `ComponentOverride`, selector = a GROWING list: `'product-card'` today, `'product-card, wl-header, ...'` as slots are added. The neutral tag each consumer already writes is matched BY the shared host — the tag is not a wrapper, it IS the host.
**Why:** Angular requires template element === component selector. A selector LIST satisfies that rule while the consumer keeps writing `<product-card [product]="product" />` — byte-identical template, zero DX change. Angular allows multiple selectors in one component metadata; adding a slot is +1 selector entry.
**Alternatives rejected:**
- (a) Generic `component-override` element with `key`/`inputs` bindings — REJECTED by user verdict: worse consumer DX (loses the semantic tag + typed single-input binding) and the whole point of this change is that the consumer template must not change.
- (b) Per-slot wrapper files (status quo) — O(N) files, the exact cost this change removes.

### 2. Per-key classic `@Input` on the shared class (no keyed-map union)
**Choice:** one classic `@Input()` per slot on the shared class: `@Input() product?: ProductCardInputs` (future slots add `@Input header?: ...`). Inputs are OPTIONAL, not `{ required: true }`.
**Why:**
- **`required: true` is IMPOSSIBLE on a shared class**: Angular validates required inputs per-component-instance against the class's full input set — a second slot's input would trip missing-required validation on every `product-card` instance (and vice versa). Optional inputs + a LOUD runtime throw when the payload is missing is the only workable shape (Decision 5).
- Per-input typing is strictly better than the previous `OverrideInputsMap` union: each call site is checked against EXACTLY its slot's type, forever — no union degradation at N=2 (the previous design's documented degradation disappears entirely).
- Classic `@Input()` (gotcha #6): JIT-loaded tenant tests can't see signal inputs.
- `OverrideInputsMap` union machinery is DROPPED — no longer needed; per-input typing supersedes it.
- `strictTemplates` off today (verified in tsconfig); per-input typing keeps its full value if/when it is enabled (Open Question 1).

### 3. Retire `ProductCardWrapper` — replace, don't coexist
**Choice:** delete `product-card-wrapper.component.ts` + `.spec.ts`; port all spec scenarios (fallback render, override render, input forwarding, consumer grid shape, host presence) into the new host spec; swap the page IMPORT ONLY.
**Why:** two rendering paths = drift + double maintenance; the wrapper's whole surface is expressible on the shared host. `ProductCardInputs` moves to the host module (only wrapper + spec import it today). The page template is byte-identical pre/post, so page-spec grid-child assertions need no retargeting — task states "verify, likely untouched".
**Rollback:** single-PR revert restores wrapper + import.

### 4. Registry key: `localName` read in the CONSTRUCTOR
**Verified:** accessor signature accepts any runtime `name` string; its body calls `inject(COMPONENT_OVERRIDES)` → must run in an injection context. The constructor IS an injection context, and `localName` is available at that point (element exists) — both prerequisites are satisfied simultaneously, so resolution runs ONCE, eagerly, in the constructor: `injectComponentOverride(localName, OVERRIDE_FALLBACKS[localName])`.
**Choice:** `const localName = inject(ElementRef).nativeElement.localName` → the neutral tag IS the registry key → resolve once in the constructor. Shell fallbacks in ONE module-level map: `const OVERRIDE_FALLBACKS = { 'product-card': ProductCard } satisfies Record<string, Type<unknown>>` (`satisfies`, no `as`). Key missing from map AND registry → accessor/fallback throw with the key named (loud failure — a silent empty render hides a wiring bug).
**This ELIMINATES the previous design's Decision 4 lazy dance**: the key no longer arrives post-constructor as an input, so there is no `runInInjectionContext(...)`, no memoized getter, no `EnvironmentInjector` capture. The ONLY thing verified about the accessor is unchanged: `injectComponentOverride(name, fallback)` still executes inside the constructor's injection context.
**Alternatives rejected:**
- (a) Read `COMPONENT_OVERRIDES` directly in the host — duplicates accessor logic and violates the existing main-spec requirement "Each overrideable shell consumer SHALL resolve its component through this accessor".
- (b) Consumer binds `[fallback]="ProductCard"` — reintroduces exactly the plumbing the wrapper exists to hide.
- (c) Key as an input + lazy resolution — only necessary under the rejected generic-element design; gone.

### 5. Payload via `ngOnChanges`, single-input-per-instance, missing payload throws
**Choice:** `ngOnChanges` sets `payload` = the changed input's `currentValue` (`changes[<key input>].currentValue`). The rendered class is `resolved()` (constructor, once); the payload is `payload()`.
**Why:**
- **Single-input-per-instance invariant**: the selector list routes each instance to exactly one slot tag, and each tag binds exactly one input (`[product]` on `product-card`) → per instance at most one input ever fires → `ngOnChanges` can unambiguously assign `payload` from whichever change arrived.
- **Missing payload = LOUD throw** (descriptive, names the slot) — substitutes for the impossible `required: true`, mirrors the old unknown-key throw. A silent empty render would hide a wiring bug.

### 6. Tenant `fp-product-card` rendering path
**Choice:** no tenant-facing change. `NgComponentOutlet` receives the class from the accessor — selector prefixes (`fp-`/`app-`) name only the outlet's dynamic host tag, independent of the host selector list. The consumer template (`<product-card [product]>`) does not change AT ALL, so the tenant reuses the shell ProductsPage unchanged. Tenant integration spec assertions (`fp-product-card` ×7 / `app-product-card` ×0) target outlet hosts → untouched, stays green. Host keeps classic `@Input()` (gotcha #6).

## Risks / Trade-offs

- [selector list must stay in sync with `OVERRIDE_FALLBACKS`] → a selector entry with no fallback entry (or vice versa) is caught by the LOUD constructor throw naming the key; extensibility scenario covers the pair being added together.
- [required-input validation lost on shared class] → accepted impossibility (Decision 2); LOUD runtime guard on missing payload substitutes (Decision 5).
- [page spec asserts `product-card` grid children] → template byte-identical ⇒ assertions expected to pass unchanged; task = VERIFY (likely untouched), not retarget.
- [wrapper spec's scenarios die with the file] → port into host spec BEFORE deletion; deletion task greps zero remaining refs.
- [`localName` coupling — key IS the tag] → deliberate: neutral tag = registry key by design; renaming a slot tag = renaming the key (fallback map + selector entry move together).
- [throw on unknown key / missing payload fails fast] → deliberate; adding a slot = selector + input + fallback entries, covered by extensibility scenario.
- [`display: contents` a11y caveats] → plain container, no semantics — unchanged from prior change, negligible.
- [spec-delta dependency on open change `product-card-wrapper` — its wrapper-host requirement is not yet in the main spec] → MODIFIED requirement cites "from product-card-wrapper change"; archive ordering in Open Question 3.

## Migration Plan

Single-PR, app-internal, TDD order:
1. RED host spec (new file, missing component) → GREEN host + `ProductCardInputs` move.
2. RED page-spec (only if any assertion fails — expected: none) → page import swap (GREEN) → delete wrapper + its spec → grep zero refs.
3. Gates: shell suite, tenant suite (spec UNCHANGED), root `lint` + `build`, browser probe on BOTH ports (4200 + 4201) → `PASS` / `console errors: 0` / exit 0, settled screenshots for eyeball grid parity.

## Open Questions

1. **`strictTemplates`** — enable in `white-label-angular` tsconfig as part of this change (per-input typing makes it cheap for this host) or as a separate change (would touch all template checks)? Not required for this refactor.
2. **Archive ordering** — depends on open change `product-card-wrapper` (workstream 1 done, discovery workstream in plan 4.7 pending): archive that change first, fold both deltas, or land this delta referencing it? Decision needed before archive.

**Resolved by user verdict (recorded, no longer open):**
- ~~Selector name / host shape~~ → RESOLVED: generic `component-override` element REJECTED; consumer template SHALL stay `<product-card [product]="product" />`; ONE class with a growing selector list.
- ~~Second-slot typing~~ → RESOLVED: per-key classic `@Input` on the shared class (no union — the degradation question no longer applies).
