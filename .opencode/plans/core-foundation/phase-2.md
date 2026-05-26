# Phase 2 — Web Awesome UI Layer

**Status:** 🔧 IN PROGRESS
**Last updated:** 2026-05-24

## Goal

Integrate Web Awesome (web component library, works with Vue 3 + Angular + React) as the base UI layer for the forma-initiale monorepo. Components live as thin re-export wrappers in `packages/ui/` so all framework-specific apps import from `@repo/ui/*` rather than directly from Web Awesome. Theming is managed via CSS custom property overrides (`--wa-*` variables) with design token files in `packages/ui/styles/`.

## 1. Architecture Decision: Hybrids (Functional WC Library)

After evaluating six WC frameworks (Lit, Stencil, Atomico, Hybrids, Haunted, Elemento, Uhtml) and raw Custom Elements, hybridJS (`hybrids` v9.1.22) was chosen for building custom component wrappers in `packages/ui/`.

### Why hybridJS

- **Plain objects + pure functions** — no classes, no `HTMLElement` extends, no manual `attributeChangedCallback`/`observedAttributes`
- **0 dependencies**, 208KB unpacked, MIT, tree-shakeable
- **V9 stable** since 2024, 3.2k ⭐, active maintenance (last release Jan 2026)
- **Declarative templates** via tagged literals `html\`...\`` — same ergonomics as Lit without the class model
- **Auto property reflection** to attributes, built-in change detection via equality check
- **Works alongside WA** — hybridJS components render `<wa-*>` elements inside their templates
- **Framework-agnostic** — outputs standard Custom Elements, works in Vue 3 + Angular + React
- **No build step** — ESM, works with Vite/Turborepo out of box

### Comparison: Native CE vs hybridJS for fe-button

| Aspect | Native CE (current) | hybridJS |
|--------|--------------------|----------|
| Lines of code | ~97 | ~30 |
| Class | `extends HTMLElement` | Plain object + functions |
| Lifecycle | `attributeChangedCallback`, `observedAttributes`, `connectedCallback` | Automatic via `define()` |
| Property/attr reflection | Manual `hasAttribute`, `getAttribute` | Built-in — dash-cased attrs auto-map |
| Template | `innerHTML` string | `html\`...\`` tagged literal |
| Change detection | Manual | Built-in cache + equality check |

### Why the FeButton.vue pattern is wrong

An earlier approach created `apps/web-vue/src/components/FeButton.vue` — a Vue SFC that wraps `<wa-button>`. This defeats the purpose of `packages/ui/` as a single source of truth for the UI layer. The whole point is to define each component once in framework-agnostic TypeScript. Per-app framework wrappers would duplicate every prop, event, and slot mapping across Vue, Angular, and React, multiplying maintenance effort without benefit.

Correct approach: use `<wa-button>` directly in Vue templates. No Vue wrapper needed. The component is already a native custom element; Vue renders it with `isCustomElement` configuration in `vite.config.ts`.

### Future evolution: When to add Lit

Lit (Google-backed, ~5 KB, used internally by Web Awesome) is the recommended WC library for when custom component logic is required. The following table guides when to add it:

| Scenario | Action |
|----------|--------|
| Re-export a single WA component | Thin wrapper (current pattern) — no Lit needed |
| Compose 2+ WA components into a compound UI | Build a Lit component that composes them |
| Controlled form component with custom validation | Build a Lit component wrapping the WA form control |
| Brand-new component not in WA catalog | Build a Lit component from scratch |
| Any wrapper that only adds event/prop typing | Thin wrapper — no Lit needed |

Lit is not added now. When the first compound component is needed, add `lit` to `packages/ui/package.json` dependencies and create the component in `packages/ui/lit/` (a new directory).

## 2. Package Structure

### `packages/ui/` directory layout

```
packages/ui/
  components/
    button.ts        # WaButton wrapper
    input.ts          # WaInput wrapper (on-demand)
    icon.ts           # WaIcon wrapper (on-demand)
    ...
  styles/
    webawesome.ts    # Re-exports WA CSS barrel
  index.ts           # Barrel — re-exports types from all components
  package.json       # Exports map: ./<name> → ./components/<name>.ts
  tsconfig.json      # Extends @repo/typescript-config/vite.json
```

### Export convention

Every exported component follows three rules:

1. **Named type export** — The wrapper file exports the WA component type under its standard name: `export type { WaButton }`. Only the type is exported; the side-effect (custom element registration) runs on import.
2. **`package.json` entry** — Each component gets an exports map entry: `"./button": "./components/button.ts"`. This keeps imports clean (`@repo/ui/button`) and enables tree-shaking.
3. **Barrel re-export** — Each type is re-exported from `index.ts`: `export type { WaButton } from './components/button.js'`. The barrel is convenient for tools that import types en masse (e.g., `import type { WaButton, WaInput } from '@repo/ui'`).

### Component onboarding process

Adding a new WA component wrapper follows seven steps:

1. **Identify** — Determine which Web Awesome component is needed (e.g., `<wa-input>`).
2. **Create wrapper** — Create `packages/ui/components/<name>.ts` with the side-effect import and type re-export.
3. **Export map** — Add `"./<name>": "./components/<name>.ts"` to `packages/ui/package.json` exports field.
4. **Barrel** — Add the type re-export to `packages/ui/index.ts`.
5. **App-level config** — Vue: no extra config needed (`isCustomElement` already catches all `wa-*` tags). Angular: add `CUSTOM_ELEMENTS_SCHEMA` to the module or component standalone config. React: import the side-effect module before using the component in JSX.
6. **Spec file** — Add `packages/ui/components/<name>.spec.ts` only if the wrapper contains logic beyond the re-export pattern. Thin pure-type wrappers need no spec.
7. **Verify** — Run `bun run build` (tsc + vite build), `bun run lint`, and confirm the component renders in the app.

## 3. Theming / Design Tokens

Web Awesome exposes all visual properties as CSS custom properties prefixed with `--wa-*`. This makes theming straightforward: override the variables at any CSS cascade level.

Token strategy:

- **Global overrides** — `packages/ui/styles/webawesome.ts` re-exports the WA CSS barrel. Apps that import `@repo/ui/styles` get WA defaults. Overrides go in each app's own stylesheet.
- **Design token files** — `packages/ui/styles/tokens/` can host token CSS files (e.g., `tokens/colors.css`, `tokens/typography.css`). These files declare `--wa-*` variable overrides mapped to design-system intent. This directory is scaffolded but empty until formal design tokens are defined.
- **Per-component overrides** — Vue SFCs can scope token overrides via `scoped` styles: `:deep(wa-button) { --wa-button-border-radius: var(--radius-sm); }`.
- **App-level themes** — Each app can switch themes by applying a CSS class to a root element and using descendant selectors on `--wa-*` variables. For example, `.theme-dark wa-button { --wa-button-background: #333; }`.

WA components that ship their own shadow DOM styles are encapsulated; overrides require CSS custom properties (the `::part()` pseudo-element is also available for specific internal elements WA exposes).

## 4. App Integration Patterns

### Vue 3 (current — `apps/web-vue/`)

**Vite configuration** — `vite.config.ts` must tell the Vue compiler to treat WA tags as custom elements:

```ts
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('wa-'),
    },
  },
}),
```

**Main entry** — Import the WA stylesheet once in `main.ts`:

```ts
import '@repo/ui/styles';
```

**Component usage in templates** — Use `<wa-button>` etc. directly. No Vue wrapper component is needed. Example:

```vue
<template>
  <wa-button variant="primary" size="medium" @click="handleClick">
    {{ label }}
  </wa-button>
</template>

<script setup lang="ts">
function handleClick() { /* ... */ }
</script>
```

**`v-model` on form controls** — Vue's `v-model` has inconsistent support on Web Components because they do not emit native `input` events with the standard `event.target.value` pattern. Web Awesome recommends one of these patterns:

```vue
<!-- ❌ May not work reliably on WC — avoid -->
<wa-input v-model="name" />

<!-- ✅ Recommended: explicit :value + @input -->
<wa-input :value="name" @wa-input="name = $event.target.value" />

<!-- ✅ Alternative: .prop modifier forces property binding -->
<wa-input v-model.prop="name" />
```

The `.prop` modifier is the most concise option but should be tested per component. The `:value + @input` pattern is the safest default.

**TypeScript types** — Import WA types alongside the side-effect:

```ts
import '@repo/ui/button';
import type { WaButton } from '@repo/ui/button';
```

TypeScript then knows the properties and events of `WaButton` when you access the element via `ref`.

### Angular (future — `apps/web-angular/`)

**Schema setup** — Add `CUSTOM_ELEMENTS_SCHEMA` to the module or standalone component configuration. This prevents Angular's template compiler from throwing on unknown `wa-*` tags.

```ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
```

**Event binding** — Angular binds to DOM events with parentheses:

```html
<wa-button (wa-click)="handleClick($event)"></wa-button>
```

**Property binding** — Use square brackets for input properties:

```html
<wa-input [value]="name" (wa-input)="name = $event.target.value"></wa-input>
```

**Import side-effects** — Import WA component wrappers once in `main.ts` or the app module:

```ts
import '@repo/ui/button';
import '@repo/ui/input';
```

### React (future — `apps/web-react/`)

**Import side-effects** — React does not auto-register custom elements. Import each WA component's registration module before using it:

```tsx
import '@repo/ui/button';
```

**JSX usage** — Web Components work in React 18+ via `ref` access to the underlying DOM element. React 19 has improved custom element support (properties pass as props automatically).

```tsx
function MyComponent() {
  const inputRef = useRef<WaInput>(null);

  return <wa-input ref={inputRef} value={name} onWaInput={(e) => setName(e.target.value)} />;
}
```

**React wrappers available** — Web Awesome ships React wrapper components at `dist/react/*`. These provide a more ergonomic React API (camelCase props, React event system). If React ergonomics become a priority, define React wrappers in `packages/ui/react/` that wrap the WA React re-exports. This is deferred until the React app is built.

**TypeScript** — React's JSX namespace needs augmentation for WA elements. Without it, `<wa-button>` is typed as `unknown` props. Add JSX type declarations either in a central `packages/ui/react/jsx-types.ts` or in the React app's own type declarations.

## 5. Testing Strategy

### `packages/ui/` tests

Thin re-export wrappers contain no logic — they are a side-effect import and a type re-export. They require no unit tests. A spec file is added co-located at `packages/ui/components/<name>.spec.ts` **only when** the wrapper contains additional logic (prop transformation, default values, event normalization).

When custom Lit components are added to `packages/ui/lit/`, each gets a co-located spec file testing:
- Shadow DOM rendering (via `@lit/react` or `@web/test-runner`)
- Property/attribute reflection
- Event dispatch
- Slotted content

### App-level integration tests

Each app tests that WA components render correctly inside its framework templates. Tests live co-located with the pages or components that use WA elements.

**Vue pattern** (Vitest + jsdom):

```ts
import { mount } from '@vue/test-utils';
import ButtonDemo from './ButtonDemo.vue';

describe('ButtonDemo', () => {
  it('renders wa-button element', () => {
    const wrapper = mount(ButtonDemo);
    expect(wrapper.find('wa-button').exists()).toBe(true);
  });

  it('emits click event', async () => {
    const wrapper = mount(ButtonDemo);
    await wrapper.find('wa-button').trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

**Important caveat**: jsdom does not fully implement custom element lifecycle. Tests verify presence and basic interaction — they do not test shadow DOM rendering or WA internal behavior. Browser-level E2E tests (Playwright) cover visual rendering and interaction. Playwright tests are planned for Phase 3 (E2E infrastructure).

### Current test coverage

| File | Location | Status | Notes |
|------|----------|--------|-------|
| WaButton.spec.ts | `__tests__/` | Removed | Was a unit test for an early wrapper pattern that no longer exists |
| ProductsPage.spec.ts | `apps/web-vue/src/pages/` | Exists | Tests product page rendering |

### Coverage target

80%+ statement coverage for:
- `apps/web-vue/src/pages/` (integration tests)
- `apps/web-vue/src/composables/` (unit tests)
- Custom Lit components in `packages/ui/components/` (unit tests, future)

Coverage is not measured for thin re-export wrappers (no logic to cover) or for framework-agnostic type declarations.

## 6. Tasks

- [x] Research AgnosticUI → rejected (alpha, Lit dep, no Angular)
- [x] Research multi-framework unstyled alternatives → no ideal product exists
- [x] Evaluate 6+ WC frameworks (Lit, Stencil, Atomico, Hybrids, Haunted, Elemento, Uhtml) → hybridJS selected for custom wrappers
- [x] Web Awesome selected as best pragmatic option
- [x] Create native CE fe-button (temporal commit `8216e3f`)
- [x] Remove old boilerplate (counter.ts, header.ts, utils/counter.ts)
- [x] Refactor pages: move ProductsPage to `apps/web-vue/src/pages/`
- [x] Add Vue Router with hash history
- [x] Stale ref cleanup (components.d.ts old ButtonDemo entry)
- [x] Install hybridJS in `packages/ui/` (`bun add hybrids@^9`)
- [x] Rewrite `packages/ui/components/fe-button.ts` using hybridJS `define()`
- [x] Update fe-button spec to test hybridJS component
- [ ] Set up DS tokens scaffold (`packages/ui/styles/tokens/`) with `--wa-*` CSS var overrides
- [ ] Add WaInput wrapper (`packages/ui/components/input.ts`)
- [ ] Add WaIcon wrapper (`packages/ui/components/icon.ts`)
- [ ] Create Vue integration doc (`docs/integration/vue.md`)
- [ ] Test Web Awesome integration in remaining framework apps (Angular, React — Phase 3)

## 7. Decision Log

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | WC library for `packages/ui/` | None (thin re-exports) | WA ships native custom elements. Adding Lit/Stencil for wrappers is premature complexity. |
| 2 | Framework-specific wrappers in apps (FeButton.vue) | Do not create | Defeats the single-source-of-truth purpose of `packages/ui/`. Every prop/event mapping would be duplicated across Vue/Angular/React. |
| 3 | `v-model` on WA form controls in Vue | Use `:value + @input` pattern | Vue's WC `v-model` support is inconsistent across components. Explicit binding is reliable and framework-version independent. |
| 4 | Future custom components | Build with Lit | WA uses Lit internally. Google-backed, ~5 KB, proven ecosystem. Avoids introducing a second WC library. |
| 5 | Component registration mechanism | Side-effect import in wrapper file | Per-component imports are tree-shakable, avoid a global bundle, and make dependencies explicit per file. |
| 6 | Token directory location | `packages/ui/styles/tokens/` | Keeps tokens co-located with the styles barrel import. Separated from component wrappers (components/ is for WA mirrors, not CSS). |
| 7 | Testing approach for thin wrappers | No unit tests | Wrappers are pure type re-exports with no logic. Integration tests in apps cover rendering. |
| 8 | Lit addition trigger | Superseded by hybridJS | Lit was considered for custom WC logic. Replaced by hybridJS (v9.1.22, 0 deps, MIT) — plain object + function model better fits project philosophy. |
| 9 | Hybrids library for packages/ui | Selected | hybridJS v9.1.22 — 0 deps, 3.2k ⭐, v9 stable, plain objects + pure functions, auto attr reflection, framework-agnostic WC output. Replaces native CE pattern for custom wrappers. |

## 8. Research References

- `docs/decisions/docs-solution.md` — Docs solution ADR
- `https://github.com/shoelace-style/webawesome` — Web Awesome GitHub repository (v3.7.0)
- `https://lit.dev/` — Lit library documentation (future evolution path)
