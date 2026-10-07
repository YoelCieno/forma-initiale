# Draft — angular/angular-cli feature request: build-time component overrides

> **Internal file — NOT submitted.** User reviews, then files manually at
> https://github.com/angular/angular-cli/issues/new/choose → "Feature request".
>
> - Venue + duplicate research: `.opencode/thoughts/research/2026-10-04-angular-component-override-proposal-venue.md`
> - Template fetched: https://raw.githubusercontent.com/angular/angular-cli/main/.github/ISSUE_TEMPLATE/2-feature-request.yml (2026-10-04)
> - Motivation evidence: `openspec/changes/universal-override-wrapper/design.md`, `openspec/changes/product-card-wrapper/proposal.md`
> - Conduct: Angular Contributor Covenant 1.4; no demands; ask for guidance if wrong venue.

### Issue metadata

- **Title:** `Add build-time componentOverrides mapping and template-driven component resolution`
- **Template:** `2-feature-request.yml`
- **Command (dropdown, multiple):** `build`, `serve`, `test`
- **Labels (set by triage, do not request manually):** `feature` → then `feature: votes required` (bot) → `feature: under consideration` | `feature: in backlog` | `feature: insufficient votes`

### Template field mapping

| Template field (id)  | Required | Draft section                                |
| -------------------- | -------- | -------------------------------------------- |
| `command` (dropdown) | yes      | `build` + `serve` + `test`                   |
| `description`        | yes      | `## Description`                             |
| `desired-solution`   | no       | `## Describe the solution you'd like`        |
| `alternatives`       | no       | `## Describe alternatives you've considered` |

---

<!-- ========================= ISSUE BODY START ========================= -->

## Description

Which component class a template element resolves to is decided by the compiler during AOT — today only from static `imports` arrays, never from build configuration. Applications that ship alternate implementations of the same components per build (white-label shells, multi-tenant stores, design-system swaps) are forced into hand-wiring: every consumer page imports the right variant, class/selector names get renamed to dodge ambiguity, or resolution is re-created after AOT at runtime. All current options are lossy:

1. **Runtime indirection** — `ngComponentOutlet` / DI-token registries selecting the class after AOT: template type-checking cannot verify the swapped component at the call site, `strictTemplates` gives no guarantee about what actually renders, and each wrapper instance pays unconditional per-check input writes plus an extra view layer. (This is the stopgap we ship today.)
2. **Fork consumer imports per tenant** — duplicate pages/modules so each tenant's `imports` array points at its own variant. Works, but multiplies maintenance and drifts between tenants.
3. **`fileReplacements`** — swaps whole source files. It cannot express "selector/module X resolves to component Y", applies at file granularity rather than component binding, and forces renaming/restructuring to land on the right component.

The compiler already knows the template graph: it resolves each template element to a component declaration during AOT. Selecting _which_ declaration a given element resolves to — per build configuration — is a natural build-time concern, but no supported surface exposes it in `build`, `serve`, or `test`.

## Describe the solution you'd like

Component resolution as a configuration-dependent build step — **same selector, different implementation, zero consumer changes**:

- the consumer template stays `<product-card [product]="product" />` — no wrapper hosts, no `ngComponentOutlet`, no `imports` surgery
- the override declares the **same selector** as the component it replaces; the build resolves precedence (today duplicate selectors are ambiguity, not substitution)
- which components count as overrides is declared **once in `angular.json`, per configuration**, under `extends` — `auto: true` opts into selector-based auto-detection, `paths` optionally points at custom locations (default: deep scan of `src/components`). Detected automatically, never hand-paired per component:

```jsonc
// angular.json — per configuration
{
  "builder": "@angular/build:application",
  "options": {
    "extends": {
      "origin": {
        // By default auto-detects 'src/components' recursively
        "auto": true,
        // paths adds  custom locations that can be overriden
        "paths": ["src/path/one", "src/path/two"],
      },
    },
  },
}
```

Behavior:

- The configured paths are scanned for `@Component` declarations. A discovered component whose selector matches a component elsewhere in the compilation **replaces it** — wherever it is referenced (templates and, if feasible, `imports` arrays) — while the original's selector, inputs, and exports stay type-visible to consumers.
- Resolution runs **before AOT**, identically under `ng build`, `ng serve` (re-resolve on config change), and `ng test` — the same contract `fileReplacements` already honors.
- Class names are irrelevant (`FpProductCard` vs `ProductCard` — only the selector is the contract). If a selector rename is unavoidable, the build side owns that wiring; consumers never see it.

If a compiler/language-service piece is required for selector-precedence resolution, I am happy to file a cross-linked follow-up in `angular/angular` (`compiler-cli`) and keep this issue scoped to the builder side — please redirect if this is the wrong split.

## Describe alternatives you've considered

- **Runtime registry (`ngComponentOutlet` + DI token / injection-based override map)** — what we use today as a stopgap: wrapper host components hide the plumbing from consumers, but selection happens after AOT (losing `strictTemplates` at the call site) and every instance pays an extra view layer plus unconditional per-check input writes. Exactly the layer a build-time resolution would delete.
- **Custom builders (`@angular-builders/custom-webpack` / esbuild config)** — the standard answer in #26859 and #29149. Community reports (just-jeb/angular-builders) note third-party builders must track internal builder APIs and lag releases; the override semantics we need are compiler-level, not bundler-level, so a bundler hook doesn't reach them anyway.
- **Per-tenant forks of consumer modules** — duplicates pages and `imports` arrays; drift is guaranteed as slots grow.
- **`fileReplacements` at file granularity** — requires renaming/restructuring files to fake component-level substitution; also historically lossy for templates (angular/angular-cli#19390 removed `.html` replacements).

### Relationship to previously closed requests

I searched open and closed issues before filing. #26859, #29149, #27951, #27695 asked to **expose Vite/esbuild configuration or plugin hooks** and were closed `not_planned`. This request is deliberately not that ask: it proposes a bounded, declarative, Angular-compiler-level mapping (like `fileReplacements`, which the team already maintains) rather than a bundler-config passthrough or custom transform hook. No bundler configuration is exposed; AOT remains authoritative; the surface is a schema-validated builder option.

The nearest open precedents for the _shape_ of this ask are #11787 (build-lifecycle hook, `feature: under consideration`) and #30742 (narrow internal-option exposure, `feature: under consideration`) — both narrow, bounded requests.

### References

- `fileReplacements` (existing config-dependent substitution precedent): `packages/angular/build/src/builders/application/schema.json`
- unplugin-vue-components — resolver model where a template element resolves to an import, with `allowOverrides` for substitution: https://github.com/unplugin/unplugin-vue-components
- ABP ReplaceableComponents — runtime precedent showing demand for component replacement in Angular UIs: https://abp.io/docs/latest/framework/ui/angular/component-replacement
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
- [ ] Link back to research artifact: `.opencode/thoughts/research/2026-10-04-angular-component-override-proposal-venue.md`.
- [ ] Keep title ≤ ~70 chars, lead with the ask (current: `Add build-time componentOverrides mapping and template-driven component resolution`).

## Package naming note

Community package working name: **`unplugin-angular-components`** — scoped to override substitution (the `allowOverrides` half of unplugin-vue-components). Core concept: **same-selector template resolution** — a template element resolves to the build-configured implementation.

The auto-import half is split into a separate proposal: **`angular-auto-imports`** — template-driven global component resolution (template element → import without hand-wiring the standalone `imports` array). Useful in plain SPAs too, not just multi-tenant builds; filed as its own change request so THIS issue stays narrowly scoped to override precedence.
