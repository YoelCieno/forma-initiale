# Web Awesome Integration

How Web Awesome (WA) integrates into forma-initiale: style split, theme system, `fe-*` wrapper pattern, and app consumption.

---

## 1. The `fe-*` Wrapper Pattern (CRITICAL)

Apps **never** use `wa-*` elements directly in templates. Every WA component is wrapped by an `fe-*` hybridJS component in `packages/ui/`.

### Why

- **Framework-agnostic** — `fe-*` components are vanilla Web Components via hybridJS. Works in Vue, React, Angular, or no framework at all.
- **WA swappable** — Change the internal `wa-*` element once in `packages/ui/`, every app picks it up. No per-app migration.
- **Single definition point** — Props, defaults, and behavior defined once in `packages/ui/components/fe-*.ts`.
- **Shadow DOM** — Each wrapper uses `shadow: true` for style encapsulation.

### Rule

Apps import `fe-*` components for side-effect (registers custom elements) and use `fe-*` tags in templates. Never reference `wa-*` in app code.

```typescript
// apps/web-vue/src/pages/ProductsPage.vue
import "@repo/ui/fe-card"
import "@repo/ui/fe-icon"
import "@repo/ui/fe-rating"
```

```html
<fe-card>
  <fe-icon slot="media" name="logo" family="classic"></fe-icon>
  <fe-rating :value="product.rate" readonly></fe-rating>
</fe-card>
```

### Pattern: hybridJS Descriptors

Each `fe-*` component follows the same structure:

```typescript
// packages/ui/components/fe-button.ts
import '@awesome.me/webawesome/dist/components/button/button.js'

import { define, html } from 'hybrids'

export interface FeButtonElement extends HTMLElement {
  variant: string
  size: string
  appearance: string
  icon: string
  disabled: boolean
  loading: boolean
  pill: boolean
}

export const FeButton = define<FeButtonElement>({
  tag: 'fe-button',
  variant: 'neutral',
  size: 'm',
  appearance: 'filled',
  icon: '',
  disabled: false,
  loading: false,
  pill: false,
  render: {
    value: (host) => html`
      <wa-button
        variant="${host.variant}"
        size="${host.size}"
        appearance="${host.appearance}"
        disabled="${host.disabled}"
        loading="${host.loading}"
        pill="${host.pill}"
      >
        ${host.icon && html`<fe-icon name="${host.icon}"></fe-icon>`}
        <slot></slot>
      </wa-button>
    `,
    shadow: true,
  },
})
```

Key mechanics:

| Element | Description |
|---|---|
| `tag: 'fe-*'` | Registers the custom element name (must contain `-`) |
| Property descriptors | Booleans default `false`, strings with explicit defaults. hybridJS auto-creates getter/setter + attribute reflection |
| `render: { value: (host) => …, shadow: true }` | Render function receives `host` (the element instance). `shadow: true` enables shadow DOM |
| `${host.property}` | HybridJS binds property values to attributes. WA internals parse `"true"`/`"false"` strings |
| `<slot></slot>` | Passes light DOM children through to the internal WA element |
| `<slot name="...">` | Named slots for structured content (header, footer, media, actions) |
| `FeButtonElement` interface | Exported for type-safe property access in TypeScript |

Note: hybridJS does not use Lit's `?` boolean prefix. All attribute bindings are `${host.property}`. WA components handle boolean string coercion internally.

### Pattern: Conditional Slots

Components like `fe-card` detect slot content at render time and conditionally render slot elements:

```typescript
// packages/ui/components/fe-card.ts
render: {
  value: (host) => {
    const hasHeader = !!host.querySelector(':scope > [slot="header"]')
    const hasFooter = !!host.querySelector(':scope > [slot="footer"]')
    const hasMedia = !!host.querySelector(':scope > [slot="media"]')

    return html`
      <wa-card appearance="${host.appearance}" orientation="${host.orientation}">
        ${hasMedia ? html`<slot slot="media" name="media"></slot>` : undefined}
        ${hasHeader ? html`<slot slot="header" name="header"></slot>` : undefined}
        <slot></slot>
        ${hasFooter ? html`<slot slot="footer" name="footer"></slot>` : undefined}
        <slot slot="actions" name="actions"></slot>
      </wa-card>
    `
  },
  shadow: true,
}
```

When a slot with a matching `name` attribute exists in light DOM, hybridJS slotted elements are rendered.

---

## 2. Component Catalog

| fe-* component | WA element | File | Key props |
|---|---|---|---|
| `fe-button` | `wa-button` | `components/fe-button.ts` | `variant`, `size`, `appearance`, `icon`, `disabled`, `loading`, `pill` |
| `fe-card` | `wa-card` | `components/fe-card.ts` | `appearance`, `orientation`, `disabled`; detects `header`/`footer`/`media` slots |
| `fe-icon` | `wa-icon` | `components/fe-icon.ts` | `name`, `library`, `family`, `variant`, `label`, `autoWidth`, `flip`, `rotate`, `animation`, `src`, `swapOpacity` |
| `fe-rating` | `wa-rating` | `components/fe-rating.ts` | `value`, `max`, `precision`, `size`, `label`, `disabled`, `readonly`, `required`, `name` |
| `fe-async-content` | (custom — uses `wa-spinner`) | `components/fe-async-content.ts` | `loading: boolean`, `error: string \| undefined` |

`fe-async-content` has no direct WA counterpart. It is a custom wrapper that renders:

- `loading=true` → loading slot (default: WA spinner + "Loading..." text)
- `error` set → error slot (default: error message text)
- Neither → default slot (content pass-through)

---

## 3. Styles Architecture — Three Layers

This is the most error-prone part. Missing one layer = broken visuals.

### Layer 1: WA Base (`@repo/ui/styles`)

```typescript
// packages/ui/styles/webawesome.ts
import '@awesome.me/webawesome/dist/styles/native.css'
import '@awesome.me/webawesome/dist/styles/utilities.css'
```

- `native.css` — CSS reset, normalize, box-sizing
- `utilities.css` — layout helpers (visually-hidden, spacing, etc.)
- **No component styles** — WA elements appear **unstyled** (wrong layout, invisible backgrounds, no colors) if you stop here

### Layer 2: WA Theme (`@repo/ui/styles/themes/<name>`)

```typescript
// packages/ui/styles/themes/default.ts
import '@awesome.me/webawesome/dist/styles/themes/default.css'
```

Three theme choices (each a separate CSS import):

| Theme | File | Target app |
|---|---|---|
| `default` | `styles/themes/default.ts` | `web-vue` (current) |
| `awesome` | `styles/themes/awesome.ts` | `web-angular` (future) |
| `shoelace` | `styles/themes/shoelace.ts` | `web-react` (future) |

Each theme file is a thin barrel re-exporting a WA CSS file. Without this import, WA components have no visual styling.

### Layer 3: DS Token Overrides (`apps/*/src/styles/tokens.css`)

CSS custom property overrides that adjust the WA theme to the app's design system:

```css
/* apps/web-vue/src/styles/tokens.css */
:where(:root) {
  --wa-color-brand-fill-normal: var(--brand-fill-normal);
  --wa-color-brand-border-quiet: var(--brand-border-quiet);
  --wa-border-radius-s: 0.15rem;
  --wa-border-radius-m: 0.3rem;
  --wa-border-radius-l: 0.45rem;
}
```

- Never hardcode colors, spacing, or typography — always use `--wa-*` CSS custom properties
- Tokens reference app-level semantic variables via `var(--brand-*)`
- File imported via barrel: `apps/web-vue/src/styles/index.ts` → `import './tokens.css'` + `import './base.css'`

### Import Order (in app main.ts)

Order matters — each layer builds on the previous:

```typescript
// apps/web-vue/src/main.ts
import '@repo/ui/styles'                // Layer 1: native + utilities
import '@repo/ui/styles/themes/default'  // Layer 2: WA component styling
import './styles'                         // Layer 3: tokens + base CSS
```

Layer 3 (`./styles`) is a barrel that imports `tokens.css` then `base.css`.

### Theme Class on `<html>`

WA themes activate via a class name on the `<html>` element. The pattern is `wa-theme-<name>`:

```html
<html class="wa-theme-default" lang="en">
```

**Current status:** `apps/web-vue/index.html` does not have this class yet. It must be added when WA is fully wired. Without it, WA components may not pick up theme-level CSS variable defaults.

---

## 4. Package Exports

`packages/ui/package.json` maps import paths to source files:

```json
{
  "exports": {
    "./fe-button": "./components/fe-button.ts",
    "./fe-async-content": "./components/fe-async-content.ts",
    "./fe-card": "./components/fe-card.ts",
    "./fe-icon": "./components/fe-icon.ts",
    "./fe-rating": "./components/fe-rating.ts",
    "./styles": "./styles/webawesome.ts",
    "./styles/themes/default": "./styles/themes/default.ts",
    "./styles/themes/awesome": "./styles/themes/awesome.ts",
    "./styles/themes/shoelace": "./styles/themes/shoelace.ts"
  }
}
```

| Import path | Source file | Provides |
|---|---|---|
| `@repo/ui/fe-button` | `./components/fe-button.ts` | `fe-button` CE + `FeButtonElement` type |
| `@repo/ui/fe-async-content` | `./components/fe-async-content.ts` | `fe-async-content` CE + `FeAsyncContentElement` type |
| `@repo/ui/fe-card` | `./components/fe-card.ts` | `fe-card` CE + `FeCardElement` type |
| `@repo/ui/fe-icon` | `./components/fe-icon.ts` | `fe-icon` CE + `FeIconElement` type |
| `@repo/ui/fe-rating` | `./components/fe-rating.ts` | `fe-rating` CE + `FeRatingElement` type |
| `@repo/ui/styles` | `./styles/webawesome.ts` | WA base (native.css + utilities.css) |
| `@repo/ui/styles/themes/default` | `./styles/themes/default.ts` | WA default theme |
| `@repo/ui/styles/themes/awesome` | `./styles/themes/awesome.ts` | WA awesome theme |
| `@repo/ui/styles/themes/shoelace` | `./styles/themes/shoelace.ts` | WA shoelace theme |

Dependencies: `@awesome.me/webawesome@3.7.0` and `hybrids@^9`.

---

## 5. Testing `fe-*` Components

### Gotchas

From `AGENTS.md` (verified against actual test behavior):

1. **WA boolean props don't reflect to attrs** — `disabled`, `loading`, `pill`. Test via JS property, not `hasAttribute`.
2. **hybridJS render timing** — Renders on `deferred.then()` microtask. Tests need `await Promise.resolve()` (×2 for Lit attr reflection).
3. **Set properties, not attributes** — `el.disabled = true` not `el.setAttribute('disabled', '')`.

### Test Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { FeButton, FeButtonElement } from './fe-button'

describe('fe-button', () => {
  it('sets disabled via property', async () => {
    const el = document.createElement('fe-button') as FeButtonElement
    el.disabled = true
    el.loading = false
    el.pill = false
    document.body.appendChild(el)

    // hybridJS deferred render + Lit attr reflection = 2 microticks
    await Promise.resolve()
    await Promise.resolve()

    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton).toBeTruthy()
    // Test via JS property, NOT hasAttribute
    expect(waButton?.disabled).toBe(true)

    el.remove()
  })

  it('renders with default props', async () => {
    const el = document.createElement('fe-button') as FeButtonElement
    document.body.appendChild(el)
    await Promise.resolve()
    await Promise.resolve()

    const waButton = el.shadowRoot!.querySelector('wa-button')!
    expect(waButton.variant).toBe('neutral')
    expect(waButton.size).toBe('m')

    el.remove()
  })
})
```

---

## 6. CSS Parts and Custom Properties

WA exposes two mechanisms for deep styling from outside shadow DOM.

### CSS Parts

Target internal elements via `::part()`:

```css
/* Style the rating stars inside fe-rating */
fe-rating::part(star) {
  color: gold;
}

/* Style the icon inside fe-button */
fe-button::part(icon) {
  font-size: 1.5em;
}
```

The exposed parts are documented per component in the WA Agent Skill. `fe-*` wrappers can also define additional parts in their `.css` tagged template.

### CSS Custom Properties

Override WA design tokens globally or per-component:

```css
/* Global override in tokens.css */
:root {
  --wa-color-primary-50: #e0e7ff;
  --wa-color-primary-600: #4f46e5;
  --wa-border-radius-m: 0.3rem;
  --wa-spacing-m: 1rem;
}

/* Per-component override */
fe-card {
  --wa-card-border-color: var(--wa-color-brand-border-loud);
}
```

Full list of tokens at `.opencode/references/webawesome/references/tokens/`.

### In `fe-*` Wrappers

The `.css` tagged template appended to `html` can expose parts and set default CSS vars:

```typescript
render: (host) => html`
  <wa-button part="button" ...>
    <slot></slot>
  </wa-button>
`.css`
  :host {
    --wa-button-font-size: var(--fe-button-font-size, 1rem);
  }
`
```

---

## 7. Reference

| Doc | Location |
|---|---|
| WA Agent Skill — overview, quick start | `.opencode/references/webawesome/SKILL.md` |
| Per-component API docs (props, events, CSS parts, slots) | `.opencode/references/webawesome/references/components/` |
| Design tokens (color, typography, spacing, shadows) | `.opencode/references/webawesome/references/tokens/` |
| Theme + palette usage | `.opencode/references/webawesome/references/themes.md` |
| Form controls guide | `.opencode/references/webawesome/references/form-controls.md` |
| Fix `fe-*` in layer stack | `docs/integrations/layer-wiring.md` |
| Architecture principles (POLA for slot names, etc.) | `docs/ADRS/design-patterns.md` |
| Monorepo commands, gotchas, config | `AGENTS.md` |

---

## Quick Start Checklist

When adding a new app that consumes WA:

1. **Install** `@repo/ui` dependency in `package.json` (workspace reference)
2. **Add theme class** to `<html>`: `class="wa-theme-<name>"`
3. **Import styles** in `main.ts` (all 3 layers, in order):

   ```typescript
   import '@repo/ui/styles'
   import '@repo/ui/styles/themes/default'
   import './styles/tokens.css'
   ```

4. **Import `fe-*` components** per page or globally:

   ```typescript
   import '@repo/ui/fe-button'
   import '@repo/ui/fe-card'
   ```

5. **Use `<fe-*>` tags** in templates — never `<wa-*>` directly
6. **Override tokens** in app's `tokens.css` via `--wa-*` CSS custom properties
