# Dependency Management

Canonical policy for dependency updates in this repo. Two strategies: **Renovate** (automated, GitHub) and **taze** (manual fallback, any host).

## Strategies overview

| Strategy | Host   | Automation                       | Notes                                                                                |
| -------- | ------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| Renovate | GitHub | Auto PRs, auto-merge minor/patch | Default. Config: `renovate.json` + `.github/workflows/renovate.yml`                  |
| taze     | Any    | Manual, on demand                | Portable fallback for non-GitHub hosts. Not installed as a dep — run via `bunx taze` |

## Renovate (automated — GitHub)

Config: `renovate.json` at repo root, workflow `.github/workflows/renovate.yml`.

- **Schedule:** weekly — Mondays 05:00 UTC (`cron: "0 5 * * 1"` in the workflow)
- **Auto-merge:** enabled for minor + patch (`"automerge": true`, `automergeType: "pr"` in `renovate.json`) — CI must pass. Majors excluded (`matchUpdateTypes: ["major"]` → `"automerge": false`).
- **Manual trigger:** GitHub → Actions → `Renovate Dependencies` → Run workflow
- **Secret:** `RENOVATE_TOKEN` (PAT with `repo` scope)
- **Lockfile:** `bun.lock` (`bun.enabled: true` in `renovate.json`)
- **Majors:** manual review; require Dependency Dashboard approval
- **Blocked majors:** `eslint` (`enabled: false` in `renovate.json`) — repo on eslintrc CJS; flat-config migration pending. Details: `.opencode/thoughts/2026-10-22-eslint-major-block.md`; `typescript` — TS7 unsupported by typescript-eslint (`<6.1.0` peers) + Angular (`>=6.0 <6.1`). Details: `.opencode/thoughts/2026-10-22-typescript-7-block.md`

## Open follow-ups

- **`vue-eslint-parser` hygiene** — `eslint-plugin-vue@10` (merged 2026-10-22) requires peer `vue-eslint-parser ^10.3.0`; repo still on `^9` (lock 9.4.3) on both `main` and `dev`. Works at runtime (verified lint 10/10), but unmet non-optional peer. Bump `vue-eslint-parser` → `^10.3` when convenient, re-run lint.

## Manual fallback (taze)

For non-GitHub hosts (drop `renovate.json` if you switch). taze is **not installed** — run on demand:

```bash
bunx taze            # show all available major upgrades
bunx taze minor      # show minor/patch only
```

Then update manually: `bun add <pkg>@latest -W` (root) or per workspace.

## Upgrade policy

- **Major**: manual review. Check changelog/breaking changes first.
- **Minor/patch**: Renovate auto-merges (CI must pass).
- **Astro/Starlight**: major-breaking (5→6). Dedicated upgrade task.
- **ESLint**: stays 8 (CJS config). Do NOT upgrade to 9 / flat config.
- **TypeScript**: 6.0.3 at root; apps may pin older minors locally.

## Landing a dependency update (both lines)

Updates land on **both `main` and `dev`** — deliberately, to isolate regressions.

1. Renovate branch (branched off `main`) → CI green → merge to `main` via GitHub.
2. Cherry-pick the commit onto `dev`: `git cherry-pick <sha>` (keeps `dev` linear).
3. **NEVER rebase across `main`'s squash boundary.** `main` is a squash/release branch; `dev` is 127+ commits of linear work. `git rebase main` on dev (or vice versa) reconciles squashed history against real commits → conflict mess.

### Verification flow (per dep update)

Run in a **dedicated worktree** — never the main checkout:

```bash
git worktree add --detach ../forma-initiale-wt/<name> <branch>
cd ../forma-initiale-wt/<name>
# .env needed in ALL Vite apps: white-label-vue + fake-plants-vue
# (future *-react apps too; Angular = environment.ts, docs = none — no .env)
cp apps/white-label-vue/.env apps/white-label-vue/.env
cp apps/fake-plants-vue/.env apps/fake-plants-vue/.env
# NOTE: real .env values live in main checkout — copy those; .env is gitignored.
# .env.example exists but its values are stubs (wrong VITE_API_URL) → seed from real files.
bun install
bun run lint    # stop on first failure, report verbatim
bun run test
bun run build
```

There is **no typecheck script** anywhere (TS is `noEmit`-only, `vue-tsc` not installed). The three layers = lint / test / build.

### Browser probe (after layers)

Start dev server (`cd apps/white-label-vue && bun run dev`), then `bun ~/.config/opencode/scripts/probe.ts <url>`:

- App uses **hash history** with `''` as products route → correct URLs: `http://localhost:<port>/` or `/#/` (products), `/#/components`. `/#/products` is NOT a route — Vue Router silently renders nothing (false "blank page").
- MSW `DEV_DELAY = 1000ms` + lazy route chunk → probe settles only ~300ms, screenshots catch mid-load (false blank/loader). Run a warm-up pass first (installs service worker), settle ≥5s before judging.
- Pass criteria: 0 console errors, products DOM shows 5 `fe-card`, mocked API `https://api.example.com/api/wl/products` → 200.

## Regression isolation matrix

2×2: {main line, dev line} × {without update, with update}:

| State | Meaning                                                                        |
| ----- | ------------------------------------------------------------------------------ |
| S0    | `main` baseline                                                                |
| S1    | `main` + update (≡ renovate branch itself — same content, one run covers both) |
| S2    | `dev` baseline                                                                 |
| S3    | `dev` + update                                                                 |

- `S1 vs S0` → regression caused by the bump itself
- `S3 vs S2` → regression from bump interacting with dev's newer commits — highest risk, day-to-day relevant
- `S2 vs S0` → pre-existing on dev, unrelated
- `S1` green + `S3` red → pure bump × dev-code interaction

Example verified (`@vitejs/plugin-vue` 5→6): S1 green, S3 green — lint 10/10, test 10/10, build 5/5, probe 0 errors, 5 cards rendered.

## Workspaces & key deps

| Workspace                                          | Key deps                                    |
| -------------------------------------------------- | ------------------------------------------- |
| apps/docs                                          | astro, @astrojs/starlight, sharp            |
| apps/white-label-vue                               | vue, vite, @vitejs/plugin-vue, unplugin-\*  |
| apps/fake-plants-vue                               | (extends white-label-vue)                   |
| apps/white-label-angular                           | @angular/\*                                 |
| apps/fake-plants-angular                           | (extends white-label-angular)               |
| packages/domain                                    | (pure TS)                                   |
| packages/infra                                     | @repo/domain                                |
| packages/presenters                                | (pure TS view-model transformers)           |
| packages/ui                                        | hybrids, @awesome.me/webawesome             |
| packages/utils                                     | (pure TS helpers)                           |
| packages/generator                                 | Pinion generator                            |
| packages/eslint-config, packages/typescript-config | shared config                               |
| root (dev)                                         | eslint, typescript, turbo, vitest, prettier |

## Notes / gotchas

- **`.env` (critical):** needed in **every Vite app** — `apps/white-label-vue`, `apps/fake-plants-vue`, and any future `*-react` shell/tenant (they read `import.meta.env.VITE_*`). Angular apps use `environment.ts` (no `.env`), `apps/docs` needs none. `.env` is gitignored (`.gitignore:8`); fresh worktree/clone has only `.env.example`. Without `.env`, `VITE_API_URL`/`VITE_TENANT_ID` are undefined → `get-products.adapter.ts:3` throws `Cannot read properties of undefined (reading 'replace')` → 3 test failures in `ProductsPage.spec.ts`. Not a code defect — seed `.env` first.
- **No typecheck script:** layers = lint / test / build only (TS `noEmit`, `vue-tsc` not installed).
- **Angular budget warning (known non-blocker):** `fake-plants-angular` build emits bundle-budget warning (693.31 kB vs 500 kB budget, exceeded by 193.31 kB). Unrelated to Vue-only dep bumps (they touch only `apps/{white-label,fake-plants}-vue/package.json` + `bun.lock`).
