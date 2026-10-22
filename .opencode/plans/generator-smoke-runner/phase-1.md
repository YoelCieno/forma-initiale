# Phase 1. Generator Smoke Runner

**Status:** ✅ COMPLETE

**Goal:** Add a KISSME CLI smoke runner that verifies `@repo/generator` output for a framework (Vue first) without touching repo state. The runner generates a tenant non-interactively, builds + tests it via Turbo, and always cleans up after itself (generated `apps/smoke-<framework>`, `packages/infra/src/metadata/smoke.ts`, and the `packages/infra/src/index.ts` barrel line are removed/restored in a `finally` block unless `--keep` is passed).

Angular/React templates do not exist yet — when `--framework` is not `vue` the runner SHALL fail fast with a clear "not implemented" error.

## Behavior Specs

### Requirement: Non-Interactive Tenant Generation

The runner SHALL generate a tenant tenant non-interactively by building a pre-filled `TenantContext` and injecting a stubbed `pinion.prompt`, so `generate(ctx)` runs to completion without reading stdin.

#### Scenario: Vue tenant generated without prompts

- GIVEN a valid framework argument `vue`
- WHEN the runner invokes the Vue template `generate(ctx)`
- THEN the generator receives a pre-filled `TenantContext` whose prompt answers are already resolved
- AND `pinion.prompt` is stubbed via `createMockContext`
- AND no interactive prompt is ever displayed
- AND the generated files land under `apps/smoke-vue`

#### Scenario: Unsupported framework rejected

- GIVEN a framework argument other than `vue` (e.g. `angular`, `react`)
- WHEN the runner starts generation
- THEN it exits non-zero before touching the filesystem
- AND it reports a clear "framework not implemented" error

### Requirement: Build And Test Verification

The runner SHALL run `bun x turbo run build --filter=smoke-<framework>` followed by `bun x turbo run test --filter=smoke-<framework>`, and SHALL exit non-zero if either command fails.

#### Scenario: Green build and test

- GIVEN the generated tenant builds and its tests pass
- WHEN the runner executes build then test
- THEN both commands exit 0
- AND the runner proceeds to cleanup and reports success

#### Scenario: Fail-fast on build failure

- GIVEN the generated tenant fails to build
- WHEN the build command exits non-zero
- THEN the runner stops before running tests
- AND the runner exits non-zero
- AND cleanup still runs (see cleanup requirement)

### Requirement: Guaranteed Cleanup

The runner SHALL, in a `finally` block, remove `apps/smoke-<framework>`, delete `packages/infra/src/metadata/smoke.ts`, and restore the pre-run content of `packages/infra/src/index.ts` — UNLESS the `--keep` flag is set.

#### Scenario: Repo pristine after a successful run

- GIVEN the runner completed (success or failure) without `--keep`
- WHEN cleanup executes in the `finally` block
- THEN `apps/smoke-<framework>` no longer exists
- AND `packages/infra/src/metadata/smoke.ts` no longer exists
- AND `packages/infra/src/index.ts` is byte-identical to its pre-run content
- AND `git status --porcelain` is clean

#### Scenario: Keep flag preserves artifacts

- GIVEN the runner was invoked with `--keep`
- WHEN the run completes
- THEN cleanup is skipped
- AND the generated tenant + infra changes remain on disk for inspection

### Requirement: Opt-In Browser Probe

The browser probe SHALL be an opt-in `--probe` flag (NOT mandatory). When enabled, it starts the generated tenant's dev server and asserts an HTTP 200 response whose body contains the `id="app"` marker.

#### Scenario: Probe disabled by default

- GIVEN the runner is invoked without `--probe`
- WHEN the run executes
- THEN no dev server is started
- AND no HTTP assertion is made

#### Scenario: Probe enabled

- GIVEN the runner is invoked with `--probe`
- WHEN the generated tenant's dev server responds
- THEN the runner asserts HTTP 200
- AND the runner asserts the response body contains `id="app"`
- AND the dev server is torn down during cleanup

## Tasks

### Setup

- [x] `src/verify/options.ts` + spec — parse `--framework`, `--probe`, `--keep` (fail on unknown/missing framework)
- [x] `src/verify/orchestrator.ts` + spec — step order (generate → files → install → build → test → probe), fail-fast stop on first failing step, guaranteed cleanup via `finally` unless `--keep`, summary output + exit code
- [x] `src/verify/index.ts` barrel — explicit named re-exports (no `export *`)
- [x] `scripts/verify.ts` CLI entry — wire real adapters (fs, spawn, fetch, snapshot/restore of `packages/infra/src/index.ts`)

### Verification

- [x] Root `package.json` script `verify:generator`
- [x] Acceptance run: `bun run verify:generator` exits 0 AND `git status --porcelain` is clean afterwards

## Validation Checks

- [x] `cd packages/generator && bun x vp test src` is green
- [x] Acceptance run `bun run verify:generator` exits 0
- [x] Repo is pristine after the run — `git status --porcelain` empty (cleanup verified)
- [x] `--keep` leaves the generated tenant + infra changes in place for inspection
- [x] `--probe` (opt-in) starts a dev server, asserts HTTP 200 + `id="app"`, then tears it down

## ✅ Manual Confirmation

- [ ] Human runs `bun run verify:generator` (and optionally `bun run verify:generator --probe`) on demand and confirms the repo is left clean afterwards
