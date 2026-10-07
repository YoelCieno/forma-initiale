# Phase 7 — Future Proposals (TODO)

**Goal:** Hold research-gated proposals for future phases. Each entry matures from research artifact → resolved gates → spike → scheduled implementation phase.

**Status:** ⏸️ RESEARCH REQUIRED — details filled as research lands.

## Background

- Backlog phase — no implementation scheduled until research gates close
- Pattern borrowed from Phase 6 (deferred status before tasks execute)
- Research artifacts live in `.opencode/thoughts/research/` and are linked from each entry as they land

## Tasks

### 7.1. Build-time component override plugin

- **Working package name:** `unplugin-angular-components` — override-substitution scope. Auto-import split OUT (2026-10-07): separate plugin working name `angular-auto-imports` + its own change request (template-driven global component resolution — also valuable in plain SPAs)
- **Direction:** unplugin package adapting `unplugin-vue-components` resolver pattern to Angular:
  - glob-scan component registry
  - `planEdits` — TypeScript AST locates `@Component` decorator, `@angular/compiler` `HtmlParser` scans template, MagicString emits edits injecting literal-array `imports` entries
  - hexagonal layout (domain/application/infrastructure)
  - `createUnplugin` factory with `vite`/`esbuild`/`webpack` subpath exports
- **Problems solved:**
  - (a) automatic override registration — declare override paths in `angular.json` (per configuration); selector match auto-registers the component in any host/tenant build — no hand pairing, no class/selector renames; plugin owns selector wiring if a rename is unavoidable
  - (b) eliminate per-component wrapper files AND the `ngComponentOutlet` indirection (supersedes the `universal-override-wrapper` stopgap) — `<product-card>` resolves directly to the final class at build time; the wrapper + ng-container layer is leftover runtime plumbing to delete
- **Capability — input-declaration codegen:** dynamic `@Input` names are IMPOSSIBLE in Angular — `@Input()` decorator + `inputs:` metadata are static literals and AOT checks consumer template bindings against declared inputs at compile time. Irreducible per-slot cost today = 1 static `@Input()` line + selector-list entry + slot-registry entry. The plugin could generate ALL three from a single slot config (selector + input name + input type + fallback + payload keys) — the real answer to "dynamic inputs": build-time codegen, not runtime.
- **Gates before any code** (each = research task):
  1. **Override-mapping source — DIRECTION SET** (2026-10-07): angular.json per-config path list + selector equality, auto-detected (no naming convention, no marker decorator, no hand-paired entries). Remaining research: precedence semantics — how AOT treats duplicate selectors today (ambiguity error) and where the override-wins insertion point lives
  2. **Selector unification** — override reuses the ORIGINAL selector (same-selector substitution; plugin handles any rename). Remaining: confirm duplicate-selector compiler behavior + today's mixed prefixes (`app-product-card`, `fp-product-card`, neutral `<product-card>`)
  3. **Pipeline spike** — official CLI: esbuild onLoad ordering vs AOT compiler (`@angular/build` compiler-plugin collision), `ng serve` (serveWithVite) exposes no custom Vite plugin hook, `ng test` externalPackages bypass (AGENTS gotcha #17). Alternative: AnalogJS `@analogjs/vite-plugin-angular` (JIT/AOT-in-Vite) — not in repo
- **Research artifacts:** `.opencode/thoughts/research/` (links TODO)
- **Open subtask:** submit proposal to Angular GitHub team — venue/conduct research in flight → artifact `.opencode/thoughts/research/angular-component-override-proposal-venue.md`
- **Open subtask (new):** `angular-auto-imports` change request — draft landed at `.opencode/thoughts/drafts/angular-cli-auto-imports-feature-request.md` (auto-import half split out of the override proposal)
- **Relationship:** generator-based discovery stays plan 4.7; runtime registry + universal wrapper = interim stopgaps

### 7.2. Additional future proposals

- TBD — research not yet landed

## ✅ Manual Confirmation

- [ ] Research artifacts linked from 7.1 (`.opencode/thoughts/research/`)
- [ ] All 3 gates resolved (override mapping, selector unification, pipeline spike)
- [ ] Spike results recorded (official CLI vs AnalogJS path)
- [ ] Proposal venue decided (Angular GitHub submission)

## Notes

- Phase 7 entries graduate to concrete phases only after their gates close
- Do not start 7.1 code before all three gates have recorded research artifacts
