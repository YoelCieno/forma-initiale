# Draft — angular/angular-cli feature request: template-driven component auto-import

> **Internal file — NOT submitted.** User reviews, then files manually at
> https://github.com/angular/angular-cli/issues/new/choose → "Feature request".
>
> - Venue + duplicate research: `.opencode/thoughts/research/2026-10-04-angular-component-override-proposal-venue.md` — verdict: build-side auto-import search hits were ALL language-service; no build-side issue exists → this is the novel half.
> - Supporting research: `.opencode/thoughts/research/2026-09-30-angular-component-auto-discovery.md`
> - Sibling draft: `.opencode/thoughts/drafts/angular-cli-component-overrides-feature-request.md` (override half; split 2026-10-07)
> - Template fetched: https://raw.githubusercontent.com/angular/angular-cli/main/.github/ISSUE_TEMPLATE/2-feature-request.yml (2026-10-04)
> - Conduct: Angular Contributor Covenant 1.4; no demands; ask for guidance if wrong venue.

### Issue metadata

- **Title:** `Add template-driven component auto-import to the application builder`
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

Standalone components moved registration entirely into per-template `imports` arrays. For any shared or global component set — design systems, web-component wrappers, kit libraries — every consumer template re-declares the same imports. That is boilerplate that scales with template count, not with app complexity.

The editor papers over it: the language service auto-imports for you (angular/angular#47689, completed 2022; angular/angular#68522, open) — but that is editing convenience only. The build never resolves anything on its own, and "global components" (zero-import registration, the way Web Components or Vue global registration work) have no build-side story at all.

Ecosystem precedent exists: `unplugin-vue-components` ships exactly this — a `dirs` scan, automatic import injection, and a generated `components.d.ts` so editor types stay in sync — and it is standard practice in Vue. Nothing equivalent is guaranteed against official `ng build` / `ng serve` / `ng test`.

The status quo leaves three lossy options:

1. **Hand-wired `imports`** — maintenance scales with templates; drift is guaranteed as the shared set grows.
2. **Language-service auto-import** — editor-only, behavior varies per editor, the build stays static, and there is no global registration story.
3. **NgModule declarations** — the pre-standalone quasi-global mechanism; unavailable (and effectively abandoned) for standalone apps.

Template→import resolution is known at AOT time. Exposing it as a configuration-dependent build step — the same argument that already applies to `fileReplacements` — seems natural, but no supported surface does it in `build`, `serve`, or `test`.

## Describe the solution you'd like

An opt-in, per-configuration builder option — a bounded jsonc block:

```jsonc
// angular.json — per configuration
{
  "builder": "@angular/build:application",
  "options": {
    "extends": {
      "imports": {
        // true includes "**/*.component.ts" by default
        "auto": true,
        // deep scan; dirs points at custom locations
        "dirs": ["src/app/shared", "src/path/two"],
      },
    },
  },
}
```

Behavior:

- The configured `dirs` are scanned **before AOT**. A template element whose selector matches a discovered component and has **no existing import** gets resolved automatically — `imports` arrays are never hand-edited for discovered components.
- Identical under `ng build`, `ng serve` (re-scan on file add/remove — watch), and `ng test` — the same contract `fileReplacements` already honors.
- **Explicit imports always win.** Discovery never adds a duplicate or overrides an explicit entry — idempotent, and it coexists with language-service auto-import without double-insertion.
- `strictTemplates` keeps validating: resolution happens pre-AOT, so the consumer template is checked against the class that actually renders.
- Editor sync: emit a declaration file (the `unplugin-vue-components` `components.d.ts` pattern) so completion/type info stays consistent.
- Class names are irrelevant — the selector is the contract.

If a compiler/language-service piece is required for template-side resolution, I am happy to cross-link a follow-up in `angular/angular` (`compiler-cli`) — please redirect if this is the wrong split. Note this is deliberately **not** a bundler-config ask.

## Describe alternatives you've considered

- **Hand-wired `imports` arrays (status quo)** — what every standalone app does today; scales with templates.
- **Language-service auto-import only (#68522, #47689)** — solves editing, not the build; no global components; per-editor variance.
- **NgModule declarations** — pre-standalone quasi-global registration; unavailable to standalone-only apps.
- **Custom builders / esbuild plugins** (`@angular-builders/custom-esbuild`; plugin types via `@angular/build` `src/private.d.ts`) — the standard answer in #26859/#29149; private API tracking per major; must be replicated across the `build`, `serve`, and `test` pipelines.
- **Repo-level codegen scripts + pre-hooks** (generated barrel of discovered components) — works today without CLI support, but opt-in per repo, no live rediscovery on file add, and generated types can drift from the editor.

### Relationship to previously closed requests

I searched open and closed issues before filing. #26859, #29149, #27951, #27695 asked to **expose Vite/esbuild configuration or plugin hooks** and were closed `not_planned`. This request is deliberately not that ask: it proposes a bounded, declarative, schema-validated builder option (like `fileReplacements`, which the team already maintains) rather than a bundler-config passthrough or custom transform hook. No bundler configuration is exposed; AOT remains authoritative.

Note: the sibling issue asks for override precedence (same-selector substitution) — THIS issue asks for the auto-import half only; deliberately split so both stay narrowly scoped. The language-service issues (#68522, #47689) are adjacent and editor-side — not the same ask.

### References

- unplugin-vue-components (dirs scan + import injection + `components.d.ts`): https://github.com/unplugin/unplugin-vue-components
- Language-service auto-import: https://github.com/angular/angular/issues/68522 and https://github.com/angular/angular/issues/47689
- Vite used in dev-server capacity only (build-parity constraint): https://angular.dev/tools/cli/build-system-migration
- Plugin types private: https://app.unpkg.com/@angular/build@22.1.7/files/src/private.d.ts
- Roadmap hook: https://angular.dev/roadmap

If this is the wrong venue or the scope should be split (builder vs compiler), please point me to the right place and I'll refile.

<!-- ========================== ISSUE BODY END ========================== -->

---

## Submission checklist

- [ ] Re-run duplicate search (open **and** closed): "auto import components", "global components", "component registry", "standalone imports", "build plugins" in angular/angular + angular/angular-cli. Research verdict 2026-10-04: build-side auto-import half **novel** — all prior hits language-service.
- [ ] Confirm no new duplicate landed since research date.
- [ ] **Voting gate:** per https://github.com/angular/angular/blob/main/contributing-docs/feature-request-consideration.md — after manual roadmap check, bot opens voting; **≥20 👍 on the ORIGINAL issue description within 60 days (new issues)** or the bot closes as `feature: insufficient votes`. Comments don't count. Plan vote mobilization before filing.
- [ ] Expect "implement as a separate package" counter-offer (same doc) — prepared answer: only the CLI can guarantee `build`/`serve`/`test` symmetry + `strictTemplates` authority for this resolution.
- [ ] Template fields mapped: `command` = `build` + `serve` + `test`; body sections land in `description` / `desired-solution` / `alternatives` textareas (table above).
- [ ] Labels are triage-set (`feature`, `area:*`); do not request labels in the body.
- [ ] Tone check: neutral, collaborative, no demands; guidance-offer paragraph present (Angular CoC — Contributor Covenant 1.4).
- [ ] Link back to research artifacts: `.opencode/thoughts/research/2026-10-04-angular-component-override-proposal-venue.md`, `.opencode/thoughts/research/2026-09-30-angular-component-auto-discovery.md`.
- [ ] Keep title ≤ ~70 chars, lead with the ask (current: `Add template-driven component auto-import to the application builder`).

## Package naming note

Working name: **`angular-auto-imports`** — scoped to template-driven import injection (global components). The sibling **`unplugin-angular-components`** covers override substitution (see sibling draft). The split keeps each change request narrow; if triage counters "separate package," both names are already ecosystem-slot compatible (unplugin family).
