# eslint major blocked — flat-config migration pending

**Date:** 2026-10-22
**Branch:** `origin/renovate/major-eslint-monorepo` @ `a9602fb` (1 commit off `origin/main` @ `e8e5588`)
**Decision:** migrate LATER. Renovate rule added to block eslint major updates.

## Why blocked

Repo lints via **eslintrc CJS** (`.eslintrc.js` + `packages/eslint-config/index.js` / `vue.js`).
ESLint ≥9 defaults to flat config (`eslint.config.*`); v10 removed eslintrc entirely.
Renovate branch bumps `eslint` `^8.57.x` → `^10.0.0` in root + all 9 workspace `package.json`s
but migrates zero config files → lint dies on every package.

## Verification (worktree, `chore/deps-20261022`)

- Baseline `origin/main`: lint 9/9 ✅ (test/build unaffected by lint-only dep — not re-run)
- After merge + `bun install` (eslint 10.13.0, bun lenient on peers): lint **0/9** ❌

Error (verbatim, identical across all 9 tasks):

```
Oops! Something went wrong! :(
ESLint: 10.13.0
ESLint couldn't find an eslint.config.* file.
From ESLint v9.0.0, the default configuration file is now eslint.config.*.
```

## Worktree (kept for inspection)

`.../forma-initiale-wt/deps-20261022` on branch `chore/deps-20261022`.
Revert: `git worktree remove .../forma-initiale-wt/deps-20261022 --force && git branch -D chore/deps-20261022`

## Migration checklist (future work)

1. `eslint.config.js` (flat) per workspace or root-level + `files` globs — or `typescript-eslint`'s `config()` helper.
2. `@eslint/eslintrc` `FlatCompat` only as transitional crutch, not end state.
3. `eslint-plugin-vue` → v10 (`flat/vue2-essential` or `flat/vue3-recommended`); `vue-eslint-parser` → v10.
4. `@typescript-eslint/*` v8.62 — check eslint-10 peer support; bump if needed.
5. Root `devDependencies` hoisting rule stays (bun isolation).
6. Re-run: lint (all 10 workspaces) + test + build + browser probe (`/#/`, `/#/components`).
7. Only then remove the renovate block.

## Renovate rule

`renovate.json` → `packageRules[0]`: `matchPackageNames: ["eslint"]`, `matchUpdateTypes: ["major"]`, `enabled: false`.
Minor/patch updates remain allowed (currently none — eslint 8.57.1 is EOL).
Note: sibling majors (`eslint-plugin-vue@10`, `vue-eslint-parser@10`) NOT blocked — revisit if renovate opens those.
