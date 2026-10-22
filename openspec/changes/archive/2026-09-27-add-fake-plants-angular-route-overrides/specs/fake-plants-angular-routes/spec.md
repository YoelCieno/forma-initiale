# Spec Delta

## Purpose

Defines how the `fake-plants-angular` tenant overrides the white-label Angular shell's routing: adding a tenant-owned About page at `/about`, removing the shell's Components route, and keeping every non-overridden shell route intact.

## ADDED Requirements

### Requirement: Tenant route extension
The tenant SHALL add an `about` route through the `extendRoutes` option of `createWhiteLabelApp()`, and that route SHALL render a tenant-owned AboutPage component. Routes not listed in `extendRoutes` SHALL remain as declared by the shell.

#### Scenario: Navigating to the tenant About page
- **WHEN** the tenant app boots with an `extendRoutes` entry for path `about` and the user navigates to `/about`
- **THEN** the tenant's AboutPage component SHALL render

#### Scenario: Shell routes survive extension
- **WHEN** `extendRoutes` is provided
- **THEN** the shell's default routes (empty path → Products, `components` → ComponentsPage) SHALL still be present in the router configuration

### Requirement: Shell route omission
The tenant SHALL remove the shell's `components` route by passing its path to `omitRoutePaths`, and no other shell route SHALL be removed by that omission.

#### Scenario: Components route is not routable
- **WHEN** the tenant boots with `omitRoutePaths` containing `components` and the user navigates to `/components`
- **THEN** no route SHALL match and the shell's ComponentsPage SHALL NOT render

#### Scenario: Other routes unaffected by omission
- **WHEN** `omitRoutePaths` contains only `components`
- **THEN** the Products route (empty path) and the tenant's `about` route SHALL remain routable

### Requirement: Angular path convention for overrides
Override values SHALL use slash-less route paths matching the shell's `Routes.path` declarations exactly (Angular router convention, e.g. `about`, `components`) — not the Vue router convention with a leading slash.

#### Scenario: Omission matches shell path declaration
- **WHEN** `mergeRoutes` filters routes against `omitRoutePaths`
- **THEN** each entry SHALL be compared by exact string equality to `route.path` as declared in the shell (`components`, not `/components`), so the filter removes the intended route

#### Scenario: Extension path declared slash-less
- **WHEN** the tenant declares the About route
- **THEN** its `path` SHALL be `about` (no leading slash), consistent with the shell's `Routes` and navigable at URL `/about`

