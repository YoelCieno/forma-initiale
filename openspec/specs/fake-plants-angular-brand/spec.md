# fake plants angular brand Specification

## Purpose

Defines the `fake-plants-angular` tenant's visual identity: green brand design tokens and the tenant ProductCard rendering plant product photos, matching `fake-plants-vue` parity checks in plan 4.6.5.

## Requirements

### Requirement: Green brand token overrides
The tenant SHALL define green brand overrides (`--brand-fill-*`, `--brand-border-*`, `--brand-on-*`) in its `src/styles/tokens.css`, using the same values as `fake-plants-vue`, loaded through the tenant's existing `angular.json` styles wiring with no shell style changes.

#### Scenario: Brand tokens applied
- **WHEN** the tenant app renders
- **THEN** `--brand-fill-normal`, `--brand-fill-loud`, `--brand-border-quiet`, `--brand-on-normal` and the remaining brand tokens SHALL resolve to the fake-plants green values (e.g. `--brand-fill-normal: #16a34a`)

#### Scenario: Shell untouched
- **WHEN** the tenant tokens are compared with the shell's `tokens.css`
- **THEN** the shell file SHALL contain no fake-plants green values

### Requirement: Tenant photo ProductCard
The tenant SHALL provide a `fp-product-card` component that renders each product as a photo card — `fe-img` media sourced from `getProductImageUrl(id)`, header with title and price, description, and a footer `fe-rating` — visually matching `fake-plants-vue`'s ProductCard, styled only with design-token custom properties (no hardcoded colors) under `fp-product-card__*` BEM classes.

#### Scenario: Photo rendered per product
- **WHEN** the Products page renders product `p` through the tenant card
- **THEN** the card SHALL show an `fe-img` whose `src` equals `getProductImageUrl(p.id)`, the product title and price in the header, the description, and a read-only rating of `p.rate`

#### Scenario: No hardcoded styles
- **WHEN** the component's styles are inspected
- **THEN** all colors and spacing SHALL reference CSS custom properties, never literal color values

### Requirement: ProductCard override active on Products page
The tenant SHALL register its card under the `'product-card'` override key in `main.ts`, so the Products page renders `fp-product-card` instances while every non-overridden white-label component keeps rendering shell defaults.

#### Scenario: Override visible on Products page
- **WHEN** the tenant app's Products page loads with mocked 7-plant data
- **THEN** the grid SHALL contain `fp-product-card` elements (one per product), not `app-product-card`

#### Scenario: Non-overridden components fall back
- **WHEN** any other white-label component renders in the tenant app
- **THEN** it SHALL render the shell default implementation

### Requirement: Parity verification vs fake-plants-vue
Human visual inspection SHALL confirm the tenant's Products page and tokens match `fake-plants-vue` (green brand, photo cards) before plan 4.6 sign-off.

#### Scenario: Human sign-off
- **WHEN** a human serves both `fake-plants-vue` and `fake-plants-angular` side by side
- **THEN** brand color and ProductCard layout differences SHALL be absent or explicitly accepted, and the check recorded in plan 4.6
