# forma-initiale — Roadmap

Monorepo plan overview.

## Phase Table

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Hexagonal skeleton: domain + infra pkgs, web-vue app, auto-import | ✅ COMPLETED |
| 1 | Docs solution research + implementation, UI components conversion | 🔧 IN PROGRESS |
| 2 | AgnosticUI wrappers, design system base | ❌ PENDING |
| 3 | White-label extend layer (main goal): inherit app, override components/styles | ❌ PENDING |

## Conventions

- Plans live in `.opencode/plans/` — committed, shared context
- Each phase file tracks: goal, tasks, decisions, status
- Research before implementation (Phase 1 starts with research)
- KISSME principle: add layers only when needed

## Notes

- `apps/web` renamed to `apps/web-vue` ✅

## Maintenance

- **Keep deps updated**: Periodically check Astro, Starlight, Vite versions
- **Vite+**: Integration planned for Phase 1
