# F. Documentation Updates

**Goal:** Update project docs to reflect Phase 3 changes.

## Sources

| Source file | Content |
|------------|---------|
| `AGENTS.md` | Project info, commands, gotchas |
| `docs/CODEMAPS/ARCHITECTURE.md` | Layer diagram |
| `docs/CODEMAPS/MODULES.md` | Per-module descriptions |
| `docs/CODEMAPS/FILES.md` | Directory tree |

## Tasks

### F1. Update `AGENTS.md`

- [ ] Add `@repo/presenter` to package layout table
- [ ] Add `@repo/generator` to package layout table
- [ ] Add `@repo/white-label-vue` app name
- [ ] Add `generate:vue-tenant` command to commands table
- [ ] Update architecture description: `domain → infra → presenter → apps/white-label-* → apps/tenant-*`
- [ ] Add tenant creation section

### F2. Update `ARCHITECTURE.md`

- [ ] Add presenter layer to diagram
- [ ] Add white-label → tenant layer extends
- [ ] Add `@repo/presenter` + `@repo/generator` to package diagram
- [ ] Update data flow arrows

### F3. Update `MODULES.md`

- [ ] Add `@repo/presenter` — description, exports, dependencies
- [ ] Add `@repo/generator` — description, generators, usage
- [ ] Update white-label app description (replaces web-vue)
- [ ] Add fake-plants-vue app description (example tenant)

### F4. Update `FILES.md`

- [ ] Add `packages/presenter/` to dir tree
- [ ] Add `packages/generator/` to dir tree
- [ ] Replace `apps/web-vue/` with `apps/white-label-vue/` in tree
- [ ] Add `apps/fake-plants-vue/` to tree
- [ ] Add `apps/tenant-<name>-vue/` pattern note

### F5. Tenant creation guide

- [ ] Create or update docs with:
  - Prerequisites (white-label exists, generator installed)
  - `bun run generate:vue-tenant --name <tenant>`
  - Manual override patterns (components, pages, styles)
  - Build + dev instructions

## ✅ Manual Confirmation

- [ ] Human reads updated docs — accurate and complete
- [ ] Human confirms: "F complete, Phase 3 done"

## After Phase 3

- [ ] Update `.opencode/plans/core-foundation/README.md` status: Phase 3 ✅ COMPLETED
- [ ] Update `.opencode/plans/core-foundation/phase-3.md` status: ✅ COMPLETED
