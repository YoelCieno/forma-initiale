# forma-initiale — Roadmap

Monorepo plan overview.

## Phase Table

| Phase | Focus                                                              | Location     | Status                 |
| ----- | ------------------------------------------------------------------ | ------------ | ---------------------- |
| 0     | Hexagonal skeleton: domain + infra pkgs, web-vue app, auto-import  | `phase-0.md` | ✅ COMPLETED           |
| 1     | Docs solution research + implementation, UI components conversion  | `phase-1.md` | ✅ COMPLETED           |
| 2     | Web Awesome UI layer (WA + hybridJS wrappers)                      | `phase-2.md` | ✅ COMPLETED           |
| 3     | White-label extend layer (inherit app, override components/styles) | `phase-3.md` | ✅ COMPLETED           |
| 4     | Angular implementation                                             | `phase-4.md` | 🔧 IN PROGRESS (research) |
| 5     | React implementation                                               | `phase-5.md` | ❌ PENDING             |
| 6     | CSS `@layer` cascade strategy (optional)                           | `phase-6.md` | ⏸️ OPTIONAL            |

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

## Next Future Improvements

### Turborepo pipeline hardening (task B from 3.5.3)

Not scheduled — decided future work during 3.5.3 discussion (2026-08-07).

- **`vue-tsc` typecheck task**: Add repo-wide `typecheck` turbo task using `vue-tsc`. Currently `.vue` SFCs are transpiled via Vite/esbuild without type checking (see AGENTS gotcha #3 — `tsc` does not process `.vue` files). `vue-tsc` is the only real type-safety gate for Vue SFCs; today only `.ts` files get checked.
- **Independent cache for `lint`/`test`**: Scope turbo cache `inputs` per task (e.g. `lint` → `["**/*.{ts,vue}", ".eslintrc*"]`, `test` → `["**/*.{ts,vue}", "vitest.config*", "vitest.setup*"]`). Currently `lint`/`test` tasks use default full-repo signal hashing — no-op runs can't hit cache efficiently, and future multi-tenant apps (white-label-angular, web-react) risk cache cross-contamination from unscoped inputs.

Tradeoff accepted: new devDependency (`vue-tsc`), extra turbo task wiring, slightly slower per-change CI.

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

### Loader components
- **Create route navigation loader** component (shown during async route transitions / lazy page loads) fe-loader is candidate for it.
