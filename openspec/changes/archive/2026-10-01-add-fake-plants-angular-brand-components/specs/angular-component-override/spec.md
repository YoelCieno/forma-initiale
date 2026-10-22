## Purpose

Lets tenants replace any white-label Angular component with their own implementation, keyed by component name, so tenants hold only diffs from the shell and the Angular layer reaches parity with Vue's `componentDirs` override mechanism.

## ADDED Requirements

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
Adding support for overriding an additional white-label component SHALL require only resolving that component through the accessor in its consumer — no new injection token, no new factory option, no change to the registry mechanism.

#### Scenario: Second overrideable component
- **WHEN** a developer registers `injectComponentOverride('<name>', Default)` in another shell consumer
- **THEN** that consumer SHALL honor `componentOverrides['<name>']` with zero registry changes

### Requirement: Auto-discovery research
The change SHALL include a research artifact evaluating how Angular could auto-discover tenant components from a `src/components/` directory (filename match wins over white-label) — the equivalent of Vite's `import.meta.glob` — covering options such as a custom build/builder plugin, a generated barrel module, or a schematic/codegen step, and SHALL conclude with a recommendation that preserves the existing registry API.

#### Scenario: Research deliverable
- **WHEN** implementation completes
- **THEN** a research document SHALL exist under `.opencode/thoughts/research/` comparing candidate auto-discovery mechanisms, their AOT compatibility, maintenance cost, and a migration path from the explicit map, with a stated recommendation
