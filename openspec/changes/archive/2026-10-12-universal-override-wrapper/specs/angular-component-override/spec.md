# Spec Delta

> RFC 2119 keywords (SHALL/MUST/SHOULD) apply to all requirements below; scenarios use GIVEN/WHEN/THEN.

## ADDED Requirements

### Requirement: Universal override host
The shell SHALL provide ONE host class `ComponentOverride` in ONE file (`apps/white-label-angular/src/components/component-override.component.ts`) whose selector SHALL be a GROWING list — `'product-card'` today, extended with one entry per additional slot (e.g. `'product-card, wl-header, ...'`). The host SHALL resolve its rendered class through the existing generic override accessor, passing the host element's `localName` as the key and the shell's default component for that key as fallback; shell fallbacks SHALL be declared in ONE module-level map inside the same file, not per consumer. Payloads SHALL be carried by per-key optional classic `@Input()` properties on the shared class, and a missing payload SHALL fail loudly at runtime.

**Consumer DX mandate:** the shell consumer template SHALL remain `<product-card [product]="product" />` — byte-identical to the pre-change template. The generic element form `<component-override key="..." [inputs]="...">` SHALL NOT be used.

#### Scenario: Consumer template surface (byte-identical)
- **GIVEN** the shell ProductsPage renders the product grid
- **WHEN** the page template is inspected before and after implementation
- **THEN** it SHALL still render each grid child as `<product-card [product]="product" />`
- **AND** the only consumer-side change SHALL be the import/`imports` entry swapping `ProductCardWrapper` for `ComponentOverride`
- **AND** the template SHALL contain no `component-override` element, no `key`/`[inputs]` bindings, no component-outlet element, no local input-mapper function, and no override-accessor call

#### Scenario: Host element IS the registry key
- **GIVEN** a `product-card` element created by the consumer template
- **WHEN** `ComponentOverride` constructs, it SHALL read `inject(ElementRef).nativeElement.localName` inside its constructor (injection context and key value both available) and SHALL resolve ONCE via `injectComponentOverride(localName, OVERRIDE_FALLBACKS[localName])` — unchanged accessor, no `runInInjectionContext` indirection
- **AND** no registry, token, or factory option beyond the existing `COMPONENT_OVERRIDES` map SHALL be introduced

#### Scenario: Payload from the matching per-key input
- **GIVEN** the shared class declares `@Input() product?: ProductCardInputs` (and one optional `@Input` per future slot)
- **WHEN** a consumer binds `[product]="product"`, `ngOnChanges` SHALL set the payload to that input's `currentValue`
- **AND** exactly one input SHALL fire per instance (the selector routes each instance to one slot tag)
- **AND** the payload SHALL be forwarded to the component outlet with no type assertion

#### Scenario: Missing payload fails loudly
- **GIVEN** a host instance whose slot input was never bound
- **WHEN** it attempts to render
- **THEN** it SHALL throw a descriptive error naming the slot — no silent empty render (loud guard substituting for `required: true`, which is impossible on a shared multi-selector class)

#### Scenario: Tenant override through the universal host
- **GIVEN** the registry maps `'product-card'` to a tenant card class
- **WHEN** the shell ProductsPage renders the grid through `ComponentOverride` hosts (selector entry `product-card`)
- **THEN** the tenant card hosts SHALL render and no shell card host SHALL appear (impl prefixes `fp-`/`app-` unaffected — the outlet names its own host tag)

#### Scenario: Unknown key fails loudly
- **GIVEN** a host element whose `localName` has no entry in the shell fallback map and no registry entry
- **WHEN** the host attempts resolution in its constructor
- **THEN** it SHALL throw a descriptive error naming the key — no silent empty render

#### Scenario: New slot costs three entries in the SAME file
- **GIVEN** a second overrideable white-label component with neutral tag `'<name>'`
- **WHEN** a developer adds one selector entry, one `@Input` property, and one fallback entry — all in `component-override.component.ts` — and writes `<[name] [someInput]="...">` in a consumer template
- **THEN** the host SHALL render that slot through the same registry
- **AND** no new wrapper component file SHALL have been created

### Requirement: Typed per-key input pairing
Each overrideable slot's payload input on the shared host class SHALL be typed against that slot's own input shape (e.g. `@Input() product?: ProductCardInputs`), so call-site bindings are checked against the slot's exact input type by the Angular template checker. The host SHALL forward the payload to the component outlet directly — no type assertion at the binding or forwarding site. Keyed-union map machinery (`OverrideInputsMap`) SHALL NOT be used: per-input typing supersedes it.

#### Scenario: Single slot is exact
- **GIVEN** the host declares `@Input() product?: ProductCardInputs`
- **WHEN** the ProductsPage binds a product object to `[product]`
- **THEN** the binding SHALL be checked against `ProductCardInputs` exactly (no union widening at any slot count)
- **AND** neither the host nor the page SHALL use `as` casts for the binding or the outlet forwarding

#### Scenario: New slot widens nothing
- **WHEN** a developer adds a slot by declaring a new typed `@Input` on the shared class
- **THEN** existing slots' input types SHALL remain exact (no union degradation)
- **AND** the new call site SHALL be checked against its own input type

## MODIFIED Requirements

### Requirement: Wrapper host for overrideable components (MODIFIED from product-card-wrapper change)
The per-slot wrapper element (selector `product-card`, single `[product]` input) SHALL be replaced by the single growing-selector `ComponentOverride` host for all overrideable slots, and per-component wrapper files SHALL be removed — ONE host class, no parallel rendering paths. The consumer template SHALL remain `<product-card [product]="product" />` (the `product-card` selector entry now routes to `ComponentOverride`). Grid layout SHALL remain unchanged: the host uses `display: contents` so the inner card remains the effective grid item.

#### Scenario: No per-slot wrapper remains
- **GIVEN** implementation completes
- **WHEN** the repo is inspected
- **THEN** `product-card-wrapper.component.ts` and its spec SHALL be absent
- **AND** the ProductsPage template SHALL remain byte-identical (`<product-card [product]="product" />` inside the `@for` loop)
- **AND** each `product-card` grid child SHALL be an instance of `ComponentOverride`, not `ProductCardWrapper`
- **AND** no shell `ProductCardWrapper` hosts SHALL appear in the rendered page (impl hosts `app-product-card`/`fp-product-card` are unaffected)

#### Scenario: Grid child positioning
- **GIVEN** the products grid uses auto-fill columns
- **WHEN** cards render through `ComponentOverride` hosts (`product-card` elements with `display: contents`)
- **THEN** cards SHALL occupy the same grid tracks as direct-children rendering (visual parity, no extra gaps)

### Requirement: Extensibility by key (MODIFIED from angular-component-override)
Adding support for overriding an additional white-label component SHALL require only three entries in the existing host file — one selector entry, one optional classic `@Input`, one shell fallback entry — plus the consumer's neutral-tag element in its template; no new file, no new injection token, no new factory option, no change to the registry mechanism, and no change to existing slots' consumer templates.

#### Scenario: Second overrideable component
- **GIVEN** the shell declares `'<name>'` in the host selector list, adds `@Input <name>?: <Name>Inputs`, and adds a fallback for `'<name>'`
- **WHEN** the app boots with `componentOverrides['<name>']` set and a consumer renders `<[name] [someInput]="...">`
- **THEN** the tenant class SHALL render through the existing registry with zero registry changes
- **AND** all files touched SHALL be within `component-override.component.ts` (plus the consumer template usage)
