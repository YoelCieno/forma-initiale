# Tasks

## 1. templates/ restructure (TDD parity gate)

- [x] 1.1 `git mv` `templates/index.ts` + `index.spec.ts` → `templates/vue/`, re-point every `../templates` import (`vue-tenant.tpl.ts`, generator barrel, specs); verify relocated specs pass unchanged (`cd packages/generator && vp test src/templates/vue/index.spec.ts`) — byte-parity scenario
- [x] 1.2 Run full `bun run test --filter=@repo/generator` — all green post-move, zero assertion edits (verify by `git diff` touching only paths/imports)
- [x] 1.3 Re-layout flat (revised 2026-10-25, supersedes folder+`index.ts`): `templates/{vue,angular}.ts` + specs, shared `tokensCss`/`metadataTs`/`gitkeep` extracted to `templates/common.ts`; `vue-tenant.tpl.ts`, `angular-tenant.tpl.ts`, `helpers/infra-metadata.ts` imports re-pointed; verify suite green + rendered Vue output unchanged
- [x] 1.4 Context-free templates (`tsconfigJson`, `eslintrc`, `gitignore`, `vitest*`, `mainSpec`, `stylesIndex`, `importMetaEnvDts`, `gitkeep`, `envExample`) converted from `(_ctx) =>` wrappers to plain `string` constants; `.env`/`.env.example` share one `envFile(tenantId)` builder; 15 `eslint-disable-next-line @typescript-eslint/no-unused-vars` comments deleted; verify specs updated to read constants and suite green
- [x] 1.5 RED — mirror-tenant SoT parity: `vue.spec.ts` asserts rendered `eslintrc`/`vitestSetup`/`vitestConfig`/`mainSpec`/`tsconfigJson`/`stylesIndex` byte-equal to their `apps/mirror-tenant-vue/` counterparts (`.eslintrc.cjs`, `vitest.setup.ts`, `vitest.config.ts`, `src/main.spec.ts`, `tsconfig.json`, `src/styles/index.ts`); rendered `packageJson` with `ctx.name: 'mirror-tenant'` parses-equal to `apps/mirror-tenant-vue/package.json` (JSON equality); verify FAILS (still inline strings)
- [x] 1.6 GREEN — `templates/vue.ts`: `packageJson` reads mirror `package.json` via `readFileData` (repo-root resolved), patches only `name` → `${ctx.name}-vue`; 6 ctx-free statics read as text from repo-root `apps/mirror-tenant-vue/`; `indexHtml`/`mainTs`/`envFile`/`envExample`/`env`/`componentVue`/`viteConfig` unchanged; verify parity specs pass + `bun run test --filter=@repo/generator` green
- [ ] 1.7 Human revision gate — `angular.ts` template→SoT mapping reviewed by user BEFORE any Angular SoT code (blocker: `apps/mirror-tenant-angular` absent; resolves the `it.skip` `@repo/domain` test at `angular.spec.ts:54`)

## 2. Angular primitives (TDD RED → GREEN)

- [x] 2.1 RED: extend `port-allocator.spec.ts` — generic signature: fixture `apps/x-angular/angular.json` ports 3200/3201 → `findNextDevPort(cwd, 'angular')` = 3202; no angular apps → 3200; existing vue fixtures → `findNextDevPort(cwd, 'vue')` unchanged (3000/vite.config regex); verify FAILS
- [x] 2.2 GREEN: refactor `port-allocator.ts` — `portScans` strategy record (`satisfies Record<Framework, PortScan>`), `findNextDevPort(cwd, framework)`, `isVueTenantDir` deleted, per-FW `extract` closures (vite regex / angular JSON.parse); update `vue-tenant.tpl.ts` call site to `findNextDevPort(ctx.cwd, 'vue')`; verify allocator specs + full generator suite pass
- [x] 2.3/2.4 RED→GREEN then reworked: `angularTenantPrompts` spread + `appShell` confirm were implemented, then removed per design decision 4 (no Angular-specific prompts; `tenantPrompts` reused as-is). Final state: only `tenantPrompts` exported; spec asserts no `appShell` prompt; verify passes

## 3. Angular template strings (TDD RED → GREEN)

- [x] 3.1 RED: create `templates/angular.spec.ts` asserting: `packageJson` carries ng scripts + predev/prebuild/pretest trio invoking override-barrel script; `angularJson` parses with styles deep-refs, fileReplacements, `serve.options.port`, `prebundle: false`, test setupFiles element-internals; `indexHtml` always uses shell host tag `<app-root>`; `import-meta-env.d.ts` static content; verify FAILS (module missing)
- [x] 3.2 GREEN: create `templates/angular.ts` (package.json, angular.json, tsconfigs ×3, index.html, eslintrc, gitignore w/ overrides.gen.ts, main.ts, environments ×2, import-meta-env.d.ts, override `${stem}.component.ts`; `tokens.css` + `gitkeep` re-exported from `templates/common.ts`); verify `templates/angular.spec.ts` passes
- [x] 3.3 RED: override-component assertions — scaffold ctx `ProductCard`/prefix `fp` → `product-card.component.ts`, class `FpProductCard`, selector `fp-product-card`; verify FAILS (superseded: appShell branch removed per design decision 4)
- [x] 3.4 GREEN: wire override branch; verify spec passes (matches spec-delta scenario "Override ProductCard"); appShell branch removed per design decision 4

## 4. Override-barrel script (pulled from plan 4.7.3 — see design §Decisions 6)

- [x] 4.1 RED: fixture spec `templates/angular.gen-component-overrides.spec.ts` — temp dir with `product-card.component.ts` (`export class FpProductCard`) + noise file → emits `overrides.gen.ts` with `'product-card': FpProductCard` + do-not-edit header; `.component.ts` without `export class` → non-zero exit naming the file; verify FAILS (currently red: `genComponentOverridesScript` not exported yet)
- [x] 4.2 GREEN: template string `genComponentOverridesScript` in `templates/angular.ts` (scan `src/components/*.component.ts`, stem keys, loud error) + render to `scripts/gen-component-overrides.ts`; verify spec passes

## 5. angular-tenant pipeline

- [x] 5.1 Reworked: `AngularTenantContext` removed — pipeline reuses plain `TenantContext`; verify `bun run test --filter=@repo/generator` compiles clean
- [x] 5.2 RED: `generators/angular-tenant.tpl.spec.ts` — pipeline stages render expected files into temp outDir (setup/source/conditional/testInfra), metadata → infra via reused `infraMetadata`, MSW via `serviceWorker().copyServiceWorker` with framework `angular`, prefix from domain `naming()` (`zen-plants` → `zp`), port assigned via `findNextDevPort(cwd, 'angular')`; verify FAILS
- [x] 5.3 GREEN: create `angular-tenant.tpl.ts` mirroring Vue pipeline (prompt `tenantPrompts` → caseTransform → assignFramework → assignAngularPort → renders → infraMetadata → copyServiceWorker → installDeps → verifyScaffold with Angular file list); verify pipeline spec passes
- [x] 5.4 Run `bun run test --filter=@repo/generator` + `--filter=@repo/domain` — full green, no import churn in Vue specs

## 6. Verification gate

- [x] 6.1 `bun run lint` — no new ESLint errors (generator → domain import only, arrow fns in templates)
- [x] 6.2 Grep gate: `derivePrefix`/`getProductNames` NOT re-declared in `packages/generator/`; Angular templates import from `@repo/domain`
- [x] 6.3 `openspec validate add-angular-tenant-template --strict` passes; plan cross-check — no 4.7.2/4.7.3/4.7.4/4.7.5 scope leaked into the diff
