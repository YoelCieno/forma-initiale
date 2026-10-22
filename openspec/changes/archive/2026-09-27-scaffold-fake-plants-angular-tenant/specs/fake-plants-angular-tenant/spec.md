# Spec Delta

## Purpose

Defines the scaffold contract for the `fake-plants-angular` tenant app: a standalone workspace app that consumes the `white-label-angular` shell as a dependency, builds and tests green, and duplicates no shell source — proving the Angular layer mechanism before generator automation.

## ADDED Requirements

### Requirement: Workspace tenant registration
The tenant SHALL live at `apps/fake-plants-angular`, be discoverable by the existing `apps/*` workspace glob, and declare `white-label-angular` as a `workspace:*` dependency without a `@repo` scope.

#### Scenario: Workspace links tenant
- **WHEN** `bun install` runs at the repository root
- **THEN** `apps/fake-plants-angular` SHALL resolve `white-label-angular` from the workspace, and the tenant SHALL NOT re-declare `@angular/*` versions that diverge from the shell's dependency contract

#### Scenario: Tenant uses shell, not @repo packages directly for layer code
- **WHEN** the tenant imports shell bootstrap code
- **THEN** imports SHALL come from `white-label-angular` package exports (e.g. `white-label-angular/app`), not from `white-label-angular/src/*` internals

### Requirement: Tenant builds and tests green
The tenant SHALL provide `build` and `test` scripts (`ng build`, `ng test --watch=false`) that succeed under Turborepo.

#### Scenario: Build succeeds
- **WHEN** `bun run build` runs for the tenant
- **THEN** Angular application build SHALL exit successfully

#### Scenario: Tests pass
- **WHEN** `bunx ng test --watch=false` runs in `apps/fake-plants-angular`
- **THEN** the test run SHALL exit 0 with no failing specs

### Requirement: No shell file duplication
The tenant SHALL contain only tenant-specific files (config, bootstrap, styles, pages) and SHALL NOT copy `white-label-angular` source files into its tree.

#### Scenario: Shell remains authoritative
- **WHEN** shell source changes in `apps/white-label-angular/src/`
- **THEN** those changes SHALL reach the tenant through the workspace dependency, with no mirrored copies inside `apps/fake-plants-angular`

#### Scenario: Layer fallback available
- **WHEN** the tenant boots without overriding a shell page, component, or style
- **THEN** the shell's defaults SHALL render, so the tenant only holds diffs from the shell

### Requirement: Manual factory boot verification
Before sign-off, a human SHALL serve the tenant in a browser and verify the app boots through `createWhiteLabelApp()` with zero overrides, rendering shell defaults.

#### Scenario: Factory renders shell defaults in browser
- **WHEN** a human runs the tenant dev server (`ng serve`) and opens the app in a browser
- **THEN** the page SHALL render (not blank), the nav SHALL show the shell's default links (Products / Components), the Products page SHALL render its page shell (loading or error state acceptable — mock wiring is deferred to a follow-up change), the browser console SHALL be free of factory/bootstrap/DI errors (network errors from unwired mocks excluded), and the verification SHALL be recorded before sign-off
