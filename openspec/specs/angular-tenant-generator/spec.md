# angular-tenant-generator Specification

## Purpose

Defines what `@repo/generator` must emit when scaffolding an Angular tenant: the complete file set (Angular workspace config, bootstrap, environments, optional override component), port allocation across existing Angular apps, the opt-in tenant-owned shell (host tag + bootstrap wiring), the generated component-override barrel driven by pre-hooks, and byte-identical Vue output after the `templates/` restructure.

## Requirements

### Requirement: Scaffold emits the Angular tenant file set

The generator SHALL emit a complete Angular tenant: workspace config (`package.json` with the pre-hook trio, `angular.json`, and four tsconfigs — solution `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `tsconfig.scripts.json`), bootstrap assets (`src/index.html`, the `componentOverrides` barrel, `src/main.ts` wiring setupMocks and the `appShell` opt-in wiring), and supporting files (`.eslintrc.cjs`, `.gitignore` incl. `overrides.gen.ts`, `tokens.css`, both environment files, static `import-meta-env.d.ts`).

#### Scenario: Fixture tenant scaffold produces the core files

- **WHEN** the Angular generator scaffolds tenant `zen-plants` with fixture metadata
- **THEN** `package.json`, `angular.json`, the four tsconfigs, `scripts/gen-component-overrides.ts`, `src/index.html`, `src/main.ts`, `src/styles/tokens.css`, both environment files, and `src/import-meta-env.d.ts` all exist in the output directory

#### Scenario: Generated package.json carries the pre-hook trio

- **WHEN** the generated `package.json` is read
- **THEN** `predev`, `prebuild`, and `pretest` each invoke the override-barrel script, and each corresponding main script (`dev`, `build`, `test`) invokes ng via `bun run` semantics so a failed pre-hook aborts it

#### Scenario: Generated angular.json is valid Angular CLI config

- **WHEN** the generated `angular.json` is parsed
- **THEN** it declares the tenant project with the styles array (ui main.css, theme css, shell styles, `src/styles/tokens.css`), `fileReplacements` for environments, `serve.options.prebundle` set to `false`, and test `setupFiles` including the element-internals setup

### Requirement: Dev port is allocated from existing Angular apps

The generator SHALL allocate the dev port as max+1 of `serve.options.port` values found in existing `apps/*-angular/angular.json` files, falling back to 3200 when no Angular app port exists.

#### Scenario: Existing Angular apps occupy 3200 and 3201

- **WHEN** ports 3200 and 3201 are already declared
- **THEN** the scaffolded tenant receives port 3202

#### Scenario: No Angular app exists yet

- **WHEN** no `apps/*-angular/angular.json` declares a serve port
- **THEN** the scaffolded tenant receives port 3200

### Requirement: Tenant shell is opt-in

The generator SHALL offer an `appShell` confirm (default `false`, Angular tenants only) and SHALL make the tenant-owned shell opt-in based on its result. Opting in emits the tenant shell component, host tag, and bootstrap wiring; declining skips the component, keeps the shell's own host tag, and leaves the wiring as a commented hint in `src/main.ts`.

#### Scenario: Opted-in tenant hosts its own shell tag

- **WHEN** a tenant is scaffolded with prefix `zp` and the `appShell` confirm is accepted
- **THEN** `src/app/app.component.ts` contains `selector: 'zp-root'` and `export class ZpApp {}`, `src/index.html` contains `<zp-root></zp-root>` and no `<app-root>`, and `src/main.ts` contains the active line `appShell: () => import('./app/app.component').then((m) => m.ZpApp),`

#### Scenario: Opted-out tenant falls back to the shell tag

- **WHEN** a tenant is scaffolded with the `appShell` confirm declined (default)
- **THEN** `src/app/app.component.ts` is not emitted, `src/index.html` hosts `<app-root>`, and `src/main.ts` contains the same wiring line commented out (`// appShell: () => import('./app/app.component').then((m) => m.{Prefix}App),`)

#### Scenario: fp tenant mirrors the fake-plants reference shape

- **WHEN** a tenant is scaffolded with prefix `fp` and the tenant shell opted in
- **THEN** the emitted shell matches the `apps/fake-plants-angular` `src/app/app.component.ts` shape: selector `fp-root`, class `FpApp`, BEM classes prefixed `fp-`

### Requirement: Optional override component follows the white-label key scheme

When the override-component prompt is confirmed, the generator SHALL emit `src/components/{kebab-name}.component.ts` with class `{Prefix}{PascalName}`, selector `{prefix}-{kebab-name}`, and registry key equal to the filename stem so it matches white-label component keys.

#### Scenario: Override ProductCard with prefix fp

- **WHEN** the tenant is scaffolded with override component `ProductCard` and prefix `fp`
- **THEN** the emitted file is `src/components/product-card.component.ts`, the class is `FpProductCard`, and the registry key used by the generated barrel is `product-card`

### Requirement: Component-override barrel is generated by a pre-hook script

The generator SHALL emit `scripts/gen-component-overrides.ts` that scans `src/components/*.component.ts`, uses each filename stem as its key, and writes `src/components/overrides.gen.ts` with a do-not-edit header comment. The script SHALL fail with a non-zero exit and a descriptive error when a component file contains no `export class`.

#### Scenario: Barrel generated from fixture components

- **WHEN** the script runs with `src/components/product-card.component.ts` exporting `class FpProductCard` present
- **THEN** `src/components/overrides.gen.ts` contains the entry `'product-card': FpProductCard` and the do-not-edit header

#### Scenario: Component file without an export class

- **WHEN** the script runs and a `.component.ts` file has no `export class`
- **THEN** it exits non-zero with an error naming the offending file

### Requirement: Vue scaffold output is unchanged by the templates restructure

Moving template strings into flat `templates/vue.ts` (with shared strings in `templates/common.ts`) SHALL NOT change any rendered Vue output — file set, contents, and byte-level rendering stay identical to before the restructure, including templates re-declared as context-free string constants or read verbatim from `apps/mirror-tenant-vue/` (the static-template SoT, `name` patched for `package.json`).

#### Scenario: Vue template assertions still hold after the move

- **WHEN** the relocated Vue template specs run against the same contexts as before
- **THEN** every emitted string matches the pre-restructure expectation (package.json, main.ts, metadataTs keys, tokens.css)

#### Scenario: Static templates render equal to the mirror-tenant SoT

- **WHEN** the Vue templates `eslintrc`, `vitestSetup`, `vitestConfig`, `mainSpec`, `tsconfigJson`, and `stylesIndex` are rendered, and `packageJson` is rendered with `ctx.name` set to the mirror name
- **THEN** each static equals its `apps/mirror-tenant-vue/` counterpart byte-for-byte, and `packageJson` equals `apps/mirror-tenant-vue/package.json` by JSON equality (only `name` differs when the tenant name is not the mirror name)

### Requirement: Scaffolded naming derives from the domain contract

The scaffold SHALL derive its prefix and fixture metadata keys from `@repo/domain` naming rules: prefix via domain prefix derivation, metadata keys via the domain product-id scheme, so generated keys always equal `register-tenant` ids.

#### Scenario: Prefix and metadata keys for zen-plants

- **WHEN** the generator scaffolds `zen-plants`
- **THEN** the assigned prefix is `zp` and fixture metadata keys are `zen-plants-alpha`, `zen-plants-beta`, `zen-plants-gamma`
