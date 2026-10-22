# UI Component Library Research — May 23, 2026

## Context

forma-initiale monorepo: Turborepo + bun, hexagonal architecture.

- `packages/ui/` MUST stay framework-agnostic (vanilla TS)
- Current app: `apps/web-vue` (Vue 3 + Vite 6)
- Future apps: Angular, React
- DS tokens will be added separately (unstyled / minimal styles needed)
- Accessibility required
- Good TypeScript DX

---

## Candidates Evaluated

| #   | Library                     | Ver            | Stars | Framework Support                                     | Status  |
| --- | --------------------------- | -------------- | ----- | ----------------------------------------------------- | ------- |
| 1   | **AgnosticUI v2**           | 2.0.0-alpha.29 | 809   | Vue (full), React (full), Lit (full), Angular (basic) | alpha   |
| 2   | **Headless UI**             | 2.1            | 30k+  | React + Vue only                                      | stable  |
| 3   | **Reka UI** (fka Radix Vue) | 2.9.7          | 6.5k  | Vue 3 only                                            | stable  |
| 4   | **Ark UI**                  | 4.9.1          | 4k    | React + Vue + Solid + Svelte                          | stable  |
| 5   | **Ariakit**                 | 0.4.28         | 8.6k  | React only (Solid exp.)                               | pre-1.0 |
| 6   | **Custom build** (in-house) | —              | —     | All frameworks (pure TS)                              | own     |

---

## Detailed Analysis

### 1. AgnosticUI v2

**npm:** `agnosticui-core@2.0.0-alpha.29`, `agnosticui-cli@2.0.0-alpha.25`
**License:** Apache-2.0
**Bundle:** ~5MB unpacked (core + 55 components), 3 runtime deps: `lit`, `focus-trap`, `@floating-ui/dom`
**TypeScript:** Required for CLI approach. Uses `experimentalDecorators: true` (Lit decorators).

#### Architecture

- Core authored as Lit Web Components
- CLI copies source into `src/components/ag/` — local-first, no node_modules lock-in
- Vue wrappers are `.vue` SFCs, React wrappers are `.tsx`
- Theming via CSS custom properties (`--ag-*` tokens)
- AI-centric: Playbooks + `ag context` generator for LLM tooling

#### Framework Support

| Framework | Level | How                                            |
| --------- | ----- | ---------------------------------------------- |
| Vue       | Full  | Vue SFC wrappers in `Button/vue/VueButton.vue` |
| React     | Full  | React wrappers via `@lit/react`                |
| Lit       | Full  | Direct web components (`<ag-button>`)          |
| Angular   | Basic | Use Lit web components directly                |
| Svelte    | Basic | Use Lit web components directly                |
| Solid     | Basic | Use Lit web components directly                |

#### Critical Issues for forma-initiale

1. **Experimental Alpha** — docs say "not ready for production". Breaking changes expected.
2. **Lit runtime required** — `packages/ui/` would depend on `lit`, breaking framework-agnostic rule
3. **Vite config needed** — `isCustomElement: (tag) => tag.startsWith('ag-')` for Vue template compiler
4. **CLI workflow** — components get copied into project source. Hard to version-control shared wrappers in monorepo
5. **Angular support is "basic"** — no Angular wrappers, must use raw web components
6. **Decorator requirement** — `experimentalDecorators: true` conflicts with modern TS in monorepo
7. **Updates** — manual sync via `npx agnosticui-cli sync`, not standard npm update
8. **Small community** — 809 stars, 1 open issue (could mean slow development)
9. **AI focus** — main selling point is AI context generation, not component quality or DX

#### Verdict

❌ **Reject.** Alpha stage, Lit dependency breaks framework-agnostic rule, Angular support weak, CLI workflow unsuitable for monorepo.

---

### 2. Headless UI (Tailwind Labs)

**npm:** `@headlessui/react`, `@headlessui/vue`
**License:** MIT
**GitHub:** 30k+ stars
**Components:** ~10 (Menu, Listbox, Combobox, Dialog, Disclosure, Popover, Tab, Transition, Switch, RadioGroup)

#### Framework Support

| Framework | Support |
| --------- | ------- |
| Vue       | Full    |
| React     | Full    |
| Angular   | ❌ None |
| Svelte    | ❌ None |

#### Assessment

- Excellent DX, simple API, built-in accessibility
- Tight Tailwind CSS integration (optional but natural)
- **No Angular support** — dealbreaker for planned Angular app
- Small component set (no Accordion, Tooltip, Slider, Toast, etc.)
- No TypeScript deep typing (good but basic)
- Stable, well-maintained by Tailwind Labs

#### Verdict

❌ **Reject.** No Angular support + too few components.

---

### 3. Reka UI (fka Radix Vue)

**npm:** `reka-ui@2.9.7`
**License:** MIT
**GitHub:** 6.5k stars
**npm downloads:** ~590k/week
**Last release:** May 5, 2026 (very active)

#### Framework Support

| Framework | Support                  |
| --------- | ------------------------ |
| Vue 3     | Full (40+ components)    |
| React     | ❌ (use Radix UI)        |
| Angular   | ❌ None                  |
| Nuxt      | Full (Nuxt UI uses Reka) |

#### Assessment

- Excellent Vue 3 headless library
- WAI-ARIA compliant, keyboard nav, focus management
- TypeScript first-class
- Used by Nuxt UI (Vercel-backed)
- Active community, constant releases
- **Vue-only** — no React, no Angular
- `asChild` pattern for composition
- Modular install, tree-shakeable

#### Verdict

❌ **Reject for packages/ui/.** Vue-only. Breaks framework-agnostic requirement. Could be used **inside** `apps/web-vue/` only, but that creates framework lock-in.

---

### 4. Ark UI (Chakra Systems)

**npm:** `@ark-ui/react`, `@ark-ui/vue`, `@ark-ui/solid`, `@ark-ui/svelte`
**License:** MIT
**GitHub:** 4k+ stars
**Components:** 45+
**Last release:** Active (hours ago)
**Bundle:** ~196KB min+gzip

#### Framework Support

| Framework | Support |
| --------- | ------- |
| React     | Full    |
| Vue 3     | Full    |
| Solid     | Full    |
| Svelte    | Full    |
| Angular   | ❌      |

#### Architecture

- Built on **Zag.js** state machines — predictable, framework-agnostic logic
- Same API across all supported frameworks
- Completely unstyled (bring your own CSS/Tailwind/Panda)
- WCAG compliant, tested with real AT
- Full TypeScript support

#### Why It's Close

- Framework-agnostic core (Zag.js) means consistent behavior
- Vue + React covered now
- Good component breadth (45+ components)
- Strong team behind it (Chakra Systems, full-time engineers)
- Production-ready (used by OVHCloud, PluralSight)
- Active development (last commit hours ago)

#### Why It Falls Short

- **No Angular support** — cannot serve future Angular app
- Zag.js deep dependency could add complexity
- Still relatively young (2 years)

#### Verdict

⚠️ **Strong candidate for React+Vue only.** Rejected only due to missing Angular support. If Angular plans change, this becomes top pick.

---

### 5. Ariakit

**npm:** `@ariakit/react@0.4.28`
**License:** MIT
**GitHub:** 8.6k stars
**npm downloads:** 643k/week
**Last release:** 14 days ago (active)

#### Framework Support

| Framework | Support                         |
| --------- | ------------------------------- |
| React     | Full (40+ components)           |
| Solid     | Experimental (`@ariakit/solid`) |
| Vue       | ❌                              |
| Angular   | ❌                              |

#### Assessment

- Excellent accessibility, keyboard nav, composition
- State-driven API (store-based)
- Good TypeScript
- Modern React patterns
- Pre-1.0 (0.4.x), but stable and widely used
- MIT with Plus features (paid)
- React-only (Vue/Solid/Angular not supported)

#### Verdict

❌ **Reject.** React-only. Cannot serve Vue or Angular.

---

### 6. Custom Build (In-House)

**Approach:** Write pure TS composables/hooks in `packages/ui/` that implement WAI-ARIA patterns without any framework dependency. Each app wraps them with its framework's reactivity layer.

#### Architecture

```
packages/ui/
  composables/
    useButton.ts       # Pure TS: ARIA attrs, keyboard events, disabled state
    useDialog.ts       # Pure TS: open/close, focus trap, escape handling
    useCombobox.ts     # Pure TS: list navigation, filtering
    ...
  tokens/
    _variables.scss    # DS tokens
    _mixins.scss       # Common patterns
  styles/
    button.scss        # Structural CSS (no colors)
    dialog.scss
    ...
```

Each app:

- Vue: `apps/web-vue/src/composables/useButton.ts` → wraps `packages/ui/composables/useButton.ts` with Vue `ref`/`computed`
- Angular: `apps/white-label-angular/src/directives/button.directive.ts` → same
- React: `apps/web-react/src/hooks/useButton.ts` → same

#### Framework Support

| Framework | Support             |
| --------- | ------------------- |
| Any       | ✅ Full (by design) |

#### Pros

- ✅ **Framework-agnostic** by definition — pure TS, zero framework imports
- ✅ Zero runtime dependencies
- ✅ Full control over accessibility implementation
- ✅ Perfect fit for DS tokens (just import SCSS variables)
- ✅ Turborepo-native — just another package in the workspace
- ✅ No breaking changes from upstream
- ✅ Bundle size = what you write, nothing more
- ✅ Can use any framework in `apps/` without adapter libraries

#### Cons

- ❌ Highest initial effort (build every primitive from scratch)
- ❌ Accessibility requires deep expertise (WAI-ARIA, keyboard nav, screen reader testing)
- ❌ No existing component library to copy from — must build patterns
- ❌ Ongoing maintenance burden
- ❌ Edge cases (focus management, RTL, i18n) must be handled manually

#### Risk Mitigation

- Reference implementations from Ariakit, Radix UI, and ARIA Authoring Practices
- Start small: Button, Input, Dialog, Tabs, Tooltip — extend incrementally
- Use existing ARIA patterns as spec, not as code to copy

#### Verdict

✅ **Best strategic fit for this monorepo.** Only option that:

1. Keeps `packages/ui/` fully framework-agnostic
2. Serves Vue 3 now + Angular + React later with zero adapter work
3. Integrates cleanly with Turborepo workspace model
4. Accepts DS tokens naturally

---

## Comparison Table

| Criteria                    | AgnosticUI v2                   | Headless UI       | Reka UI             | Ark UI                 | Ariakit        | Custom               |
| --------------------------- | ------------------------------- | ----------------- | ------------------- | ---------------------- | -------------- | -------------------- |
| **Vue 3**                   | ✅ Full                         | ✅ Full           | ✅ Full             | ✅ Full                | ❌             | ✅                   |
| **Angular**                 | ⚠️ Basic (web comp)             | ❌                | ❌                  | ❌                     | ❌             | ✅                   |
| **React**                   | ✅ Full                         | ✅ Full           | ❌                  | ✅ Full                | ✅ Full        | ✅                   |
| **Framework-agnostic core** | ❌ (Lit-based)                  | ❌ (React/Vue)    | ❌ (Vue)            | ⚠️ (per-framework pkg) | ❌ (React)     | ✅ Pure TS           |
| **Accessibility**           | ✅ Good                         | ✅ Good           | ✅ Excellent        | ✅ Excellent           | ✅ Excellent   | ⚠️ Must build        |
| **TypeScript**              | ⚠️ Needs experimentalDecorators | ✅ Good           | ✅ Excellent        | ✅ Excellent           | ✅ Excellent   | ✅ Full control      |
| **Bundle size**             | Heavy (Lit + 3 deps)            | Light (~10 comps) | Light (modular)     | ~196KB (per framework) | Light          | As built             |
| **Component count**         | 55                              | ~10               | 40+                 | 45+                    | 40+            | As built             |
| **Community**               | Small (809 ★)                   | Huge (30k ★)      | Large (6.5k ★)      | Medium (4k ★)          | Large (8.6k ★) | N/A                  |
| **Maintenance**             | Alpha, risky                    | Stable, active    | Stable, very active | Active                 | Active         | Self                 |
| **Production ready**        | ❌ (alpha)                      | ✅                | ✅                  | ✅                     | ⚠️ (0.4.x)     | ✅ (when done)       |
| **Monorepo fit**            | ⚠️ CLI copies files, tricky     | ✅ npm packages   | ✅ npm package      | ✅ npm packages        | ✅ npm package | ✅ Workspace package |
| **Integration effort**      | Medium (CLI, Vite config extra) | Low               | Low                 | Low                    | Low            | High                 |
| **Angular planned support** | ⚠️ Basic only                   | ❌                | ❌                  | ❌                     | ❌             | ✅ Native            |
| **DS token compatibility**  | ✅ CSS vars                     | ✅ Any            | ✅ Any              | ✅ Any                 | ✅ Any         | ✅ Direct SCSS       |

---

## Risk Register

| Risk                                      | Likelihood | Impact | Mitigation                                                                            |
| ----------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------- |
| Custom build takes too long               | Medium     | High   | Start with 5-10 core components only; use as-needed                                   |
| Custom build has a11y gaps                | Medium     | High   | Reference WAI-ARIA Authoring Practices rigorously; test with screen reader + axe-core |
| Framework-specific wrappers diverge       | Low        | Medium | Shared types in `packages/ui/` enforce contract; CI type-checks all apps              |
| Team prefers "batteries included" library | Medium     | Low    | Can still use Reka UI inside `apps/web-vue/` alongside custom base                    |
| Angular app never materializes            | Low        | Low    | If only Vue+React, can adopt Ark UI later                                             |

---

## Recommendation

### Adopt: Custom build in `packages/ui/`

**Rationale:**

1. **Framework-agnostic is non-negotiable** — `packages/ui/` must stay pure TS. Every library evaluated either lacks Angular support (Ark UI, Headless UI, Ariakit), is Vue-only (Reka UI), or is alpha quality with a Lit dependency that leaks into `packages/ui/` (AgnosticUI v2).

2. **Monorepo structure fits custom build** — `packages/ui/` is already designated as framework-agnostic in project memory. The Turborepo workspace model makes shared TS packages trivial.

3. **DS tokens integration** — custom SCSS variables in `packages/ui/` is the natural home for design tokens. No library adapter needed.

4. **Future-proof** — When Angular app arrives, same `packages/ui/` composables work without changes. Each app writes thin framework wrappers.

### Pragmatic Annex: Hybrid if pressed

If custom build velocity is too slow for `apps/web-vue/` delivery:

1. **Use Reka UI inside `apps/web-vue/`** for complex components (Dialog, Combobox, Menu, Tooltip)
2. **Keep `packages/ui/` pure TS** with Button, Input, Typography, Layout primitives
3. **Replace Reka UI with custom** as each component is built

This avoids framework lock-in while letting Vue app move fast.

### Don't adopt AgnosticUI v2

Wait until it exits alpha and has native Angular support. Current state is too risky for a foundational UI layer.

---

## Appendix: Key Stats Summary

| Library       | GitHub Stars | npm Weekly DLs | Last Release | Open Issues |
| ------------- | ------------ | -------------- | ------------ | ----------- |
| AgnosticUI v2 | 809          | N/A (CLI)      | alpha        | 1           |
| Headless UI   | 30k+         | ~5.5M          | active       | —           |
| Reka UI       | 6.5k         | ~590k          | May 5, 2026  | —           |
| Ark UI        | 4k           | ~513k          | May 23, 2026 | ~7          |
| Ariakit       | 8.6k         | ~643k          | May 9, 2026  | —           |
