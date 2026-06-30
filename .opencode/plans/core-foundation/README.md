# forma-initiale — Roadmap

Monorepo plan overview.

## Phase Table

| Phase | Focus                                                              | Location     | Status                 |
| ----- | ------------------------------------------------------------------ | ------------ | ---------------------- |
| 0     | Hexagonal skeleton: domain + infra pkgs, web-vue app, auto-import  | `phase-0.md` | ✅ COMPLETED           |
| 1     | Docs solution research + implementation, UI components conversion  | `phase-1.md` | ✅ COMPLETED           |
| 2     | Web Awesome UI layer (WA + hybridJS wrappers)                      | `phase-2.md` | ✅ COMPLETED           |
| 3     | White-label extend layer (inherit app, override components/styles) | `phase-3.md` | ✅ PARTIALLY COMPLETED |
| 4     | CSS `@layer` cascade strategy                                      | `phase-4.md` | ❌ PENDING             |
| 5     | Angular implementation                                             | `phase-5.md` | ❌ PENDING             |
| 6     | React implementation                                               | `phase-6.md` | ❌ PENDING             |

## Conventions

- Phase docs live in `.opencode/plans/core-foundation/phase-*.md` — committed, shared context
- Each phase file tracks: goal, tasks, decisions, status. Supporting docs (research, decisions) can be added as additional files within the plan directory.
- Research before implementation (Phase 1 starts with research)
- KISSME principle: add layers only when needed

## Notes

- `apps/web` renamed to `apps/web-vue` ✅

## Maintenance

- **Keep deps updated**: Periodically check Astro, Starlight, Vite versions
- **Vite+**: Integration planned for Phase 1
