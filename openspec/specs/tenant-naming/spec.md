# tenant-naming Specification

## Purpose

Owns tenant naming rules as pure functions in `@repo/domain`: the mock product-id scheme a tenant registers under and the short app prefix derived from a tenant name, so every layer (generator, future Angular template, apps) consumes one shared contract instead of local copies.

## Requirements

### Requirement: Product id scheme is defined by the domain

`@repo/domain` SHALL expose a product-name helper that maps a tenant name to exactly three mock product ids: `${name}-alpha`, `${name}-beta`, `${name}-gamma`. The scheme MUST be the single source consumed by `register-tenant`/MSW registration and by fixture-metadata key generation.

#### Scenario: Scheme output for a hyphenated tenant name

- **WHEN** the helper is called with `zen-plants`
- **THEN** it returns `['zen-plants-alpha', 'zen-plants-beta', 'zen-plants-gamma']`

#### Scenario: Scheme output for a single-word tenant name

- **WHEN** the helper is called with `x`
- **THEN** it returns `['x-alpha', 'x-beta', 'x-gamma']`

#### Scenario: Generator metadata keys derive from the same scheme

- **WHEN** the generator renders fixture metadata for tenant `my-tenant`
- **THEN** every emitted key equals the corresponding entry returned by the domain helper for `my-tenant`

### Requirement: Tenant prefix derivation is defined by the domain

`@repo/domain` SHALL expose a prefix helper mapping a tenant name to its short app prefix: for a name with two or more hyphen-separated segments, the prefix is the first character of the first two segments; otherwise it is the first two characters of the name.

#### Scenario: Two-segment name

- **WHEN** the helper is called with `fake-plants`
- **THEN** it returns `fp`

#### Scenario: Three-segment name uses first two segments only

- **WHEN** the helper is called with `my-cool-app`
- **THEN** it returns `mc`

#### Scenario: Single-segment name falls back to first two characters

- **WHEN** the helper is called with `solo`
- **THEN** it returns `so`

### Requirement: Naming rules have no duplicate implementation outside the domain

Generator and app code SHALL consume both naming rules via `@repo/domain` exports. The product-id scheme MUST NOT be re-declared in `@repo/generator`, and the prefix rule MUST NOT be re-declared outside the domain — a consumer that needs them imports them.

#### Scenario: Register-tenant ids come from the domain helper

- **WHEN** `copyServiceWorker` registers MSW config for tenant `zen-plants`
- **THEN** the ids written into `mocked-data.json` equal the domain helper's output for `zen-plants`

#### Scenario: Prefix used by templates comes from the domain helper

- **WHEN** the generator derives `ctx.prefix` during scaffolding
- **THEN** the value equals the domain prefix helper applied to `ctx.name`
