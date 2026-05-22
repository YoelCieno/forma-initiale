# Dependency Management

Two strategies: **taze+turbo** (manual, portable) and **Renovate** (automated, GitHub).

## taze + turbo (manual — GitLab, Bitbucket, any host)

```bash
bun taze            # show all available major upgrades
bun taze minor      # show minor/patch only
```

Then update manually: `bun add <pkg>@latest -W` (root) or per workspace.

Pros: Works on any git host. No bot setup.
Cons: Manual. No schedule.

## Renovate (automated — GitHub)

Config: `renovate.json` at repo root.

- Schedule: every 2 weeks on Monday
- Creates PRs for all outdated deps
- **No automerge** — every PR requires manual review + merge
- Major updates require Dependency Dashboard approval

### Manual upgrade (non-GitHub)

If you switch host, drop `renovate.json` and use `taze` above. The `check-updates` turbo task is the portable equivalent.

## Workspaces & key deps

| Workspace | Key deps |
|-----------|----------|
| apps/docs | astro, @astrojs/starlight, sharp |
| apps/web-vue | vue, vite, @vitejs/plugin-vue, unplugin-* |
| packages/domain | (pure TS) |
| packages/infra | @repo/domain |
| packages/ui | (vanilla TS) |
| root (dev) | eslint, typescript, turbo, vitest, prettier |

## Upgrade policy

- **Major**: Manual review required. Check changelog/breaking changes first.
- **Minor/patch**: PR is created — review and merge at your pace.
- **Astro/Starlight**: Major-breaking (5→6). Dedicated upgrade task.
- **ESLint**: 8→9→10 are breaking. ESLint 8 stays for now (CJS config).
- **TypeScript**: 5.5.4 pinned. 6.0 is major-breaking.
