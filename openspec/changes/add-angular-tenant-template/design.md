# Design

## Context

Vue pipeline (`vue-tenant.tpl.ts`) = prompt → caseTransform → framework/port assign → renderSetup → renderSourceFiles → renderConditionalAssets → renderTestInfra → infraMetadata → copyServiceWorker → installDeps → verifyScaffold, originally with all strings in flat `templates/index.ts`, now split into flat `templates/{vue,angular,common}.ts`. Angular reference app = `apps/fake-plants-angular` (angular.json styles deep-refs, `prebundle: false`, port 3201, element-internals setupFiles). Naming rules now live in `@repo/domain` `naming()` (change `move-tenant-naming-to-domain`, archived). See proposal.md for why; specs/angular-tenant-generator defines behavior.

## Goals / Non-Goals

**Goals:**
- Angular tenant scaffolding at parity with Vue's pipeline stages; generated app builds/tests green (validation gate, plan §Validation Checks).
- Zero Vue behavior change through the `templates/` restructure.
- Naming only via `@repo/domain` — no local re-declaration (tenant-naming spec).

**Non-Goals:**
- `generate:angular-tenant` root script + register-tenant e2e — plan 4.7.2.
- E2E regenerate/build/test of a fresh tenant, `fake-plants-angular` retrofit, §4.6.7 verdict record — plan 4.7.3/4.7.4.
- `prebundle` re-evaluation — plan 4.7.5 spike (template emits current working value `false`).
- Shared `TenantContext` refactor, React generator, generator `package.json` script wiring in root.

## Decisions

1. **`templates/` restructure first, then Angular adds.** Flat sibling files — `templates/vue.ts` (Vue strings + spec), `templates/angular.ts` (Angular strings + spec), `templates/common.ts` (framework-shared `tokensCss`, `metadataTs`, `gitkeep`) — re-point imports in `vue-tenant.tpl.ts`, `angular-tenant.tpl.ts`, `helpers/infra-metadata.ts` (+ any `../templates` import sites), no barrel indirection — plan wording is "update imports". Revised 2026-10-25: one folder + `index.ts` per framework was rejected in favour of sibling files (shallower tree, one import path per framework, `common.ts` makes the shared set explicit). Relocated specs running green = proof of decision 6 (byte parity).
   - *Alt A*: `templates/<fw>/index.ts` folders — rejected: extra directory layer per framework with exactly one module in it, and shared code would still need a third location.
   - *Alt B*: thin `templates/index.ts` barrel re-exporting both — rejected: hides the framework split the restructure exists to make visible.

1a. **Context-free templates are either string constants or zero-arg SoT readers — never wrappers.** Any template that takes no `ctx` is one of: a plain `const x: string` (`gitignore`, `envExample`, …) handed directly to `renderTemplate`, or a zero-arg fn reading its file from the `mirror-tenant-*` SoT (decision 8). Pinion's `getCallable` returns non-callables as-is and invokes callables with ctx, so both forms satisfy `Callable<T, C> = T | ContextCallable<T, C>`; zero-arg fns ignore the ctx arg. This removes the `(_ctx: TenantContext) =>` + `eslint-disable-next-line @typescript-eslint/no-unused-vars` pattern. `.env` and `.env.example` share one `envFile(tenantId)` builder so their bodies cannot drift.

2. **Plain `TenantContext` — no Angular context type.** An `AngularTenantContext` was introduced with an `appShell` field, then removed with the option (see decision 4). Angular currently adds no context fields; re-introduce a context subtype only when a genuinely Angular-only prompt lands.
   - *Alt*: full duplicate interface — rejected: pure field-list drift with zero benefit.

3. **`findNextDevPort` becomes generic: `(cwd, framework: Framework)` + strategy record (user choice 2026-10-23).** One `portScans` record keyed by `Framework` carrying `{ dirSuffix, configFile, extract, firstPort }` — vue/react = `-vue`/`-react` suffix, `vite.config.ts`, regex `devPort:`, base 3000; angular = `-angular`, `angular.json` (JSON.parse, valid JSON — regex justified only for vite.config), `projects.*.serve.options.port`, base 3200. `isVueTenantDir` deleted; extractor distinction lives in the record's `extract` closures, not if/else inside one extractor. `vue-tenant.tpl.ts` call site updated to `findNextDevPort(ctx.cwd, 'vue')`. React row = vite scan (planned Vite shell; no `-react` apps → base 3000, inert).
   - *Alt A (rejected earlier, user reversed): second fn `findNextAngularPort` beside `findNextDevPort` — two entry points for one responsibility, duplicated max+1/fallback logic.
   - *Alt B: branch inside `extractDevPort` on framework — if/else grows per FW and mixes two file formats in one fn; passing extractor via strategy param (chosen) isolates formats per closure.

4. **Prompts: reuse `tenantPrompts` unchanged.** No Angular-specific prompts (the `appShell` confirm was rejected — see open decision). `assignFramework(import.meta.url)` already infers `'angular'` from the generator filename — reuse as-is. Tenant nav customization, if ever needed, becomes a nav component landing in Vue first, then Angular — not a generator option.

5. **`gen-component-overrides.ts` = template string written to `outDir/scripts/`, executed as `bun scripts/gen-component-overrides.ts` from the pre-hook trio** (bun runs TS natively; `bun run <script>` fires pre/post hooks, fails-closed). Emitted barrel header = do-not-edit comment (same precedent as `import-meta-env.d.ts`).

6. **TDD order mirrors plan:** RED spec → move/restructure → green parity specs → Angular template strings + tpl pipeline (RED assertions per artifact) → GREEN. The `gen-component-overrides` fixture spec (`product-card` → `'product-card': FpProductCard`, no-export-class error) is **pulled forward from plan 4.7.3 into this change** because the capability delta now specifies the script's behavior — plan 4.7.3's copy of that task should be dropped when 4.7.3 is executed (recorded so the plan and tasks.md don't double-implement).

7. **Override component files use classic fields, no signal inputs** — the generated `${stem}.component.ts` is plain (title passthrough), sidestepping gotcha #6 (JIT invisible signal inputs) entirely; template must not introduce `input()` on scaffolded components.

8. **`mirror-tenant-*` apps are the SoT for static templates + `package.json` (user 2026-10-27).** For each framework, ctx-free templates that exist verbatim in the mirror app (`eslintrc`, `vitestSetup`, `vitestConfig`, `mainSpec`, `tsconfigJson`, `stylesIndex` for vue) are read as text at render time from repo-root `apps/mirror-tenant-<fw>/`; `packageJson` is JSON-read there via `readFileData` (`msw/file-io.ts`) with only `name` patched to `${ctx.name}-<fw>`. Reads resolve **repo-root relative** (`import.meta.dirname` from the generator module) — not `ctx.cwd`: specs use `cwd: '/tmp'`, so cwd reads would require seeding mirror fixtures into every tmp dir, and the generator is workspace-internal (always runs in-repo). Parametrized templates (`indexHtml`, `mainTs`, `envFile`/`envExample`/`env`, `componentVue`, `viteConfig`) stay inline. Vue lands first; `angular.ts` statics move to the same mechanism only after human review of the mapping (gate: tasks 1.5-1.7) — `apps/mirror-tenant-angular` does not exist yet.
   - *Alt (rejected): inline constants + byte-parity test* — keeps a duplicated source: every mirror edit requires a manual template sync and a failing test to notice; read-from-SoT makes the mirror authoritative with zero drift window. (Rejected per user direction; parity scenario retained as the regression gate.)

## Risks / Trade-offs

- [Wrong angular.json deep-ref paths → unstyled/unbuildable tenant (gotcha #1/#5)] → copy structure from `fake-plants-angular/angular.json` verbatim; parity asserted by "valid Angular CLI config" scenario.
- [Bare-attr bindings in generated `index.html`/templates fine, but generated components using `fe-*` need `[prop]` bindings (gotcha #5)] → scaffolded `index.html` hosts shell `<app-root>` only; no `fe-*` property bindings in generated TS/HTML yet.
- [`setupFiles` workspace-root-relative path breaks if tenant moves] → copy the working relative path from `fake-plants-angular` (empirically green).
- [Restructure churns git history of specs] → pure `git mv` + import re-point in one commit-sized task; assertions untouched.
- [Pre-commit runs full suite on every commit — slow during multi-task change] → run filtered `bun run test --filter=@repo/generator` before committing.

## Migration Plan

Single PR; revert = restore flat templates + delete `angular-tenant.tpl.ts`. No data/config migration; no app touched.

## Open Questions

None — scope pinned by user to plan §4.7.1 (CLI wiring = 4.7.2, e2e = 4.7.3, retrofit = 4.7.4, spike = 4.7.5 stay out).
