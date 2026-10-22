# Tasks

## 1. RED — specs first

- [x] 1.1 `packages/generator/src/templates/index.spec.ts`: RED specs — `metadataTs` writes infra path + barrel export line, keys `${name}-alpha/beta/gamma`; `mainTs` fixture imports `<camel>Map` from `@repo/infra`; `packageJson` includes `@repo/infra` dep. Verify: `cd packages/generator && vp test src/templates/index.spec.ts` fails on new assertions
- [x] 1.2 `packages/generator/src/generators/vue-tenant.tpl.spec.ts`: RED spec — no `apps/<t>-vue/metadata.ts` emitted (fixture + none modes), updated file counts. Verify: same command, file failing
- [x] 1.3 `packages/generator/src/msw/copy-service-worker.spec.ts`: RED specs — angular target copies to `apps/<name>-angular/public/`, no hardcoded `-vue` in helper, vue behavior unchanged. Verify: `vp test src/msw/copy-service-worker.spec.ts` fails

## 2. GREEN — templates + helper

- [x] 2.1 Repurpose `metadataTs` template → emit `packages/infra/src/metadata/<name>.ts` with keys `${name}-alpha/beta/gamma`; `mainTs` fixture branch imports from `@repo/infra`, none branch keeps commented hint; `packageJson` gains `@repo/infra`. Verify: task 1.1 specs green
- [x] 2.2 Barrel wiring: append `export { <camelName>Map } from './metadata/<name>'` to `packages/infra/src/index.ts` — idempotent (line present → no-op), file-exists → skip content write. Verify: 1.1 + new idempotency spec green; run twice, exactly one export line
- [x] 2.3 Delete app-root `metadata.ts` render from `vue-tenant.tpl.ts`; update file-count expectations. Verify: 1.2 green
- [x] 2.4 De-hardcode `copyServiceWorker`: add `framework` param, derive source shell + target + messages. Verify: 1.3 green

## 3. Parity + curation safety

- [x] 3.1 Add `apps/fake-plants-vue/src/main.spec.ts` (factory smoke mirroring `fake-plants-angular/src/main.spec.ts`, incl. appShell resolution case). Verify: `bun run test --filter=@repo/../apps/fake-plants-vue` — or full `bun run test` — green with new file
- [x] 3.2 Idempotency regression: scaffold fixture tenant whose `metadata/fake-plants.ts` exists → file byte-unchanged, barrel line exactly once. Verify: spec in 2.2 covers; manual run of generator for fake-plants confirms

## 4. Verification gate

- [x] 4.1 Full gate: `bun run test && bun run build && bun run lint` all green. Verify: commands exit 0
- [x] 4.2 E2E scaffold: run generator for a throwaway tenant (fixture mode), confirm `packages/infra/src/metadata/<name>.ts` + barrel line + `@repo/infra` import + `main.ts` metaMap resolves, then delete generated artifacts. Verify: manual inspection checklist from proposal "What Changes" passes
