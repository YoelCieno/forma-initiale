# Spec Delta

## ADDED Requirements

### Requirement: Wrapper host for overrideable components
The shell SHALL provide a wrapper element with the neutral selector `product-card` and a single typed input accepting the product card input object. Consumers rendering an overrideable product card SHALL bind only that element with the product — no component-outlet markup, no input-mapper helper, and no override-accessor call in the consumer.

#### Scenario: Consumer template surface
- **WHEN** the shell ProductsPage renders the product grid
- **THEN** each grid child SHALL be a `product-card` element bound to one product
- **AND** the ProductsPage template SHALL contain no component-outlet element, no local input-mapper function, and no override-accessor call

#### Scenario: Input forwarding
- **WHEN** a `product-card` element receives a product with title, price, and rate
- **THEN** the rendered card (shell or tenant) SHALL display that product's title, price, and rate

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
