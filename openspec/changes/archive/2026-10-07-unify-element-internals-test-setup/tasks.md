# Tasks

## 1. Infra module (TDD)

- [x] 1.1 RED: write `packages/infra/src/testing/element-internals.spec.ts` covering factory export + self-install, full FACE surface completion, already-complete preservation, native-throw fallback, missing-`attachInternals` fallback, prototype patch (stub absent / preserve native), idempotent double-install, missing-globals safe no-op (node env, stubbed globals with save/restore) — verify `cd packages/infra && bun run test` FAILS (module does not exist yet)
- [x] 1.2 GREEN: implement factory `elementInternalsShim()` in `packages/infra/src/testing/element-internals.ts` (D4 factory shape, D3 full FACE surface loop-driven, D5 single documented boundary cast, D6 idempotency marker, top-level self-install side effect) — verify `cd packages/infra && bun run test` passes, spec file green
- [x] 1.3 Add `"./testing/element-internals": "./src/testing/element-internals.ts"` to `packages/infra/package.json` `exports` — verify subpath import resolves (infra spec + `bun run lint` green)

## 2. Unify apps

- [x] 2.1 `apps/white-label-angular`: set `setupFiles` to `../../packages/infra/src/testing/element-internals.ts` in `angular.json` (builder accepts paths only); delete `src/test-setup.ts` and `src/utils/{dom-shim.ts,dom-shim.spec.ts,type-guards.ts}`; drop `src/test-setup.ts` from `tsconfig.spec.json` `include` — verify `grep -rn "test-setup\|dom-shim\|type-guards" apps/white-label-angular/{angular.json,tsconfig.spec.json,src}` returns no stale refs and `bunx ng test --watch=false` green in that app
- [x] 2.2 `apps/fake-plants-angular`: set `setupFiles` to `../../packages/infra/src/testing/element-internals.ts` in `angular.json` (same deep-path wiring as shell); delete `src/test-setup.ts`; drop `src/test-setup.ts` from `tsconfig.spec.json` `include` — verify no stale refs via same grep and `bunx ng test --watch=false` green in that app
- [x] 2.3 Confirm tenant integration spec `products-page.integration.spec.ts` stays GREEN UNCHANGED (FACE controls still render — proves shim loaded via infra entry in tenant too)

## 3. Verify + docs

- [x] 3.1 Full gates: `cd packages/infra && bun run test`; `bunx ng test --watch=false` in both Angular apps; `bun run lint`; `bun run build` — all green
- [x] 3.2 Update `docs/integrations/form-associated-custom-elements.md` §2 source reference from shell `test-setup.ts`/`dom-shim` paths to `@repo/infra/testing/element-internals` — verify grep in that file finds no deleted-path references
- [x] 3.3 Human confirmation of unified test setup (both apps' specs green with shared shim only)
