# angular-test-setup Specification

## Purpose

Provides ONE shared ElementInternals (form-associated custom element) test shim for Angular apps, replacing two divergent per-app `test-setup.ts` copies with a self-installing `@repo/infra` module so jsdom's incomplete FACE surface works identically everywhere.

## Requirements

### Requirement: Shared factory entry point
The `@repo/infra` package SHALL export a `./testing/element-internals` subpath exposing a function factory `elementInternalsShim()` that returns the shim operations (`createFallbackInternals`, `ensureInternalsComplete`, `patchElementInternalsPrototype`, `patchAttachInternals`, `install`), and the module SHALL apply the shim automatically on import (self-installing entry).

#### Scenario: Factory is importable from infra
- **WHEN** a test setup file imports `@repo/infra/testing/element-internals`
- **THEN** the shim is applied without any further call
- **AND** `elementInternalsShim()` is available and returns the shim operations

### Requirement: Full incomplete-FACE surface completion
`ensureInternalsComplete` SHALL complete every missing piece of an incomplete `ElementInternals` instance: FACE methods (`setValidity`, `setFormValue`, `checkValidity`, `reportValidity`), `validity.valid`, the `states` stub (`add`/`delete`/`has`), `validationMessage`, `willValidate`, and `shadowRoot`.

#### Scenario: Incomplete internals are completed
- **GIVEN** internals whose `validity` lacks `valid` and which have no `states`, `validationMessage`, `willValidate`, or `shadowRoot`
- **WHEN** `ensureInternalsComplete` runs
- **THEN** `validity.valid` is `true`, `states.has(...)` returns `false`, `validationMessage` is `""`, `willValidate` is `false`, `shadowRoot` is `null`, and all four FACE methods exist

#### Scenario: Already-complete internals are unchanged
- **GIVEN** fully populated internals
- **WHEN** `ensureInternalsComplete` runs
- **THEN** existing values are preserved (no overwrite of provided data)

### Requirement: Native failures yield a usable fallback
When `attachInternals()` throws, is missing, or returns falsy, the patched path SHALL return a fallback object with the same completed FACE surface instead of propagating the error.

#### Scenario: Native attachInternals throws
- **GIVEN** an `HTMLElement`-like host whose `attachInternals()` throws
- **WHEN** the patched `attachInternals()` is called
- **THEN** a fallback is returned where `validity.valid` is `true`, the FACE methods exist, and `states` has `add`/`delete`/`has`

#### Scenario: attachInternals missing on prototype
- **GIVEN** an `HTMLElement` constructor without `attachInternals`
- **WHEN** the shim is installed
- **THEN** calling `attachInternals()` returns a fallback object rather than throwing

### Requirement: Prototype methods are patched when absent
`patchElementInternalsPrototype` SHALL add stub implementations for any of the four FACE methods missing from `ElementInternals.prototype`, and SHALL leave existing native methods untouched.

#### Scenario: Missing prototype method is stubbed
- **GIVEN** an `ElementInternals` constructor whose `prototype` lacks `setFormValue`
- **WHEN** the prototype patch runs
- **THEN** `prototype.setFormValue` is callable

#### Scenario: Existing native method is preserved
- **GIVEN** an `ElementInternals` prototype with a native `setValidity`
- **WHEN** the prototype patch runs
- **THEN** `prototype.setValidity` is the original function

### Requirement: Idempotent install
`install()` SHALL be idempotent — calling it repeatedly MUST NOT stack multiple wrappers around `attachInternals()`.

#### Scenario: Double install wraps once
- **WHEN** `install()` is called twice
- **THEN** `HTMLElement.prototype.attachInternals` has exactly one wrapper layer

### Requirement: Missing globals are a safe no-op
In an environment without `ElementInternals` and/or `HTMLElement` (e.g. node test env), `install()` SHALL do nothing and MUST NOT throw.

#### Scenario: Node environment without DOM globals
- **GIVEN** no `ElementInternals` and no `HTMLElement` on `globalThis`
- **WHEN** `install()` runs
- **THEN** no error is thrown and no global is created

### Requirement: Both Angular apps consume the shared shim
`white-label-angular` and `fake-plants-angular` SHALL load the shim through the shared infra entry in `angular.json` `setupFiles`, and SHALL NOT keep app-side `test-setup.ts` files or shell `src/utils` shim sources.

#### Scenario: setupFiles point at the infra shim source
- **WHEN** either Angular app's `angular.json` `setupFiles` is read
- **THEN** it lists a workspace-relative path resolving to `packages/infra/src/testing/element-internals.ts` (Angular unit-test `setupFiles` accepts paths only — `path.join(workspaceRoot, entry)` — so the bare `@repo/infra/testing/element-internals` specifier cannot be used; deep path mirrors the existing TEMPORAL styles wiring, consolidate with 4.7)

#### Scenario: No per-app shim sources remain
- **WHEN** the app source trees are inspected
- **THEN** `apps/white-label-angular/src/test-setup.ts` and `apps/fake-plants-angular/src/test-setup.ts` do not exist
- **AND** `apps/white-label-angular/src/utils/{dom-shim.ts,dom-shim.spec.ts,type-guards.ts}` do not exist

#### Scenario: Test suites stay green
- **WHEN** `bun run test` (infra) and `bunx ng test --watch=false` for both Angular apps run
- **THEN** all suites pass with the shared shim only
