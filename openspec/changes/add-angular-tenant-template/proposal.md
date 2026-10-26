# Proposal

## Why

`@repo/generator` can only scaffold Vue tenants — Angular tenants must be hand-copied from `fake-plants-angular`, which defeats the generator's purpose and blocks plan 4.7 (Angular tenant generator). Plan 4.7.0 already fixed the Vue-side regressions (metadata → infra, framework-aware MSW paths), so the Angular template is the remaining piece; its template strings also need the `templates/` layout split (flat `vue.ts` / `angular.ts` / `common.ts`, revised 2026-10-25 from the vue/angular folder split decided in the 2026-10-11 explore session).

## What Changes

- Restructure `packages/generator/src/templates/` into flat `templates/vue.ts` + `templates/angular.ts` + `templates/common.ts` (shared `tokensCss`/`metadataTs`/`gitkeep`) with sibling specs; update imports. Templates that take no `ctx` are plain `string` constants handed straight to `renderTemplate` (pinion `getCallable` accepts non-callables) instead of `(_ctx) =>` wrappers with `eslint-disable` comments. Vue scaffold output stays byte-identical.
- New `angular-tenant.tpl.ts` Pinion pipeline mirroring `vue-tenant.tpl.ts`, reusing plain `TenantContext` (Angular adds no context fields).
- New Angular template strings: `package.json` (ng scripts + `predev`/`prebuild`/`pretest` override-barrel hooks), `angular.json` (allocated `serve.options.port`, styles array of deep refs, `fileReplacements`, `prebundle: false`, test `setupFiles` element-internals), tsconfigs, `src/index.html` (host `<app-root>` — tenant always uses the shell root), `.eslintrc.cjs`, `.gitignore` (incl. `overrides.gen.ts`), `main.ts` (bootstrapApplication + setupMocks + generated componentOverrides barrel), `tokens.css`, `environment.ts`/`environment.development.ts`, static `src/import-meta-env.d.ts`, optional override component `${stem}.component.ts`.
- Generalize `findNextDevPort(cwd, framework)` — one strategy record per FW (dir suffix, config file, port extractor, base port): vite.config regex/3000 for vue+react, angular.json `serve.options.port`/3200 for angular. `isVueTenantDir` removed; vue call site passes `'vue'`.
- `scripts/gen-component-overrides.ts` template: scans `src/components/*.component.ts`, key = filename stem, emits `src/components/overrides.gen.ts` with do-not-edit header; loud error when a component file has no `export class`.
- Prompts: reuse framework-neutral `tenantPrompts` unchanged — no Angular-specific prompts.
- Naming/prefix/metadata keys come from `@repo/domain` `naming()` (landed in change `move-tenant-naming-to-domain`) — no local re-declaration.

## Capabilities

### New Capabilities
- `angular-tenant-generator`: Scaffolding behavior of the Angular tenant template — emitted file set, port allocation from `angular.json`, the shell-root host tag, pre-hook override-barrel generation, and Vue-output parity after the `templates/` restructure.

### Modified Capabilities
<!-- none — tenant-generator keeps its framework-agnostic wording; angular-* runtime specs describe shell behavior, not scaffolding -->

## Impact

- `packages/generator/` — new `generators/angular-tenant.tpl.ts`, `templates/{vue,angular,common}.ts`, Angular port allocator, prompts addition; imports re-pointed after restructure. Vue specs move but assertions unchanged.
- Root `package.json` — no change here (`generate:angular-tenant` script is plan 4.7.2, out of scope).
- `apps/fake-plants-angular` — reference shape only, untouched (retrofit is plan 4.7.4).
- Consumers of naming rules: already `@repo/domain`; no app/infra changes.
- Reference: plan `.opencode/plans/core-foundation/phase-4/4.7-generator-angular.md` §4.7.1.
