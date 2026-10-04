# Draft — angular/angular-cli feature request: build-time component overrides

> **Internal file — NOT submitted.** User reviews, then files manually at
> https://github.com/angular/angular-cli/issues/new/choose → "Feature request".
>
> - Venue + duplicate research: `.opencode/thoughts/research/angular-component-override-proposal-venue.md`
> - Template fetched: https://raw.githubusercontent.com/angular/angular-cli/main/.github/ISSUE_TEMPLATE/2-feature-request.yml (2026-10-04)
> - Motivation evidence: `openspec/changes/universal-override-wrapper/design.md`, `openspec/changes/product-card-wrapper/proposal.md`
> - Conduct: Angular Contributor Covenant 1.4; no demands; ask for guidance if wrong venue.

### Issue metadata

- **Title:** `Add build-time componentOverrides mapping and template-driven component resolution`
- **Template:** `2-feature-request.yml`
- **Command (dropdown, multiple):** `build`, `serve`, `test`
- **Labels (set by triage, do not request manually):** `feature` → then `feature: votes required` (bot) → `feature: under consideration` | `feature: in backlog` | `feature: insufficient votes`

### Template field mapping

| Template field (id)              | Required | Draft section                                            |
| -------------------------------- | -------- | -------------------------------------------------------- |
| `command` (dropdown)             | yes      | `build` + `serve` + `test`                               |
| `description`                    | yes      | `## Description`                                         |
| `desired-solution`               | no       | `## Describe the solution you'd like`                    |
| `alternatives`                   | no       | `## Describe alternatives you've considered`             |

---

<!-- ========================= ISSUE BODY START ========================= -->

## Description

White-label and multi-tenant Angular applications need to substitute one component's implementation with another's for a given build configuration. Today the options are all lossy:

1. **Runtime indirection** — `ngComponentOutlet` / DI-token registries / `NgComponentOutlet` with a resolved class. Selection happens after AOT, so template type-checking can't verify the swapped component's inputs at the call site, `strictTemplates` gives no guarantee about what actually renders, and tree-shaking/inline analysis of the real implementation is left to chance.
2. **Fork consumer imports per tenant** — duplicate pages/modules so each tenant's `imports` array points at its own component. Works, but multiplies maintenance and drifts between tenants.
3. **`fileReplacements`** — swaps whole source files. Replacing one component means renaming or restructuring files so a path swap lands on the right component; it cannot express "selector/module X resolves to component Y" and it applies at file granularity, not component binding.

The compiler already knows the template graph: it resolves each template element to a component declaration during AOT. Selecting *which* declaration a given element resolves to — per build configuration — seems like a natural build-time concern, but no supported surface exposes it in `build`, `serve`, or `test` consistently.

## Describe the solution you'd like

A first-class, declarative **component override resolution** step in the application builder, analogous to the existing `fileReplacements` option (see `packages/angular/build/src/builders/application/schema.json`):

```jsonc
// angular.json — per configuration
{
  "builder": "@angular/build:application",
  "options": {
    "fileReplacements": [
      { "replace": "src/environments/environment.ts", "with": "src/environments/environment.prod.ts" }
    ],
    "componentOverrides": [
      {
        "component": "src/app/product-card/product-card.component.ts",
        "with": "src/app/product-card/product-card.fp.ts"
      }
    ]
  }
}
```

Behavior:

- Resolution runs **before AOT**, identically under `ng build`, `ng serve` (re-resolve on config change), and `ng test` — same contract `fileReplacements` already honors.
- The override targets a *component declaration*, not a file path: the mapped class replaces the original wherever the original is referenced (templates and, if feasible, `imports` arrays), while the original's selector, inputs, and exports stay type-visible to consumers.
- **Template-driven resolution** (opt-in, e.g. `autoResolveComponents: true`): a template element resolves to the correct component import without hand-wiring the standalone `imports` array. This is the build-side counterpart of the editor-side auto-import work in the language service (angular/angular#68522, angular/angular#47689) — today that capability exists only in the IDE, never in the build.

If a compiler/language-service piece is required for template-driven resolution, I'm happy to file a cross-linked follow-up in `angular/angular` (`compiler-cli`) and keep this issue scoped to the builder side — please redirect if this is the wrong split.

## Describe alternatives you've considered

- **Runtime registry (`ngComponentOutlet` + DI token / injection-based override map)** — what we use today as a stopgap. Loses `strictTemplates` coverage at the call site and pushes selection to runtime; a registry-injection shim plus wrapper host components exists only to hide that plumbing from consumers.
- **Custom builders (`@angular-builders/custom-webpack` / esbuild config)** — the standard answer in #26859 and #29149. Community reports (just-jeb/angular-builders) note third-party builders must track internal builder APIs and lag releases; the override semantics we need are compiler-level, not bundler-level, so a bundler hook doesn't reach them anyway.
- **Per-tenant forks of consumer modules** — duplicates pages and `imports` arrays; drift is guaranteed as slots grow.
- **`fileReplacements` at file granularity** — requires renaming/restructuring files to fake component-level substitution; also historically lossy for templates (angular/angular-cli#19390 removed `.html` replacements).

### Relationship to previously closed requests

I searched open and closed issues before filing. #26859, #29149, #27951, #27695 asked to **expose Vite/esbuild configuration or plugin hooks** and were closed `not_planned`. This request is deliberately not that ask: it proposes a bounded, declarative, Angular-compiler-level mapping (like `fileReplacements`, which the team already maintains) rather than a bundler-config passthrough or custom transform hook. No bundler configuration is exposed; AOT remains authoritative; the surface is a schema-validated builder option.

The nearest open precedents for the *shape* of this ask are #11787 (build-lifecycle hook, `feature: under consideration`) and #30742 (narrow internal-option exposure, `feature: under consideration`) — both narrow, bounded requests.

### References

- `fileReplacements` (existing config-dependent substitution precedent): `packages/angular/build/src/builders/application/schema.json`
- unplugin-vue-components — resolver model where a template element resolves to an import, with `allowOverrides` for substitution: https://github.com/unplugin/unplugin-vue-components
- ABP ReplaceableComponents — runtime precedent showing demand for component replacement in Angular UIs: https://abp.io/docs/latest/framework/ui/angular/component-replacement
- Language-service-only auto-import (build-side gap): https://github.com/angular/angular/issues/68522
- Roadmap hook: "Enhanced Ecosystem compatibility … our build tooling" — https://angular.dev/roadmap

If this is the wrong venue or the scope should be split (builder vs compiler), please point me to the right place and I'll refile.

<!-- ========================== ISSUE BODY END ========================== -->

---

## Submission checklist

- [ ] Re-run duplicate search (open **and** closed): "component override", "component replacement", "auto import components", "build plugins", "tenant/white label" in angular/angular + angular/angular-cli. Research verdict 2026-10-04: component-override half **novel**; transform-hook half rejected ≥4× (#26859, #29149, #27951, #27695) — body must never read as re-ask.
- [ ] Confirm no new duplicate landed since research date.
- [ ] **Voting gate:** per https://github.com/angular/angular/blob/main/contributing-docs/feature-request-consideration.md — after manual roadmap check, bot opens voting; **≥20 👍 on the ORIGINAL issue description within 60 days (new issues)** or the bot closes as `feature: insufficient votes`. Comments don't count. Plan vote mobilization before filing.
- [ ] Expect "implement as a separate package" counter-offer (same doc) — prepared answer: only the CLI can guarantee `build`/`serve`/`test` symmetry + AOT authority for this mapping.
- [ ] Template fields mapped: `command` = `build` + `serve` + `test`; body sections land in `description` / `desired-solution` / `alternatives` textareas (table above).
- [ ] Labels are triage-set (`feature`, `area:*`); do not request labels in the body.
- [ ] Tone check: neutral, collaborative, no demands; guidance-offer paragraph present (Angular CoC — Contributor Covenant 1.4).
- [ ] Link back to research artifact: `.opencode/thoughts/research/angular-component-override-proposal-venue.md`.
- [ ] Keep title ≤ ~70 chars, lead with the ask (current: `Add build-time componentOverrides mapping and template-driven component resolution`).

## Package naming note

Community package working name: **`unplugin-angular-components`**. Core concept = **"template-driven component resolution"** — a resolver that covers *both* auto-import and override substitution (mirrors unplugin-vue-components, which ships `dirs` auto-import plus `allowOverrides`). Keeping the package name in the unplugin family stays discoverable; the dual scope (auto-import + override) is documented in package docs rather than the name, so if the team counters with "build this as a separate package," the artifact is already name-compatible with the ecosystem slot.
