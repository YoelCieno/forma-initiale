# Phase 2 — Web Awesome UI Layer

**Status:** 🔧 IN PROGRESS
**Last updated:** 2026-05-27

## Goal

Integrate Web Awesome (web component library, works with Vue 3 + Angular + React) as the base UI layer for the forma-initiale monorepo. Components live as thin re-export wrappers in `packages/ui/` so all framework-specific apps import from `@repo/ui/*` rather than directly from Web Awesome. Apps MUST only use `fe-*` elements (e.g., `<fe-button>`) in templates, never `<wa-*>` directly. The `fe-*` wrappers are the single entry point for all framework apps. Theming is managed via CSS custom property overrides (`--wa-*` variables) with design token files in `packages/ui/styles/`.

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

| Aspect | Native CE (original) | hybridJS (current) |
|--------|--------------------|----------|
| Lines of code | ~97 | ~30 |
| Class | `extends HTMLElement` | Plain object + functions |
| Lifecycle | `attributeChangedCallback`, `observedAttributes`, `connectedCallback` | Automatic via `define()` |
| Property/attr reflection | Manual `hasAttribute`, `getAttribute` | Built-in — dash-cased attrs auto-map |
| Template | `innerHTML` string | `html\`...\`` tagged literal |
| Change detection | Manual | Built-in cache + equality check |

### Apps use fe-* wrappers, not wa-* directly

An earlier approach created `apps/web-vue/src/components/FeButton.vue` — a Vue SFC that wraps `<wa-button>`. This was discarded for two reasons:
1. It defeats `packages/ui/` as single source of truth — would need duplicate wrappers per app framework
2. The pattern of using `wa-*` directly in app templates is also wrong

**Correct approach:** Every component lives once in `packages/ui/` as an `fe-*` custom element (e.g., `<fe-button>`). Apps import the side-effect module (`@repo/ui/fe-button`) and use the `fe-*` tag in templates. The `fe-*` wrapper internally composes `<wa-button>` and any other needed WA elements. Apps never import or reference WA directly — they only see `fe-*` elements.

This gives us:
- **One definition** — the wrapper logic lives once in `packages/ui/`
- **Framework-agnostic** — `fe-*` are native custom elements, usable in Vue 3, Angular, React without adapters
- **Abstraction layer** — WA can be swapped out without touching app code
- **Clean DX** — apps use a consistent `fe-*` naming convention

### hybridJS as the WC library for custom wrappers

hybridJS (`hybrids` v9.1.22, 0 deps, MIT) is the established WC library for custom component logic in `packages/ui/`. The `fe-button` wrapper already uses `define()` from hybridJS (see §2). Future compound components follow the same pattern — no additional library needed.

When to use hybridJS vs thin re-export:

| Scenario | Action |
|----------|--------|
| Re-export a single WA component with zero logic | Thin re-export (side-effect import + type re-export) — no hybridJS needed |
| Compose 2+ WA components into a compound UI | Build a hybridJS component with `define()` + `html` tagged literal (like fe-button) |
| Controlled form component with custom validation | Build a hybridJS component wrapping the WA form control |
| Brand-new component not in WA catalog | Build a hybridJS component from scratch |
| Any wrapper that only adds event/prop typing | Thin re-export — no hybridJS needed |

All hybridJS wrappers live in `packages/ui/components/` alongside thin re-exports. No separate `lit/` directory needed.

## 2. Package Structure

### `packages/ui/` directory layout

```
packages/ui/
  components/
    fe-button.ts     # hybridJS wrapper composing wa-button + wa-icon
    fe-input.ts        # hybridJS wrapper composing wa-input
    fe-icon.ts         # hybridJS wrapper composing wa-icon
    ...
  styles/
    webawesome.ts    # Re-exports WA CSS barrel
  index.ts           # Barrel — re-exports types + FeButton constant
  package.json       # Exports map: ./<name> → ./components/<name>.ts
  tsconfig.json      # Extends @repo/typescript-config/vite.json
```

### Export convention

Every exported component follows three rules:

1. **Named type export + component constant** — The wrapper file exports the element interface and the `define()` result where applicable: `export type { FeButtonElement }` and `export const FeButton`. For thin re-exports, only the WA component type is re-exported. The side-effect (custom element registration) runs on import.
2. **`package.json` entry** — Each component gets an exports map entry: `"./fe-button": "./components/fe-button.ts"`. This keeps imports clean (`@repo/ui/fe-button`) and enables tree-shaking.
3. **Barrel re-export** — Each type and component constant is re-exported from `index.ts`. The barrel is convenient for tools that import types en masse (e.g., `import type { FeButtonElement } from '@repo/ui'`).

### Component onboarding process

Adding a new WA component wrapper follows seven steps:

1. **Identify** — Determine which Web Awesome component is needed (e.g., `<wa-input>`).
2. **Create wrapper** — Create `packages/ui/components/fe-<name>.ts`. For thin re-exports: side-effect import + type re-export. For hybridJS wrappers: `define()` from hybridJS composing the `<wa-*>` element.
3. **Export map** — Add `"./<name>": "./components/<name>.ts"` to `packages/ui/package.json` exports field.
4. **Barrel** — Add the type + component constant re-export to `packages/ui/index.ts`.
5. **App-level config** — Vue: add `fe-` prefix to `isCustomElement` in `vite.config.ts` (already done for `fe-*`). Angular: add `CUSTOM_ELEMENTS_SCHEMA`. React: import the side-effect module before using the component in JSX.
6. **Spec file** — Add `packages/ui/components/<name>.spec.ts` for hybridJS wrappers (tests shadow DOM rendering, property forwarding, events). Thin pure-type wrappers need no spec.
7. **Verify** — Run `bun run build` (tsc + vite build), `bun run lint`, and confirm the component renders in the app.

### `sideEffects` field

`packages/ui/package.json` currently omits the `sideEffects` field — bundlers treat this as `sideEffects: true`, meaning no file is tree-shaken. This is correct because every component file registers a custom element as a side effect (`define({ tag: 'fe-*', ... })`).

Setting `sideEffects: false` would cause bundlers to drop `import '@repo/ui/fe-button'` when its exports are unused by the consumer — breaking all custom element registrations at runtime.

If later the package adds pure TS modules with zero side effects (e.g., `utils/`, `constants/`, `types/`), switch to a fine-grained array:

```json
"sideEffects": [
  "./components/fe-*.ts",
  "./styles/*.ts"
]
```

This protects CE-registering files from tree-shaking while letting pure modules be optimized. Not needed now — premature optimization.

## 3. Theming / Design Tokens

Web Awesome exposes all visual properties as CSS custom properties prefixed with `--wa-*`. This makes theming straightforward: override the variables at any CSS cascade level.

Token strategy:

- **Global overrides** — `packages/ui/styles/webawesome.ts` re-exports the WA CSS barrel. Apps that import `@repo/ui/styles` get WA defaults. Overrides go in each app's own stylesheet.
- **Design token files** — `packages/ui/styles/tokens/` will host token CSS files (e.g., `tokens/colors.css`, `tokens/typography.css`). These files declare `--wa-*` variable overrides mapped to design-system intent. This directory is not yet created — it's a pending task (see §6).
- **Per-component overrides** — Vue SFCs can scope token overrides via `scoped` styles: `:deep(fe-button) { --wa-button-border-radius: var(--radius-sm); }`.
- **App-level themes** — Each app can switch themes by applying a CSS class to a root element and using descendant selectors on `--wa-*` variables. For example, `.theme-dark fe-button { --wa-button-background: #333; }`.

WA components that ship their own shadow DOM styles are encapsulated; overrides require CSS custom properties (the `::part()` pseudo-element is also available for specific internal elements WA exposes).

## 4. App Integration Patterns

### Vue 3 (current — `apps/web-vue/`)

**Vite configuration** — `vite.config.ts` must tell the Vue compiler to treat WA tags as custom elements:

```ts
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('fe-'),
    },
  },
}),
```

**Main entry** — Import the WA stylesheet once in `main.ts`:

```ts
import '@repo/ui/styles';
```

**Component usage in templates** — Use `<fe-button>` etc. in templates. Import the side-effect module to register the custom element:

```vue
<script setup lang="ts">
import "@repo/ui/fe-button";
import type { FeButtonElement } from "@repo/ui/fe-button";

defineProps<{ label: string }>();
const emit = defineEmits<{ clicked: [] }>();
</script>

<template>
  <fe-button variant="primary" size="medium" @click="emit('clicked')">
    {{ label }}
  </fe-button>
</template>
```

**`v-model` on form controls** — Vue's `v-model` has inconsistent support on Web Components. The `fe-*` hybridJS wrappers normalize events so apps can use the same pattern:

```vue
<!-- ✅ Recommended: explicit :value + @input -->
<fe-input :value="name" @input="name = $event.detail.value" />

<!-- Alternative: .prop modifier -->
<fe-input v-model.prop="name" />
```

**hybridJS wrappers (fe-button)** — Use `<fe-button>` in Vue templates just like native WA elements. The custom element is registered globally by importing `@repo/ui/fe-button`:

```vue
<script setup lang="ts">
import "@repo/ui/fe-button";

function onClick() { alert('clicked'); }
</script>

<template>
  <fe-button variant="brand" icon="check" @click="onClick">
    Click Me
  </fe-button>
</template>
```

The `fe-` prefix is already registered in `vite.config.ts` `isCustomElement`.

### Angular (future — `apps/web-angular/`)

**Schema setup** — Add `CUSTOM_ELEMENTS_SCHEMA` to the module or standalone component configuration. This prevents Angular's template compiler from throwing on unknown `fe-*` tags.

```ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
```

**Event binding** — Angular binds to DOM events with parentheses:

```html
<fe-button (click)="handleClick($event)"></fe-button>
```

**Property binding** — Use square brackets for input properties:

```html
<fe-input [value]="name" (input)="name = $event.detail.value"></fe-input>
```

**Import side-effects** — Import `fe-*` component wrappers once in `main.ts` or the app module:

```ts
import '@repo/ui/fe-button';
import '@repo/ui/fe-input';
```

### React (future — `apps/web-react/`)

**Import side-effects** — React does not auto-register custom elements. Import each `fe-*` component's registration module before using it:

```tsx
import '@repo/ui/fe-button';
```

**JSX usage** — `fe-*` wrappers ship as native custom elements. React 19 works with them directly — properties pass as props automatically.

```tsx
function MyComponent() {
  const inputRef = useRef<FeInputElement>(null);

  return <fe-input ref={inputRef} value={name} onInput={(e) => setName(e.target.value)} />;
}
```

**TypeScript** — `fe-*` element types are available from `@repo/ui`. React's JSX namespace needs augmentation for custom elements. Without it, `<fe-button>` is typed as `unknown` props. Add JSX type declarations either in a central `packages/ui/react/jsx-types.ts` or in the React app's own type declarations.

## 5. Testing Strategy

### `packages/ui/` tests

Thin re-export wrappers contain no logic — they are a side-effect import and a type re-export. They require no unit tests. A spec file is added co-located at `packages/ui/components/<name>.spec.ts` **only when** the wrapper contains additional logic (prop transformation, default values, event normalization).

Custom hybridJS wrappers (like `fe-button`) get a co-located spec file testing:
- Shadow DOM rendering (via jsdom + hybridJS render cycle)
- Property forwarding to inner WA elements
- Conditional rendering (e.g., icon shown/hidden based on property)
- Event dispatch (bubbled events from inner WA elements)
- Slotted content

### App-level integration tests

Each app tests that WA components render correctly inside its framework templates. Tests live co-located with the pages or components that use WA elements.

**Vue pattern** (Vitest + jsdom):

```ts
import { mount } from '@vue/test-utils';
import ButtonDemo from './ButtonDemo.vue';

describe('ButtonDemo', () => {
  it('renders fe-button element', () => {
    const wrapper = mount(ButtonDemo);
    expect(wrapper.find('fe-button').exists()).toBe(true);
  });

  it('emits click event', async () => {
    const wrapper = mount(ButtonDemo);
    await wrapper.find('fe-button').trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

**Important caveat**: jsdom does not fully implement custom element lifecycle. Tests verify presence and basic interaction — they do not test shadow DOM rendering or WA internal behavior. Browser-level E2E tests (Playwright) cover visual rendering and interaction. Playwright tests are planned for Phase 3 (E2E infrastructure).

### Current test coverage

| File | Location | Status | Notes |
|------|----------|--------|-------|
| fe-button.spec.ts | `packages/ui/components/` | Exists | Tests hybridJS fe-button wrapper — shadow DOM, property forwarding, events |
| ProductsPage.spec.ts | `apps/web-vue/src/pages/` | Exists | Tests product page rendering |
| ButtonDemoPage.spec.ts | `apps/web-vue/src/pages/` | Exists | Tests fe-button rendering in ButtonDemoPage |

### Coverage target

80%+ statement coverage for:
- `apps/web-vue/src/pages/` (integration tests)
- `apps/web-vue/src/composables/` (unit tests)
- Custom hybridJS wrappers in `packages/ui/components/` (unit tests)

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
- [x] Adopt MSW as API mocking strategy — add MSW dep to web-vue + infra, create handler structure, verify dev + test interception

## 7. Decision Log

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | WC library for `packages/ui/` | hybridJS (v9.1.22) | Plain objects + pure functions, 0 deps, 3.2k ⭐, auto attr reflection, framework-agnostic. Used for fe-button wrapper. Replaces native CE pattern. |
| 2 | Framework-specific wrappers in apps (FeButton.vue) | Do not create | Defeats the single-source-of-truth purpose of `packages/ui/`. Every prop/event mapping would be duplicated across Vue/Angular/React. |
| 3 | `v-model` on WA form controls in Vue | Use `:value + @input` pattern | Vue's WC `v-model` support is inconsistent across components. Explicit binding is reliable and framework-version independent. |
| 4 | Future custom components | Build with hybridJS | hybridJS (0 deps, MIT) already in use for fe-button. Plain object/function model fits project philosophy better than Lit class-based model. No second library needed. |
| 5 | Component registration mechanism | Side-effect import in wrapper file | Per-component imports are tree-shakable, avoid a global bundle, and make dependencies explicit per file. |
| 6 | Token directory location | `packages/ui/styles/tokens/` | Keeps tokens co-located with the styles barrel import. Separated from component wrappers (components/ is for WA mirrors, not CSS). |
| 7 | Testing approach for thin wrappers | No unit tests | Wrappers are pure type re-exports with no logic. Integration tests in apps cover rendering. |
| 8 | Lit addition trigger (historical) | Superseded by hybridJS | Lit was considered for custom WC logic. Replaced by hybridJS (v9.1.22, 0 deps, MIT) — plain object + function model better fits project philosophy. Decision 4 updated accordingly. |
| 9 | Hybrids library for packages/ui | Selected | hybridJS v9.1.22 — 0 deps, 3.2k ⭐, v9 stable, plain objects + pure functions, auto attr reflection, framework-agnostic WC output. Replaces native CE pattern for custom wrappers. |
| 10 | API mocking strategy | MSW | Single tool for dev + test, realistic `fetch` interception, type-safe handlers, no external dep, works offline |
| 11 | Mock handler location | packages/infra/mocks/ | Co-located with infra adapters, keeps domain clean |
| 12 | Data generation | Factories (no faker) + fixtures for edge cases | Sequential counter + sensible defaults. Fresh objects per call, test isolation, hybrid approach |
| 13 | Type sharing | Domain types imported directly | Handlers import Product from @repo/domain. Handler response shape = what real API returns (KISSME-SINE) |

## 8. Research References

- `docs/decisions/docs-solution.md` — Docs solution ADR
- `https://github.com/shoelace-style/webawesome` — Web Awesome GitHub repository (v3.7.0)
- `https://github.com/hybridsjs/hybrids` — hybridJS GitHub repository (v9.1.22)
