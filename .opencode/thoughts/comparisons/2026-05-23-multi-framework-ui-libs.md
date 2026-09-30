# Multi-Framework UI Component Libraries Comparison

**Date:** 2026-05-23
**Context:** forma-initiale Turborepo monorepo needs unstyled/headless UI components working identically in Vue 3, Angular, and React.

---

## Executive Summary

**There is no truly unstyled, production-ready, cross-framework (Vue 3 + Angular + React) component library in 2026.**

The requirement space is inherently conflicted:

- Web components = only tech that works natively across all 3 frameworks
- But every production-ready web component library ships with a design system (not unstyled)
- True "headless" libraries (Radix, Reka UI, Headless UI, Base UI) are all framework-specific

The closest practical answer is **Web Awesome** (Shoelace successor), which is highly customizable but NOT unstyled.

---

## Candidate Deep-Dives

### 1. Web Awesome (Shoelace successor) ⭐ RECOMMENDED

| Attribute            | Value                                                              |
| -------------------- | ------------------------------------------------------------------ |
| **npm**              | `@awesome.me/webawesome`                                           |
| **Version**          | 3.7.0                                                              |
| **License**          | MIT (Core) / Pro license for extra features                        |
| **GitHub**           | github.com/shoelace-style/webawesome                               |
| **Components**       | 50+ (buttons, dialogs, selects, menus, tables, date pickers, etc.) |
| **Framework Guides** | ✅ React, ✅ Vue, ✅ Angular, ✅ Svelte                            |
| **Unstyled?**        | ❌ Full design system (themes, CSS reset, utilities)               |
| **Customization**    | CSS custom properties + `::part()` selectors + theming API         |
| **Backing**          | Font Awesome (Fonticons, Inc.) — commercial entity                 |
| **Last Release**     | Active (v3.7.0, current)                                           |
| **npm Downloads**    | Shoelace had ~60k/wk; Web Awesome new package, unknown             |

**Pros:**

- Largest web component library with dedicated framework integration docs
- v-model support in Vue, CUSTOM_ELEMENTS_SCHEMA in Angular, ref forwarding in React
- Actively maintained by paid team (Font Awesome)
- Tree-shakeable via individual imports
- Good a11y out of box

**Cons:**

- NOT unstyled — applies default styles, CSS reset, normalize
- Transition to commercial model (Pro features behind paywall)
- Package name changed from `@shoelace-style/shoelace` — migration needed
- Bundle size: ~6.5MB unpacked (but tree-shakeable)
- Future roadmap controlled by Font Awesome, not community

**Framework-specific notes:**

- **Vue 3:** Use `<wa-button>` directly. v-model works. Slots work. Need `@vuejs/vue-web-component-wrapper` not required — native custom elements.
- **Angular:** Add `CUSTOM_ELEMENTS_SCHEMA` in `NgModule`. Import `@awesome.me/webawesome` in `angular.json` scripts. Form controls need `ControlValueAccessor` wrappers (not auto).
- **React:** Ref forwarding via `ref`. Event handlers need `.addEventListener()` for custom events. Wrapper component pattern recommended.

**Verdict:** BEST PRACTICAL OPTION despite being a full design system. Customization depth is sufficient.

---

### 2. Lion Web Components (@lion/ui)

| Attribute        | Value                                                             |
| ---------------- | ----------------------------------------------------------------- |
| **npm**          | `@lion/ui`                                                        |
| **Version**      | 0.x (pre-1.0)                                                     |
| **License**      | MIT                                                               |
| **GitHub**       | github.com/ing-bank/lion                                          |
| **Stars**        | 1.9k                                                              |
| **Components**   | ~25 (form-focused: inputs, datepicker, select, radio, tabs, etc.) |
| **Unstyled?**    | ✅ Yes — "white-label" by design                                  |
| **Backing**      | ING Bank                                                          |
| **Last Release** | Some sub-packages 3+ years stale                                  |

**Pros:**

- Truly unstyled (functional styling only)
- WCAG 2.2 AA focused
- Good form control architecture

**Cons:**

- Low adoption (1.9k stars)
- Some packages stale (3yr old publishes)
- Pre-1.0 maturity
- Skeletal component set — no complex components (data table, tree, etc.)

**Verdict:** Too niche and immature for production use.

---

### 3. FAST (@microsoft/fast-element)

| Attribute         | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| **npm**           | `@microsoft/fast-element`, `@fluentui/web-components`    |
| **Version**       | 2.x                                                      |
| **License**       | MIT                                                      |
| **GitHub**        | github.com/microsoft/fast                                |
| **Stars**         | 9.5k                                                     |
| **Components**    | Via `@fluentui/web-components` (Fluent design)           |
| **React Wrapper** | `@microsoft/fast-react-wrapper` (last publish: ~1yr ago) |
| **Unstyled?**     | ❌ Fluent Design System components have default styling  |

**Pros:**

- Solid foundation (`@microsoft/fast-element`)
- Design system foundation can be customized heavily
- TypeScript-first
- React wrapper exists

**Cons:**

- Microsoft OSS graveyard risk (many MS OSS projects abandoned)
- React wrapper last updated ~1 year ago (v0.3.25)
- Pre-built components (`@fluentui/web-components`) moved out of FAST repo
- Complex setup compared to Web Awesome
- Not truly unstyled — tied to Fluent design tokens
- Framework integration docs are thin for Vue/Angular

**Verdict:** Microsoft commitment uncertain. Too risky for long-term dependency.

---

### 4. Material Web Components (@material/web)

| Attribute     | Value                                           |
| ------------- | ----------------------------------------------- |
| **npm**       | `@material/web`                                 |
| **Version**   | 2.4.1                                           |
| **License**   | Apache 2.0                                      |
| **GitHub**    | github.com/material-components/material-web     |
| **Stars**     | 10.9k                                           |
| **Status**    | ⛔ **MAINTENANCE MODE** pending new maintainers |
| **Unstyled?** | ❌ Material 3 design                            |

**Pros:**

- Official Google Material 3 web components
- Good component coverage
- CSS variable theming

**Cons:**

- **Maintenance mode** — Google stepped back
- Actively recommends Angular users use Angular Material instead
- No active feature development
- `material-components-web` (v1) already archived

**Verdict:** DEAD END. Do not adopt.

---

### 5. Spectrum Web Components (Adobe)

| Attribute      | Value                                    |
| -------------- | ---------------------------------------- |
| **npm**        | `@spectrum-web-components/...`           |
| **Version**    | 1.11.2                                   |
| **License**    | Apache 2.0                               |
| **GitHub**     | github.com/adobe/spectrum-web-components |
| **Components** | ~40+                                     |
| **Unstyled?**  | ❌ Adobe Spectrum 2 design               |

**Pros:**

- Adobe-backed, actively maintained
- Accessibility-first
- Good component set

**Cons:**

- Tied to Adobe's Spectrum design language
- NOT unstyled — very opinionated styling
- Heavy — many deps per component
- `@spectrum-web-components/bundle` has 74 dependencies

**Verdict:** Good for Adobe-aligned projects. Not unstyled. Not recommended for custom design.

---

### 6. Vaadin Web Components

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| **npm**        | `@vaadin/web-components`                |
| **Version**    | 24.9.0                                  |
| **License**    | Apache 2.0 (core) / Commercial for some |
| **GitHub**     | github.com/vaadin/web-components        |
| **Components** | 200+ (huge)                             |
| **Unstyled?**  | ❌ Lumo theme (opinionated)             |

**Pros:**

- Massive component library
- Extremely active development
- Good cross-framework docs
- Enterprise-grade

**Cons:**

- Opinionated Lumo theme — fighting styles to customize
- Heavy bundle (enterprise-scale)
- Java-backend focused ecosystem (Vaadin Flow)
- Commercial licensing for some features
- Not unstyled

**Verdict:** Overkill for this monorepo. Wrong weight class.

---

### 7. Framework-Specific Headless Libraries (for reference)

These do NOT meet the cross-framework requirement but are listed for completeness:

| Library           | Framework    | Unstyled? | Notes                                       |
| ----------------- | ------------ | --------- | ------------------------------------------- |
| **Reka UI**       | Vue 3 only   | ✅        | 2.9M monthly downloads, 40+ components      |
| **Headless UI**   | Vue + React  | ✅        | No Angular. Tailwind team.                  |
| **Radix UI**      | React only   | ✅        | 30+ primitives, best a11y                   |
| **Base UI (MUI)** | React only   | ✅        | From Radix/FLoating UI/MUI team             |
| **Ariakit**       | React only   | ✅        | Formerly Reakit                             |
| **PrimeNG**       | Angular only | ❌        | Has unstyled mode via `design-agnostic` API |
| **PrimeVue**      | Vue only     | ❌        | Has unstyled mode                           |
| **PrimeReact**    | React only   | ❌        | Has unstyled mode                           |

**PrimeTek suite** (PrimeNG + PrimeVue + PrimeReact): Shared design tokens/themes (PrimeOne), but each is a **separate library** with different APIs. Components are NOT shared across frameworks. Each has its own learning curve, API surface, and update cycle.

---

## Hard Truth: The "Unstyled Cross-Framework" Niche

The ideal product — unstyled, headless web components working identically in Vue 3, Angular, and React — **does not exist** because:

1. **Economic incentive mismatch** — Headless libraries thrive by being framework-specific (tighter integration, better DX). The Radix team built Base UI for React; Reka UI team built for Vue. No one builds headless for all 3.

2. **Web component overhead** — True web components need Shadow DOM, which makes styling harder (CSS must pierce shadow boundary). The "unstyled" pattern (render nothing, let consumer provide markup) is impossible with native web components that ship their own template.

3. **All production WC libraries ship design** — Web Awesome, Spectrum, Vaadin, FAST, Material Web all include default styles. The web component model encourages encapsulation of style.

---

## Recommendation

### Ranked Options

| Rank  | Library                                 | Why                                                                                | Why Not                                                   |
| ----- | --------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **1** | **Web Awesome**                         | Works today in all 3 frameworks. Active dev. 50+ components. MIT core. Great docs. | Full design system, not unstyled. Commercial future.      |
| **2** | **Roll your own WC wrappers** (Lit)     | Complete control. Truly unstyled. Fits hexagonal arch.                             | Very high effort. Need to build/maintain every component. |
| **3** | **Framework-specific headless per app** | Each app gets ideal headless lib.                                                  | No shared components. Violates "single shared UI" goal.   |

### For forma-initiale Specifically

**Recommendation: Web Awesome Core (MIT)**

Integration approach:

1. Install `@awesome.me/webawesome` in each app
2. In `packages/ui/`, create thin **framework-agnostic re-export wrappers** that import and re-export Web Awesome components (so apps import from `@repo/ui/button`, not directly from Web Awesome)
3. Customize via CSS variables in each app's theme layer (overriding `--wa-*` vars)
4. For truly unstyled primitives in `packages/ui/` (no default style), use vanilla TS functions + web component wrappers from Web Awesome's `@lit/reactive-element` under the hood

This gives:

- ✅ Shared component set across Vue 3, Angular, React
- ✅ Single source of truth in `packages/ui/`
- ✅ Framework-agnostic imports from `@repo/ui/*`
- ✅ Full customization via design tokens
- ✅ Production-ready (MIT, 50+ components, active)
- ❌ NOT truly unstyled (but acceptable tradeoff)

**Rejected alternatives:**

- Lion: too niche, too few components, stale
- FAST: Microsoft abandonment risk, complex
- Material Web: maintenance mode
- Spectrum: Adobe design lock-in
- Vaadin: enterprise overhead, heavy
- PrimeTek suite: separate libs per framework, different APIs
- Custom Lit build: too high cost

---

## Appendix: Integration Notes

### Web Awesome + Vue 3

```vue
<template>
  <wa-button variant="brand" @wa-focus="handleFocus"> Click me </wa-button>
</template>
```

- v-model works on form components
- Use `@wa-*` for custom events
- No wrapper needed

### Web Awesome + Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
```

```html
<!-- component template -->
<wa-button variant="brand" (waFocus)="handleFocus()"> Click me </wa-button>
```

- Form controls need `ControlValueAccessor` wrappers
- Use Angular event binding syntax for custom events

### Web Awesome + React

```tsx
import { useEffect, useRef } from 'react'

function MyButton() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    const handler = () => console.log('focused')
    el?.addEventListener('wa-focus', handler)
    return () => el?.removeEventListener('wa-focus', handler)
  }, [])

  return (
    <wa-button ref={ref} variant="brand">
      Click me
    </wa-button>
  )
}
```

- React event system doesn't handle WC custom events → use `addEventListener`
- `ref` for DOM access
- Wrapper component recommended to encapsulate event mapping
