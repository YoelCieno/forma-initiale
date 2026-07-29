# forma-initiale — Roadmap

Monorepo plan overview.

## Phase Table

| Phase | Focus                                                              | Location     | Status                 |
| ----- | ------------------------------------------------------------------ | ------------ | ---------------------- |
| 0     | Hexagonal skeleton: domain + infra pkgs, web-vue app, auto-import  | `phase-0.md` | ✅ COMPLETED           |
| 1     | Docs solution research + implementation, UI components conversion  | `phase-1.md` | ✅ COMPLETED           |
| 2     | Web Awesome UI layer (WA + hybridJS wrappers)                      | `phase-2.md` | ✅ COMPLETED           |
| 3     | White-label extend layer (inherit app, override components/styles) | `phase-3.md` | ✅ COMPLETED           |
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

## Ideas For Future Improvements

### Generator improvements

- **`register-tenant.ts` function refactoring**: `parseArgs`/`printUsage` currently inline. Future: extract shared arg validation that both pinion prompts and CLI script can use, deduplicate name derivation (`deriveMswNames` in tpl vs CLI naming logic).
- **`register-tenant.ts` as hook-based pipeline**: The script's read→validate→add→write→report flow could be extracted into composable pipeline steps (like pinion's `.then()` chain) for testability and reuse.

### Factory/white-label improvements

Not scheduled — ideas recorded for future consideration:

- **Component/page override via Vite plugin resolution order**: Currently implicit and not factory-aware. If multiple tenants override the same component, resolution order is fragile. A future factory API could expose explicit override registration.
- **App shell override is all-or-nothing**: No slot-based layout extension from WL. Tenant must replace entire `App.vue` to change shell structure. Future: define layout regions (header, main, footer, sidebar) that WL shell exposes for tenant injection without full replacement.
- **No slot system for injecting content into WL layout regions**: Tenants cannot inject nav items, toolbar actions, or sidebar content into WL layouts without forking the shell. Future: a slot/region registry API.
- **CSS/token imports managed outside factory**: Tenants manually import `@repo/ui/styles`, theme, and tokens. Future: factory could auto-register theme dependency or accept a theme option.
- **Any other factory API improvements** discovered during tenant development or generator use.
