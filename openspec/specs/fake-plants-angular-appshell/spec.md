# fake-plants-angular-appshell Specification

## Purpose

Lets a tenant replace the white-label Angular shell's root component through the `appShell` option, so the tenant owns the app shell (nav, layout) while every non-overridden shell feature keeps working.

## Requirements

### Requirement: appShell option resolves the tenant root component
The Angular shell's `createWhiteLabelApp()` SHALL accept an `appShell` option holding a lazy import of the tenant root component, and the resolved application root SHALL be that component when the option is provided. When the option is absent, the root SHALL remain the shell's default `App` component.

#### Scenario: tenant provides appShell
- **WHEN** `createWhiteLabelApp({ appShell })` is called with a lazy import resolving a tenant root component
- **THEN** the returned `root` is the tenant root component

#### Scenario: no appShell falls back to shell default
- **WHEN** `createWhiteLabelApp({})` is called without `appShell`
- **THEN** the returned `root` is the shell's default `App` component

#### Scenario: appShell combines with other options
- **WHEN** `createWhiteLabelApp()` is called with `appShell` together with `extendRoutes` / `omitRoutePaths` / `metaMap`
- **THEN** the root is the tenant component AND route merging / omission / metaMap injection behave exactly as without `appShell`

### Requirement: tenant root component owns the navigation
The `fake-plants-angular` tenant SHALL provide its own root component, passed via `appShell`, that renders the top nav with links to Products (`/`) and About (`/about`) and does NOT render a link to the omitted Components page. The active nav link SHALL be visually distinguished using router active-state styling with exact-match for Products.

#### Scenario: nav renders tenant links only
- **WHEN** the tenant app boots
- **THEN** the nav shows Products and About links and shows no Components link

#### Scenario: active link highlighted
- **WHEN** the current route is `/`
- **THEN** the Products link is styled as active and the About link is not

#### Scenario: router outlet renders routes
- **WHEN** the user navigates to `/about`
- **THEN** the tenant AboutPage renders inside the root component's router outlet

### Requirement: tenant root styles are tenant-owned and visually match fake-plants-vue
Tenant nav styles SHALL live only in the tenant (BEM class names, design-token CSS custom properties — no hardcoded colors) and SHALL NOT modify the shell's `App` component. Visual parity with `fake-plants-vue`'s nav (spacing, colors, active-link treatment) SHALL be confirmed by human inspection, since style parity is not test-assertable.

#### Scenario: shell untouched
- **WHEN** the tenant appShell override is active
- **THEN** the shell's `App` component source is unchanged and the shell still renders its own nav when bootstrapped without overrides

#### Scenario: human visual check
- **WHEN** a human compares the tenant's nav against `fake-plants-vue` `App.vue` nav side by side
- **THEN** they confirm matching layout, spacing, and active-link styling

### Requirement: tenant tests assert shell override
The tenant's test suite SHALL assert that `createWhiteLabelApp()` with the tenant `appShell` resolves the tenant root component, and existing zero-override tests SHALL continue to pass (shell default fallback stays covered).

#### Scenario: override test green
- **WHEN** the tenant test suite runs
- **THEN** the appShell-override test asserts root === tenant component and passes

#### Scenario: existing tests stay green
- **WHEN** the tenant test suite runs after the override is wired
- **THEN** the pre-existing zero-override tests still pass
