# ESLint Fix on Save — Options Comparison

**Date:** 2026-05-25  
**Topic:** Automating lint fix on file save (VSCode-style `editor.codeActionsOnSave` equivalent)  
**Research question:** What editor-agnostic and editor-specific solutions exist to automatically fix ESLint warnings on save, replicating VSCode's `"editor.codeActionsOnSave": { "source.fixAll.eslint": true }` behavior?

---

## Options Considered

1. **VSCode native** — `editor.codeActionsOnSave` + ESLint extension
2. **JetBrains IDE native** — `Run eslint --fix on save` checkbox
3. **Neovim conform.nvim** — `format_on_save` config
4. **Vim ALE** — `let g:ale_fix_on_save = 1`
5. **watchexec** — standalone Rust binary file watcher triggering `eslint --fix`
6. **chokidar-cli** — Node.js CLI file watcher triggering `eslint --fix`
7. **eslint_d** — daemon-based eslint for fast repeated runs (companion, not standalone)
8. **eslint-auto-fix** — npm package that watches + fixes
9. **Vite plugin (@nabla/vite-plugin-eslint)** — ESLint integrated into Vite dev server
10. **Sublime Text ESLint-Formatter** — `format_on_save: true`
11. **Emacs flycheck** — `javascript-eslint` checker

---

## Resource Analysis per Option

### 1. VSCode Native (`editor.codeActionsOnSave`)

| Source        | URL                                | Findings                                                                                                 |
| ------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Official Docs | eslint.org/docs — `--fix` CLI      | Confirms `--fix` behavior. VSCode ESLint extension uses it internally.                                   |
| Spec/Source   | github.com/microsoft/vscode-eslint | `eslint.validate` is legacy; modern setup uses `eslint.workingDirectories` for monorepos                 |
| Cookbook      | digitalocean.com tutorial          | Step-by-step: install extension → enable `editor.codeActionsOnSave` → set `"source.fixAll.eslint": true` |
| Best Practice | aleksandrhovhannisyan.com          | Updated 2024: recommends `"editor.formatOnSave": true` + `"editor.codeActionsOnSave"`                    |

**Consensus:** Stable, well-documented. Conflicts between `eslint.format.enable: true` vs standalone `codeActionsOnSave` — some users need both. Troubleshooting guide widely available.

### 2. JetBrains IDEs (checkbox)

| Source        | URL                                     | Findings                                                                         |
| ------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| Official Docs | jetbrains.com/help/webstorm/eslint.html | Built-in ESLint integration with explicit "Run eslint --fix on save" checkbox    |
| Spec/Source   | jetbrains.com help pages                | Settings path: Languages & Frameworks → JavaScript → Code Quality Tools → ESLint |
| Cookbook      | blog.jetbrains.com (2016)               | Also supports File Watchers plugin for custom fix commands                       |
| Best Practice | stackoverflow.com                       | Avoid File Watcher approach — use native checkbox since 2019+                    |

**Consensus:** Native checkbox works since 2019+. Older workarounds (File Watcher, shell scripts) are obsolete. No conflicts.

### 3. Neovim conform.nvim

| Source        | URL                              | Findings                                                                            |
| ------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| Official Docs | github.com/stevearc/conform.nvim | `format_on_save` config function, returns `{ timeout_ms, lsp_format }`              |
| Spec/Source   | README                           | `formatters_by_ft` maps filetypes → formatter list; `stop_after_first` for chaining |
| Cookbook      | tduyng.com (2025)                | Complete setup: `formatters_by_ft`, `format_on_save` with filetype ignore logic     |
| Best Practice | LazyVim recipes                  | Two extras: `linting.eslint` (fix on save) + `formatting.prettier` (format)         |

**Consensus:** Active (5.1k stars), well-maintained. Known issues: timeout for large files (need `timeout_ms: 500`+), edge cases with `format_on_save` autocmd groups. Use `vim.api.nvim_create_autocmd` workaround if native `format_on_save` fails.

### 4. Vim ALE

| Source        | URL                           | Findings                                                                 |
| ------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Official Docs | github.com/dense-analysis/ale | `let g:ale_fix_on_save = 1` + `let g:ale_fixers.javascript = ['eslint']` |
| Spec/Source   | README                        | Also supports `eslint_d` for faster execution                            |
| Cookbook      | IBM Developer article         | Step-by-step vim-plug install → config → done                            |
| Best Practice | ALE wiki                      | Pair with `g:ale_linters` for real-time diagnostics                      |

**Consensus:** Mature, battle-tested. Simple config. No significant conflicts.

### 5. watchexec (CLI file watcher)

| Source        | URL                               | Findings                                                                                       |
| ------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Official Docs | github.com/watchexec/watchexec    | Rust binary, no runtime needed. `-e js,ts` for extension filter, `-w src/` for watch dir       |
| Spec/Source   | CLI README                        | Coalesces rapid events, respects `.gitignore`, provides changed paths via env vars             |
| Cookbook      | kx.cloudingenium.com guide (2026) | Example: `watchexec -e js,ts,tsx -- eslint --fix`                                              |
| Best Practice | watchexec README                  | Use `--restart` for long-running servers; for short commands (eslint --fix), no restart needed |

**Consensus:** Fast, reliable, no runtime dependencies. Best for editor-agnostic, CI, or terminal-driven workflows. No significant conflicts.

### 6. chokidar-cli (CLI file watcher)

| Source        | URL                                    | Findings                                                                      |
| ------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| Official Docs | github.com/open-cli-tools/chokidar-cli | Node.js-based. `chokidar "src/**/*.js" -c "eslint --fix {path}"`              |
| Spec/Source   | README                                 | Glob patterns, initial=true, debounce via `--throttle`/`--await-write-finish` |
| Cookbook      | dev.to (2024)                          | Chokidar CLI for automating MongoDB export + lint workflows                   |
| Best Practice | npm trends                             | 461k weekly downloads, widely used. Last release 5 years ago (v3.0.0)         |

**Consensus:** Stable but unmaintained (5y since last release). Requires Node.js runtime. Works but watchexec is preferred for new setups.

### 7. eslint_d (daemon)

| Source        | URL                            | Findings                                                                                       |
| ------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| Official Docs | github.com/mantoni/eslint_d.js | Background server, Unix domain socket, ~3x faster than direct eslint                           |
| Spec/Source   | README                         | Supports eslint v4–v10, auto-restart on config change, `--fix-to-stdout` for before-save hooks |
| Cookbook      | npm page                       | Install globally, drop-in replacement for `eslint` CLI                                         |
| Best Practice | Vim/Neovim docs                | Pair with ALE (`ale_javascript_eslint_executable = 'eslint_d'`) or nvim-lint                   |

**Consensus:** Not a standalone solution — pairs with editors/watchers. Significant speedup (300ms → 100ms). No real conflicts. Note: VSCode/WebStorm users don't benefit (they already cache).

### 8. eslint-auto-fix

| Source        | URL                               | Findings                                                                   |
| ------------- | --------------------------------- | -------------------------------------------------------------------------- |
| Official Docs | npmjs.com/package/eslint-auto-fix | `npx eslint-auto-fix` watches files, runs ESLint fix, overwrites on change |
| Spec/Source   | README                            | Supports globs, `--fix-on-startup`, `--verbose`. Peer dep on ESLint        |
| Cookbook      | (minimal)                         | Basic usage only                                                           |
| Best Practice | —                                 | Not recommended — unmaintained (4y), low usage (2 dependents)              |

**Consensus:** Deprecated effectively. Avoid.

### 9. Vite Plugin (@nabla/vite-plugin-eslint)

| Source        | URL                                 | Findings                                                                                                         |
| ------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Official Docs | github.com/nabla/vite-plugin-eslint | Async linting, non-blocking HMR. `fix: true` option in config                                                    |
| Spec/Source   | README                              | `eslintOptions.fix` supported since 1.3.4. Only applies in dev mode (not build)                                  |
| Cookbook      | —                                   | Minimal docs                                                                                                     |
| Best Practice | —                                   | `fix: true` paired with `cache: true` recommended. But: plugin is low maintenance (last release 2024, 145 stars) |

**Consensus:** Works for Vite dev server only. Does NOT run on build (intentional). Low maintenance. Not recommended for prod build linting. Conflicts: `vite-plugin-eslint` (different package) has cache bugs (issue #11).

### 10. Sublime Text ESLint-Formatter

| Source        | URL                                         | Findings                                 |
| ------------- | ------------------------------------------- | ---------------------------------------- |
| Official Docs | packagecontrol.io/packages/ESLint-Formatter | `{ "format_on_save": true }` in settings |
| Spec/Source   | —                                           | Uses ESLint Node API via plugin          |
| Cookbook      | IBM Developer                               | Single setting to enable                 |
| Best Practice | —                                           | Minimal config, works                    |

**Consensus:** Straightforward. Works for Sublime users. No conflicts.

### 11. Emacs flycheck

| Source        | URL          | Findings                                    |
| ------------- | ------------ | ------------------------------------------- |
| Official Docs | flycheck.org | `javascript-eslint` checker                 |
| Spec/Source   | —            | Can use `eslint_d` binary if available      |
| Cookbook      | —            | Set `flycheck-javascript-eslint-executable` |
| Best Practice | —            | Use with `eslint_d` for speed               |

**Consensus:** Solid Emacs integration. No conflicts.

---

## Conflicts Between Sources

1. **eslint.format.enable vs codeActionsOnSave (VSCode):** Some sources say you need both `"eslint.format.enable": true` AND `"editor.codeActionsOnSave": { "source.fixAll.eslint": true }`. Others say `codeActionsOnSave` alone suffices. The truth: for ESLint to _format_ (not just lint-fix), `eslint.format.enable` may be needed if using ESLint as the formatter.

2. **vite-plugin-eslint vs @nabla/vite-plugin-eslint:** Two different packages. The `@nabla` variant is async (non-blocking HMR), the `gxmari007` variant is sync. The `gxmari007` variant has known cache bugs (issue #11). Most recent guides recommend `@nabla` variant.

3. **JetBrains File Watcher vs native checkbox:** Older SO answers recommend File Watcher plugin. JetBrains docs (current) say use native checkbox. File Watcher is obsolete for this use case.

4. **watchexec --restart vs no --restart:** For short commands like `eslint --fix`, `--restart` is unnecessary (command runs and exits). For long-running processes (dev servers), `--restart` is required. Sources conflict on default behavior.

---

## Comparison Table

| Criteria               | VSCode              | JetBrains           | Neovim/conform       | Vim/ALE              | watchexec                  | chokidar-cli   | eslint_d               | Vite Plugin              |
| ---------------------- | ------------------- | ------------------- | -------------------- | -------------------- | -------------------------- | -------------- | ---------------------- | ------------------------ |
| **Setup effort**       | 2 min               | 1 min               | 15 min (lua)         | 5 min                | 3 min                      | 3 min          | 2 min                  | 5 min                    |
| **API surface**        | JSON settings       | GUI checkbox        | Lua config           | vimrc vars           | CLI flags                  | CLI flags      | CLI flags              | plugin call              |
| **Perf (fix speed)**   | native (fast)       | native (fast)       | depends on formatter | depends on formatter | `eslint --fix` speed       | same as eslint | ~3x faster than eslint | async, non-blocking      |
| **Editor-agnostic**    | ❌                  | ❌                  | ❌                   | ❌                   | ✅                         | ✅             | ✅ (wrapper)           | ❌                       |
| **Ecosystem**          | massive             | JetBrains ecosystem | Neovim ecosystem     | Vim ecosystem        | standalone, cross-platform | Node.js        | Node.js                | Vite only                |
| **Security**           | eslint runs locally | eslint runs locally | eslint runs locally  | eslint runs locally  | native binary, no npm      | npm package    | npm package            | npm package              |
| **License**            | MIT (exnt)          | Proprietary         | MIT                  | MIT                  | Apache 2.0                 | MIT            | MIT                    | MIT                      |
| **Integration effort** | trivial (json)      | trivial (checkbox)  | moderate             | low                  | low                        | low            | low                    | low                      |
| **Monorepo support**   | workingDirectories  | auto                | cwd-based            | cwd-based            | `-w` flag                  | glob patterns  | `ESLINT_D_ROOT` env    | include/exclude patterns |
| **Maintenance**        | active              | active              | active               | active               | active                     | stalled (5y)   | active                 | low (last 2024)          |
| **Extra deps**         | VSCode ESLint ext   | WebStorm/IDE        | Neovim               | Vim                  | none                       | Node.js        | Node.js (global)       | Vite + plugin            |

---

## Recommendation

**Winner for forma-initiale: watchexec + eslint_d**

### Evidence-Based Justification

1. **forma-initiale is a monorepo** (Turborepo + bun). Need a solution that works across all packages without per-editor config.

2. **Editor-agnostic requirement:** The team may use VSCode, Neovim, JetBrains, or vim. watchexec is a standalone Rust binary — no runtime dependency, no editor lock-in.

3. **Performance:** `eslint_d` daemon reduces each `eslint --fix` from ~300ms to ~100ms (MacBook Air M4 per eslint_d README). Combined with watchexec's event coalescing, this keeps save-to-fix latency negligible.

4. **Monorepo support:** watchexec's `-w` flag and eslint_d's `ESLINT_D_ROOT` env var handle monorepo cases cleanly.

5. **Active maintenance:** Both tools are actively maintained (watchexec: Rust, 2026; eslint_d: v14+, 2025).

### Recommended setup

```bash
# Install once globally
cargo install watchexec-cli        # or: brew install watchexec
npm install -g eslint_d            # or: bun install -g eslint_d

# Run in project root
watchexec \
  -w packages/domain/src \
  -w packages/infra/src \
  -w packages/ui/src \
  -w apps/web-vue/src \
  -e ts,vue \
  --restart \
  eslint_d --fix
```

Or as a turbo task:

```json
// turbo.json
{
  "lint:watch": {
    "command": "watchexec -e ts,vue -w . -- eslint_d --fix",
    "persistent": true
  }
}
```

### Runner-up: Editor-native + watchexec combination

If each dev has a preferred editor, use the editor-native solution (VSCode `codeActionsOnSave`, JetBrains checkbox, Neovim conform.nvim) for individual work, AND watchexec as a CI/hook-based safety net.

---

## Open Questions

1. **eslint_d compatibility with eslint v9+ flat config:** eslint_d README says supports eslint v4–v10, but flat config changes the module resolution model. Need to verify no edge cases with `eslint.config.js` (flat config) vs `.eslintrc.*`.

2. **watchexec + Vite HMR interaction:** If watchexec triggers `eslint --fix` on save, and Vite's HMR also detects the same change, could there be a race condition where Vite serves the unfixed file before watchexec completes? The fix writes to disk, Vite watches disk changes — there may be a cascade: save → eslint fixes → Vite re-triggers on the fixed file. Need to test debounce behavior.

3. **Vue SFC special handling:** `.vue` files with `<script>` + `<template>` + `<style>` blocks. ESLint handles them via `vue-eslint-parser`, but the fix-on-save needs to preserve non-JS sections. Standard `eslint --fix` handles this correctly, but worth verifying with watchexec timing.

4. **Monorepo package boundary:** Should the watcher run once at root (linting all packages) or once per package? Root-level watch is simpler; per-package gives isolation. Need to decide based on eslint config resolution in monorepo.

5. **Conflict with Prettier:** Many setups run both `eslint --fix` and `prettier --write` on save. If both are configured, need to handle ordering (eslint then prettier, or eslint-config-prettier to avoid conflict). Current `@repo/eslint-config` doesn't include prettier — but worth noting for future.

6. **turbo persistent task lifetime:** If `lint:watch` is a persistent turbo task, how does it interact with `turbo dev` (also persistent)? Can they run in parallel without port/process conflicts? watchexec uses no ports, so likely fine, but needs testing.

---

## Sources (Authoritative)

- ESLint CLI `--fix`: https://eslint.org/docs/latest/use/command-line-interface#--fix
- Watchexec: https://github.com/watchexec/watchexec
- eslint_d: https://github.com/mantoni/eslint_d.js
- VSCode ESLint extension: https://github.com/microsoft/vscode-eslint
- JetBrains ESLint: https://www.jetbrains.com/help/webstorm/eslint.html
- conform.nvim: https://github.com/stevearc/conform.nvim
- ALE (Vim): https://github.com/dense-analysis/ale
- chokidar-cli: https://github.com/open-cli-tools/chokidar-cli
- @nabla/vite-plugin-eslint: https://github.com/nabla/vite-plugin-eslint
