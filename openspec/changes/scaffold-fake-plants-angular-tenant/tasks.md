# Tasks

## 1. Scaffold files

- [x] 1.1 Create `apps/fake-plants-angular/` with `package.json` (name `fake-plants-angular`, deps mirrored exactly from `white-label-angular` plus `white-label-angular: workspace:*`, scripts `build: ng build`, `test: ng test --watch=false`) and verify workspace links it after `bun install` (`bun pm ls --all | grep white-label-angular` from tenant dir)
- [x] 1.2 Create `angular.json` mirroring the shell's (`browser: src/main.ts`, `prebundle: false` serve option, `styles` array incl. tenant `src/styles/tokens.css`, env file replacements, `unit-test` builder + `setupFiles`), project key renamed to `fake-plants-angular`, and verify `diff apps/white-label-angular/angular.json apps/fake-plants-angular/angular.json` shows only project-name/path differences
- [x] 1.3 Create `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json` copied from the shell and verify `diff` against shell counterparts shows no differences
- [x] 1.4 Create minimal `src/main.ts` bootstrapping via `createWhiteLabelApp` from `white-label-angular/app` with no overrides, `src/styles/tokens.css`, `src/test-setup.ts` (replicating shell `ensureInternalsComplete` shim), placeholder `src/environments/environment.ts` / `environment.development.ts` (tenantId `fp`; consumed by dev `fileReplacements` — MSW wiring deferred to follow-up), `src/index.html`, and a smoke spec; verify files exist and `src/main.ts` imports only `white-label-angular/app` exports

## 2. Link + verification

- [x] 2.1 Run `bun install` at repo root and verify `apps/fake-plants-angular` resolves `white-label-angular` from the workspace (no `@repo` scope on the shell dep)
- [x] 2.2 Run `bunx ng test --watch=false` in `apps/fake-plants-angular` and verify exit code 0
- [x] 2.3 Run `bun run build` at repo root and verify the `fake-plants-angular` build task succeeds in Turborepo
- [x] 2.4 Verify `git status --porcelain apps/white-label-angular` is empty (shell untouched — no file duplication)

## 3. Human verification (factory proof)

- [ ] 3.1 Run `cd apps/fake-plants-angular && bun run dev`, open the app in a browser, and verify: page renders (not blank), nav shows shell defaults (Products / Components), Products page renders its page shell (loading or error state acceptable — MSW deferred to follow-up), browser console free of factory/bootstrap/DI errors (network errors excepted) — record the observation in this checkbox on completion
- [ ] 3.2 Record human sign-off that the factory boots with zero overrides (override checks — routes/shell/metaMap — deferred to plan 4.6 Manual Confirmation after 4.6.2–4.6.6)
