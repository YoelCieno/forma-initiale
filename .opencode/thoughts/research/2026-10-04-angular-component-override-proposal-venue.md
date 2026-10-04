# Angular proposal — venue + duplicate research
_Built-time component overriding + template-driven component resolution. Target: official Angular GitHub._

Date: 2026-10-04. Sources cited inline; full list at bottom.

---

## 1. Recommended venue + why

**Primary: feature-request ISSUE in `angular/angular-cli`** (template `.github/ISSUE_TEMPLATE/2-feature-request.yml`), NOT a Discussion, NOT a PR.

- Both repos route features via issue: "You can _request_ a new feature by [submitting an issue]" — angular/angular CONTRIBUTING (https://github.com/angular/angular/blob/main/CONTRIBUTING.md); same text in angular/angular-cli CONTRIBUTING (https://github.com/angular/angular-cli/blob/main/CONTRIBUTING.md).
- **angular/angular Discussions = RFCs only.** Only one category exists: `RFCs`, and every listed RFC is `announced` by a team member (https://github.com/angular/angular/discussions). Community RFC posts are not the entry path. `has_discussions: true` for angular/angular, `false` for angular-cli (GitHub API `/repos/angular/angular`, `/repos/angular/angular-cli`).
- CLI issue fits the ask: build/serve/test pipeline (esbuild plugin ordering, `serveWithVite`, `ng test` transforms) lives in angular-cli (`@angular/build`), not core.
- **If template-driven resolution requires compiler/language-service changes → second issue in `angular/angular`** using `2-feature-request.yaml` (fields: affected packages dropdown incl. `compiler-cli`, Description, Proposed solution, Alternatives considered — required) cross-linked from the CLI issue. See angular/angular template: https://github.com/angular/angular/blob/main/.github/ISSUE_TEMPLATE/2-feature-request.yaml
- CLI template fields: Command dropdown (pick `build` + `serve` + `test`), Description (required), "Describe the solution you'd like", "Describe alternatives you've considered" — plus banner: "search open and closed issues before submitting" (https://github.com/angular/angular-cli/blob/main/.github/ISSUE_TEMPLATE/2-feature-request.yml).
- **Automated voting gate**: after manual roadmap check, bot opens voting; **≥20 👍 on the ORIGINAL issue description = formally considered; otherwise bot closes it.** New issues get 60-day voting window; 60+ day-old issues get 20 days. Source: https://github.com/angular/angular/blob/main/contributing-docs/feature-request-consideration.md
- Same doc explicitly steers implementers elsewhere: "Often implementing the feature as a separate package is a better option" (runtime size, learning curve, maintainer burden). Expect this counter-offer — pre-empt it in the issue body.
- Timing hook: roadmap has an open workstream "**Enhanced Ecosystem compatibility** … we'll explore the requirement space of cross framework interop and **our build tooling** to improve our compatibility" (https://angular.dev/roadmap#enhanced-ecosystem-compatibility). Frame the ask as feeding this workstream.

_Not recommended as primary:_ Stack Overflow / Discord (support questions — CONTRIBUTING says such issues are systematically closed); PR (see rule 4 below).

## 2. Conduct / etiquette rules shaping the draft (numbered)

1. **Search open + closed issues first** — mandatory in both CONTRIBUTINGs and repeated in the CLI feature-request template banner (angular/angular CONTRIBUTING "Before you submit an issue, please search the issue tracker"; CLI template: "search open and closed issues before submitting").
2. **Right channel**: bugs/features → issues; questions → Stack Overflow (`angular` tag) or Angular Discord; "we will systematically close all issues that are requests for general support" (both CONTRIBUTINGs).
3. **Major feature = open issue and outline proposal BEFORE any implementation** — "This process allows us to better coordinate our efforts, prevent duplication of work" (angular/angular CONTRIBUTING, Missing a Feature). No unsolicited large PRs: "Do not open pull requests that are addressing feature requests that are not labeled as 'help wanted'" (angular/angular CONTRIBUTING, Contribution Quality §7).
4. **Design discussion belongs in the issue, not a PR**: "Pull requests are not the right place to do design work. When in doubt, open an issue first" (angular/angular CONTRIBUTING, §3).
5. **No speculative implementation** before the request is accepted — same doc; plus feature-request-consideration.md steers to separate packages.
6. **Code of Conduct** = Contributor Covenant 1.4: welcoming/inclusive language, respect, constructive criticism, no trolling/insults/personal attacks; applies to ALL Angular channels incl. GitHub; enforcement via conduct@angular.io (https://github.com/angular/angular/blob/main/CODE_OF_CONDUCT.md).
7. **Voting discipline**: 👍 must land on the **original issue body** within the window (60d new / 20d old) — comments don't count. Labels progress `feature` → `feature: votes required` → `feature: insufficient votes` | `feature: under consideration` | `feature: in backlog` (label descriptions from GitHub API, both repos).
8. **Closed issues auto-lock after 30 days** — if closed, a fresh issue with up-to-date context is the sanctioned path, not necro-comments (https://github.com/angular/angular/blob/main/contributing-docs/auto-issue-locking.md).
9. **Triage reality**: caretaker assigns `area:*`; feature gets `feature` label; infeasible requests closed with explanation; RFC/discussion label only for technical-implementation discussions (https://github.com/angular/angular/blob/main/contributing-docs/triage-and-labelling.md).
10. **If implementation ever offered**: CLA required, conventional commits, tests + docs required for public API (both CONTRIBUTINGs; https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md).

## 3. Existing related issues table

| Repo | # | Title | Status | Overlap with our ask |
|---|---|---|---|---|
| angular/angular-cli | **26859** | Allow custom vite configuration & plugins | **closed `not_planned` 2024-01-12** — alan-agius4: "Exposing vite configuration does not align with the Angular CLI design goals. To add additional Vite plugins please use a custom builder." (8 👎 on that comment) | **High** — same "expose transform hook" half; rejected as design-goal mismatch |
| angular/angular-cli | **29149** | Add vite plugin support for dev server | **closed `not_planned` 2024-12-19** — alan-agius4: "Custom middleware's are allowed to be added when using custom builders that extend the default builder. Such example is https://github.com/just-jeb/angular-builders" | **High** — `serveWithVite` hook ask; rejected → pointed to custom builders |
| angular/angular-cli | **11787** | Build process hook | **OPEN since 2018-08**, labels `feature`, `feature: under consideration`, **78 👍**, 24 comments (incl. codegen-before-AOT use cases; dgp1130 COLLABORATOR 2022: remaining gaps = "Codegen of source files to use in an Angular compilation" + pre/post build steps) | **High (precedent)** — proves build-lifecycle-hook demand passed vote threshold and stayed open; also proves vector: pre-AOT codegen ask exists but no component-resolution ask |
| angular/angular-cli | 27951 | vitePlugins options at serveWithVite | closed `not_planned` 2024-07-02 (label `needs: more info`) | High — identical mechanism ask |
| angular/angular-cli | 27695 | [Feature][Vite] Add support for external vite.config.js | closed `not_planned` 2024-06-06 | Medium — reporter himself conceded "not all vite plugins will work properly with angular" |
| angular/angular-cli | 26849 | When can we config Plugin or custom config for `builder: application` / `browser-esbuild` | closed `completed` 2024-01 | Medium — esbuild-side variant of same ask |
| angular/angular-cli | 29003 | Define, webpack transforms and esbuild plugins are not supported in v19 Karma Builder | closed `completed` 2025-01 (bug) | Medium — corroborates repo AGENTS gotcha #17: test pipeline has no supported transform surface |
| angular/angular-cli | 30742 | Expose internal "instrumentForCoverage" option | **OPEN**, `feature: under consideration`, **62 👍** (2025-07) | Framing precedent — narrow "expose one internal option" ask = accepted shape; "give us Vite config" ask = rejected shape |
| angular/angular-cli | 19390 | fileReplacements no longer accept .html replacements in Angular 11 | closed `completed` 2020 | Historical — Angular once shipped config-dependent template swapping, then removed it; useful "we had this, lost it" framing |
| angular/angular | 68522 | Prefer components over directives for auto-import in template suggestions | **open**, `needsTriage`, `area: language-service` | Adjacent — auto-import exists **editor-side (LS) only**, not build-side |
| angular/angular | 47689 | auto import … standalone Component in template like WebStorm (VS Code) | closed `completed` 2022 | Adjacent — same demand satisfied at language-service level, never at build level |
| just-jeb/angular-builders | 1617 / 1721 | Custom vite builder / Vite loader plugins | open (community repo) | Where maintainers route this class of ask (referenced from 26859 + 29149) |

Repo-local evidence (not web): AGENTS.md gotcha #17 — `ng test` `externalPackages: true` orphans transforms, signal inputs invisible under JIT. Keep as motivating repro, cited as "our workspace finding", not as an Angular issue link.

## 4. Duplicate-risk verdict

**Not a duplicate — but ~50% overlap with a twice-rejected ask.**

- Transform-hook half (esbuild `onLoad` / `serveWithVite` / test transforms) = **already asked ≥4× and rejected as `not_planned`** (#26859, #29149, #27951, #27695). Verbatim re-ask = fast close with "use a custom builder".
- Component-override + template-driven resolution half = **no existing issue found** in angular/angular or angular/angular-cli (searched: "component override", "component replacement", "auto import components", "build plugins", "tenant/white label", "esbuild plugin in:title" — 14 esbuild-plugin hits all internal refactors/unrelated; auto-import hits all language-service). Verdict: **novel as an issue**.
- Nearest structural precedent for a OPEN, vote-passing request: **#11787 (build hook, 78👍, under consideration)** and **#30742 (narrow option exposure, 62👍)** — both narrow asks. Both closed vite-plugin asks were broad "expose config" asks.
- Mitigation: frame around **Angular-owned semantics** (component resolution / override mapping / tenant selection), not around Vite config access; explicitly cite #26859 + #29149 and explain how this differs (bounded, declarative, testable, does not expose bundler config); offer custom-builder support stabilization as fallback.

## 5. Recommended proposal framing

Fit Angular's accepted feature-request shape: **narrow, declarative, Angular-semantics ask → not "bundler escape hatch"**.

**Primary ask (recommended): declarative build-time component override mapping + template resolution**
- `angular.json` (or builder option) shaped like the existing `fileReplacements` mechanism (schema already carries `fileReplacements` — `packages/angular/build/src/builders/application/schema.json`), e.g. `componentOverrides: [{ selector/module: X, with: Y }]` resolved **before AOT**, applied consistently in `build`, `serve`, and `test`.
- Rationale: extends a concept Angular already ships (file-level substitution) to component level; stays declarative so CLI keeps "build system abstraction" (the stated reason #26859 was rejected); covers tenant/white-label use case from our repo.
- Template-driven auto-resolution can be scoped as opt-in (`autoResolveComponents: true`) — echo of completed roadmap item "Streamline standalone imports with Language Service" (editor-only today, https://angular.dev/roadmap#completed-projects).

**Alternative ask (if primary refused): supported pre-AOT transform hook contract**
- Documented, versioned extension point ordered relative to the Angular compiler plugin (not raw esbuild plugin array), e.g. `transformTemplate`/`resolveComponentSymbols` callback in builder options, guaranteed in `build`/`serve`/`test`.
- Tradeoff: still smells like "custom builder internals exposed" — must state invariants (AOT remains authoritative, diagnostics preserved, cache keys defined) to address "supportability" objection.

**Fallback / concession to offer: first-class custom-builder contract**
- Team's standing answer is "use a custom builder like just-jeb/angular-builders" (#26859, #29149). Counter-argument already on record from community (#29149, johncrim): third-party builders track internals and lag releases. Ask = export stable injection points for `serveWithVite` + test runner so custom builders stop reverse-engineering internals. Lower ambition, higher acceptance odds.

**Do NOT open with**: "expose Vite config", "let us add esbuild plugins" — verbatim text of rejected requests.

**Body structure** (matches CLI template): Command = build, serve, test → Description = tenant/white-label override use case + 3 concrete failure points (esbuild onLoad ordering vs AOT plugin, no Vite hook in serveWithVite, `externalPackages` test bypass) → Solution = primary ask + sketch → Alternatives = custom builder (cite why brittle), `fileReplacements` (removed .html support, #19390), `NgComponentOutlet`/DI/standalone `imports` (runtime-only, no build-time selection).

## 6. Open questions for user

1. **One issue or two?** CLI-only (build pipeline) keeps it focused but can't deliver template-driven resolution if compiler changes needed → split into angular/angular (`compiler-cli`) + angular/cli with cross-links?
2. **Which ask is primary?** Declarative `componentOverrides` (new API, needs 20👍 + team maintenance sign-off) vs supported transform hook (smaller, but sits on rejected ground) vs stable custom-builder contract (safest, weakest guarantee)?
3. **Vote mobilization** — can user realistically get ≥20 distinct 👍 in 60 days on the original body? Threshold is hard (feature-request-consideration.md).
4. **Will user accept the likely "build a separate package" counter-offer?** If not, issue must argue why Angular must own it (AOT/serve/test symmetry only Angular can guarantee).
5. **Scope of test story** — include `ng test` externalPackages (AGENTS #17) in same issue, or keep test-builder gap as separate evidence-only bullet?
6. **Timing** — attach ask to roadmap "Enhanced Ecosystem compatibility / build tooling" workstream, or stay silent on roadmap alignment and let triage decide?
7. **Repro asset** — minimal repro repo showing esbuild plugin ordering collision + serveWithVite limitation? (CONTRIBUTING demands minimal repro for bugs; features benefit from one too.)

## 7. Sources

- https://github.com/angular/angular/blob/main/CONTRIBUTING.md
- https://github.com/angular/angular/blob/main/CODE_OF_CONDUCT.md
- https://github.com/angular/angular-cli/blob/main/CONTRIBUTING.md
- https://github.com/angular/angular/blob/main/.github/ISSUE_TEMPLATE/2-feature-request.yaml
- https://github.com/angular/angular-cli/blob/main/.github/ISSUE_TEMPLATE/2-feature-request.yml
- https://github.com/angular/angular/blob/main/contributing-docs/feature-request-consideration.md
- https://github.com/angular/angular/blob/main/contributing-docs/triage-and-labelling.md
- https://github.com/angular/angular/blob/main/contributing-docs/auto-issue-locking.md
- https://github.com/angular/angular/discussions (RFCs-only category)
- https://github.com/angular/angular-cli/issues/26859
- https://github.com/angular/angular-cli/issues/29149
- https://github.com/angular/angular-cli/issues/27951
- https://github.com/angular/angular-cli/issues/27695
- https://github.com/angular/angular-cli/issues/26849
- https://github.com/angular/angular-cli/issues/29003
- https://github.com/angular/angular-cli/issues/11787
- https://github.com/angular/angular-cli/issues/30742
- https://github.com/angular/angular-cli/issues/19390
- https://github.com/angular/angular/issues/68522
- https://github.com/angular/angular/issues/47689
- https://github.com/just-jeb/angular-builders/issues/1617
- https://github.com/just-jeb/angular-builders/issues/1721
- https://angular.dev/roadmap (Enhanced Ecosystem compatibility; Streamline standalone imports with Language Service)
- https://angular.dev/ecosystem/custom-build-pipeline
- https://github.com/unplugin/unplugin-vue-components (auto-import + `allowOverrides` option)
- https://abp.io/docs/latest/framework/ui/angular/component-replacement (runtime Replaceable Components)
- https://angular.dev/api/common/NgComponentOutlet (runtime dynamic component outlet)
- https://github.com/angular/angular-cli/blob/main/packages/angular/build/src/builders/application/schema.json (`fileReplacements`)
