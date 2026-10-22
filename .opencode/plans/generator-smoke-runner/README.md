# Generator Smoke Runner — Plan

**Goal:** Add a KISSME CLI smoke runner that verifies `@repo/generator` output for a framework (Vue first) end-to-end — generate a throwaway tenant non-interactively, build + test it, then guarantee the repo is left pristine. No source/test files are consumed by the runner beyond the generator itself; it never mutates repo state permanently.

## Phase Table

| #   | Phase        | Doc                          | Status     |
| --- | ------------ | ---------------------------- | ---------- |
| 1   | Smoke runner | [`phase-1.md`](./phase-1.md) | ✅ COMPLETE |

## Links

- [`phase-1.md`](./phase-1.md) — single-phase implementation doc (Status / Goal / Behavior Specs / Tasks / Validation Checks / Manual Confirmation)
- [`../core-foundation/phase-4/4.7-generator-angular.md`](../core-foundation/phase-4/4.7-generator-angular.md) — generator phase this runner verifies
- [`../README.md`](../README.md) — plans index
