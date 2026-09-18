## Purpose

Angular white-label shell achieves feature parity with Vue shell for page rendering, navigation, design tokens, metadata injection, and test coverage — enabling tenants to extend Angular apps with the same capabilities as Vue apps.

## ADDED Requirements

### Requirement: CSS design token parity
The Angular shell SHALL import the same CSS custom properties as the Vue shell, including brand colors, semantic colors, layout dimensions, font size scale, and border radius tokens.

#### Scenario: Tokens available at runtime
- **WHEN** Angular app renders any page
- **THEN** all `--wa-*`, `--color-*`, `--fs-*`, `--min-width-layout`, `--max-width-layout`, and `--wa-border-radius-*` custom properties SHALL be defined and usable by components

### Requirement: Base CSS parity
The Angular shell SHALL include the same base CSS rules as the Vue shell, including `h2` italic styling, `.subheading__h3` font-size/color/italic, and `.card__h4` margin.

#### Scenario: Component headings styled correctly
- **WHEN** ComponentsPage renders section headings
- **THEN** `.subheading__h3` elements SHALL display with `font-size: var(--fs-s)`, `color: var(--color-text-muted)`, and `font-style: italic`

### Requirement: AppShell navigation
The Angular shell SHALL provide navigation between the Products page (`/`) and Components page (`/components`) via a top nav bar with RouterLinks.

#### Scenario: Nav renders both links
- **WHEN** Angular app loads
- **THEN** a `<nav>` element SHALL contain links to `/` (Products) and `/components` (Components)

#### Scenario: Active link styling
- **WHEN** user navigates to a route
- **THEN** the corresponding nav link SHALL be visually distinguished (bold + underline + brand color)

### Requirement: MetaMap metadata injection
The Angular shell SHALL provide a `metadata.ts` file exporting `frameworkMap` and pass it as `metaMap` to `createWhiteLabelApp()` in `main.ts`, so `ProductsService` receives metadata overrides via `META_MAP_INJECTION_KEY`.

#### Scenario: Products receive metadata overrides
- **WHEN** Angular app loads with metaMap configured
- **THEN** `ProductsService` SHALL transform products using the provided metadata (title, description, image, imageFamily) instead of defaults

#### Scenario: No metaMap degrades gracefully
- **WHEN** Angular app loads without metaMap
- **THEN** `ProductsService` SHALL use default product metadata (name as title, empty description, code icon)

### Requirement: Layout CSS uses design tokens
The Angular shell SHALL use CSS custom properties (`--min-width-layout`, `--max-width-layout`) for layout dimensions instead of hardcoded pixel/rem values.

#### Scenario: ComponentsPage responsive grid
- **WHEN** ComponentsPage renders its grid layout
- **THEN** `grid-template-columns` SHALL use `var(--min-width-layout)` and `max-width` SHALL use `var(--max-width-layout)`

### Requirement: ProductsPage signal behavior tests
The Angular ProductsPage spec SHALL test signal-driven state transitions: loading state renders fe-loader, loaded state renders product cards, error state renders error message.

#### Scenario: Loading state
- **WHEN** ProductsService signals loading=true and products=[]
- **THEN** the rendered DOM SHALL contain `fe-loader` element

#### Scenario: Loaded state
- **WHEN** ProductsService signals loading=false and products=[{id, title, price, ...}]
- **THEN** the rendered DOM SHALL contain `app-product-card` elements matching the product count

#### Scenario: Error state
- **WHEN** ProductsService signals error="Failed to load"
- **THEN** the rendered DOM SHALL contain the error text in a `.products-page__error` element

### Requirement: No debug logging in production presenter
The `toProductView` presenter function SHALL NOT emit console.log statements during normal operation.

#### Scenario: Clean transform output
- **WHEN** `toProductViewList` transforms products
- **THEN** no console.log output SHALL be produced
