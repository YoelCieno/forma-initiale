# Tasks

## 1. Domain helper (TDD RED → GREEN)

- [x] 1.1 RED: create `packages/domain/src/helpers/naming.spec.ts` covering spec-delta scenarios — `getProductNames('zen-plants')` → `['zen-plants-alpha','zen-plants-beta','zen-plants-gamma']`, single-word `x` case, `derivePrefix` for `fake-plants`→`fp`, `my-cool-app`→`mc`, `solo`→`so`; verify it FAILS (module does not exist)
- [x] 1.2 GREEN: create `packages/domain/src/helpers/naming.ts` factory (`export function naming()` returning `getProductNames` + `derivePrefix`, return-type interface in same file) and export from `packages/domain/src/index.ts`; verify `bun run test --filter=@repo/domain` passes

## 2. Generator consumers re-point (no behavior change)

- [x] 2.1 `packages/generator/src/msw/copy-service-worker.ts`: import `naming()` from `@repo/domain`, delete local `getProductNames` impl, keep `serviceWorker().getProductNames` re-export; verify `bun run test --filter=@repo/generator` (`copy-service-worker.spec.ts`) passes
- [x] 2.2 `packages/generator/src/helpers/cases.ts`: import + re-export `derivePrefix` from `@repo/domain`, delete local impl; verify `helpers/cases.spec.ts` + `helpers/index` barrel consumers pass
- [x] 2.3 `packages/generator/src/templates/index.ts`: build `metadataTs` keys via domain `getProductNames` (byte-identical output), delete stale "Keys MUST match getProductNames" comment; verify `templates/index.spec.ts` key assertions + `helpers/infra-metadata.spec.ts` pass

## 3. Verification gate

- [x] 3.1 Run full generator + domain suites (`bun run test --filter=@repo/generator`, `--filter=@repo/domain`) — all green, zero import churn in specs
- [x] 3.2 Run `bun run lint` — no new ESLint errors (layer direction: generator → domain import only)
- [x] 3.3 Grep gate: no remaining local declarations — `getProductNames`/`derivePrefix` defined only in `packages/domain/`; verify via `grep -rn "const derivePrefix\|const getProductNames" packages apps` shows domain only
