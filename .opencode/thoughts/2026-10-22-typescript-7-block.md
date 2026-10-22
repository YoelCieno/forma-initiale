# typescript major blocked — no TS7 support in toolchain (upstream)

**Date:** 2026-10-22
**Branch:** `origin/renovate/typescript-7.x` @ `95ac644` (1 commit off `origin/main` @ `e8e5588`)
**Decision:** DISCARD (worktree + local branch removed) + block `typescript` major in `renovate.json`.

## Why blocked

Renovate PR bumps `typescript` everywhere: root `^6.0.3` → `^7.0.0`, 9 workspaces
`5.9.3`/`~6.0.2` → `7.0.2`/`~7.0.0`. TS 7 (Go port / tsgo) changes the runtime API
surface — the ecosystem toolchain does not support it (2026-10-22 state):

| Tool                                                              | Status vs TS7                                                                                                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript-eslint` (all versions, incl. canary `8.72.1-alpha.7`) | peer `typescript: ">=4.8.4 <6.1.0"`; **no v9 exists** (latest `8.72.0`); canary hard-errors: `typescript-eslint does not support TS 7.0.` |
| `@angular/compiler-cli@22.1` / `@angular/build@22.1.3`            | peer `typescript: ">=6.0 <6.1"`                                                                                                           |
| Tracking                                                          | `typescript-eslint/typescript-eslint#10940` OPEN, `accepting prs`, no milestone                                                           |

## Verification (worktree, `deps-ts7`, baseline-forced green)

- Baseline `origin/main` `e8e5588`: lint 9/9 ✅ test 9/9 ✅ build 4/4 ✅ (all `--force`, 0 cached)
- After checkout of branch + `bun install` (TS 7.0.2): lint **0/9** ❌

Error verbatim (stable `@typescript-eslint@8.62.0`):

```
Oops! Something went wrong! :(
ESLint: 8.57.1
TypeError: Failed to load plugin '@typescript-eslint' declared in '.eslintrc.cjs » @repo/eslint-config/index.js': Cannot read properties of undefined (reading 'Cjs')
Referenced from: packages/eslint-config/index.js
    at Object.<anonymous> (.../@typescript-eslint/typescript-estree@8.62.0.../dist/create-program/shared.js:59:18)
```

Retry with newest code (`@typescript-eslint/*@8.72.1-alpha.7` canary) — still 0/9, explicit guard:

```
Error: Failed to load plugin '@typescript-eslint' declared in '.eslintrc.cjs » @repo/eslint-config/vue.js » ./index.js': typescript-eslint does not support TS 7.0.
```

Not reached: test/build — `@angular/*` peer `>=6.0 <6.1` would block `white-label-angular` regardless.

## Outcome

Worktree `.../forma-initiale-wt/deps-ts7` REMOVED, local branch
`renovate/typescript-7.x` DELETED. No fix possible by version bump — wait for upstream
(typescript-eslint #10940, Angular TS7 peer bumps). Revisit when:

1. `typescript-eslint` ships TS7-capable release (peer includes 7.x)
2. `@angular/build` + `@angular/compiler-cli` peer includes 7.x
3. Then re-run `/update-deps` on the renovate branch (or fresh one).

## Renovate rule

`renovate.json` → `packageRules[1]`: `matchPackageNames: ["typescript"]`,
`matchUpdateTypes: ["major"]`, `enabled: false`. Minors/patches stay open
(currently none — 7.0.2 is latest; block only bites future majors like 8.x... and the
existing 7.x PR once reopened).
