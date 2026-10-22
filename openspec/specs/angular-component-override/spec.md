# angular component override Specification

## Purpose

Lets tenants replace any white-label Angular component with their own implementation, keyed by component name, so tenants hold only diffs from the shell and the Angular layer reaches parity with Vue's `componentDirs` override mechanism.

## Requirements

### Requirement: Component override registry
The Angular shell's `createWhiteLabelApp()` SHALL accept a `componentOverrides` option mapping white-label component name keys (kebab-case, matching the white-label component file name, e.g. `'product-card'`) to tenant component classes. The factory SHALL provide the map through a single root-level injection token whose default value is an empty map.

#### Scenario: No overrides registered
- **WHEN** the app bootstraps without `componentOverrides`
- **THEN** every white-label component consumer SHALL render the shell's default component

#### Scenario: Override registered by key
- **WHEN** `componentOverrides` contains `'product-card': TenantProductCard`
- **THEN** the Products page SHALL render `TenantProductCard` instances instead of the shell `ProductCard`, with inputs bound through the component outlet

### Requirement: Generic override accessor
The shell SHALL expose a generic accessor that, given a component name key and a fallback component class, returns the tenant-registered class when present and the fallback otherwise. Each overrideable shell consumer SHALL resolve its component through this accessor rather than importing the concrete class directly for rendering.

#### Scenario: Accessor returns fallback
- **WHEN** the registry has no entry for a requested key
- **THEN** the accessor SHALL return the provided shell fallback class

#### Scenario: Accessor returns tenant component
- **WHEN** the registry contains an entry for the requested key
- **THEN** the accessor SHALL return that tenant component class

### Requirement: Input contract for overridden components
An overridden component SHALL accept the same input surface as the component it replaces (same names, compatible types), so the shell consumer can bind product data identically regardless of which implementation renders.

#### Scenario: Inputs bound through outlet
- **WHEN** the Products page renders a product through an overridden component
- **THEN** the component SHALL receive `id`, `title`, `description`, `image`, `imageFamily`, `price`, `previousPrice`, and `rate` inputs with the product's values

### Requirement: Extensibility by key
Adding support for overriding an additional white-label component SHALL require only three entries in the existing host file — one selector entry, one optional classic `@Input`, one shell fallback entry — plus the consumer's neutral-tag element in its template; no new file, no new injection token, no new factory option, no change to the registry mechanism, and no change to existing slots' consumer templates.

#### Scenario: Second overrideable component
- **GIVEN** the shell declares `'<name>'` in the host selector list, adds `@Input <name>?: <Name>Inputs`, and adds a fallback for `'<name>'`
- **WHEN** the app boots with `componentOverrides['<name>']` set and a consumer renders `<[name] [someInput]="...">`
- **THEN** the tenant class SHALL render through the existing registry with zero registry changes
- **AND** all files touched SHALL be within `component-override.component.ts` (plus the consumer template usage)

### Requirement: Auto-discovery research
The change SHALL include a research artifact evaluating how Angular could auto-discover tenant components from a `src/components/` directory (filename match wins over white-label) — the equivalent of Vite's `import.meta.glob` — covering options such as a custom build/builder plugin, a generated barrel module, or a schematic/codegen step, and SHALL conclude with a recommendation that preserves the existing registry API.

#### Scenario: Research deliverable
- **WHEN** implementation completes
- **THEN** a research document SHALL exist under `.opencode/thoughts/research/` comparing candidate auto-discovery mechanisms, their AOT compatibility, maintenance cost, and a migration path from the explicit map, with a stated recommendation

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

### Requirement: Wrapper host for overrideable components
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

### Requirement: Wrapper resolves through the registry
The wrapper SHALL resolve its rendered class through the existing generic override accessor keyed `'product-card'` with the shell `ProductCard` as fallback — no second registry, no wrapper-specific factory option.

#### Scenario: No override registered
- **WHEN** the registry has no `'product-card'` entry
- **THEN** the wrapper SHALL render the shell ProductCard (host tag `app-product-card` inside the wrapper)

#### Scenario: Tenant override registered
- **WHEN** the registry maps `'product-card'` to a tenant card class
- **THEN** the wrapper SHALL render the tenant card (tenant host tag inside the wrapper) and no shell card host SHALL appear

### Requirement: Layout parity with direct rendering
The wrapper host SHALL NOT change grid layout: the inner card remains the effective grid item, so a grid rendered through wrappers is visually identical to the same grid rendered with cards as direct children.

#### Scenario: Grid child positioning
- **WHEN** the products grid uses auto-fill columns and renders through `product-card` wrappers
- **THEN** cards SHALL occupy the same grid tracks as they did when rendered as direct grid children

### Requirement: Generated override discovery
Tenant component overrides SHALL register without editing `main.ts`: a codegen script scans the tenant `src/components/` directory for `*.component.ts` files, derives the registry key from the filename stem (white-label key semantics: `product-card.component.ts` → `'product-card'`), and emits a generated barrel module consumed as the `componentOverrides` value. The existing registry API, accessor, and factory option SHALL remain unchanged — discovery only populates the same map.

#### Scenario: Adding a file registers the override
- **WHEN** a developer adds `src/components/<key>.component.ts` to the tenant app and the next pre-hook (`dev`/`build`/`test`) runs
- **THEN** the generated barrel SHALL export `'key': <exported class>` and the app SHALL render the tenant component for that slot
- **AND** `main.ts` SHALL NOT have been edited

#### Scenario: Filename stem is the key
- **WHEN** the codegen script processes `product-card.component.ts`
- **THEN** the emitted key SHALL be `'product-card'` (stem only — no tenant prefix magic)
- **AND** the tenant file SHALL be named exactly like the white-label counterpart (Vue `componentDirs` parity)

#### Scenario: Regeneration is automatic
- **WHEN** `ng serve`, `ng build`, or `ng test` starts via package scripts
- **THEN** the codegen script SHALL run first so the barrel reflects the current file set

#### Scenario: Explicit entry stays an escape hatch
- **WHEN** both a generated entry and an explicit `main.ts` entry exist for the same key
- **THEN** the explicit entry SHALL win (merge order: explicit > generated)
