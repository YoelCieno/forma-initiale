# Form-Associated Custom Elements (FACE) & the Test-Environment Shim

Web Awesome form controls (`wa-input`, `wa-select`, `wa-rating`, etc.) are **form-associated custom elements (FACE)**. They rely on `ElementInternals` (`attachInternals()` → `setFormValue()`, `setValidity()`, `validity`, `states`, …) for constraint validation and `:state()` styling. Real browsers and the test runner (jsdom) differ in how much of that surface they implement — hence the shim below.

---

## 1. Real-world incomplete-FACE browsers (authoritative cutoffs)

| Browser                        | Incomplete surface                                                                                    | Until             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------- |
| Safari / iOS Safari (WebKit)   | `attachInternals()` present but **no FACE methods** (`setFormValue`, `validity`, `setValidity`, `form`) | 15.4 – 16.3       |
| Safari 16.4 – 17.3             | FACE methods present, **`states` (CustomStateSet) missing**                                          | → 17.4            |
| Firefox                        | `attachInternals()` present but **no `setFormValue` / `validity`**                                   | 93 – 97           |
| Firefox 98 – 125               | FACE present, **`states` missing**                                                                    | → 126             |
| Chrome / Edge (Chromium)       | reference impl — **complete from 77+** (`states` since 90)                                            | n/a               |
| jsdom (this repo's test env)   | partial stub: **no `setFormValue` / `setValidity` / `checkValidity` / `states`**                       | —                 |

**Net:** Safari < 17.4, Firefox < 126, old Safari 15.4 – 16.3, and jsdom are incomplete. Modern Chrome/Edge are complete.

So if `internals.validity.valid` or `internals.states` is touched on those targets, it throws. That is exactly why `ensureInternalsComplete` exists.

---

## 2. The shim (`ensureInternalsComplete`)

Source: `apps/white-label-angular/src/test-setup.ts` — runs once at test-setup time.

```typescript
const ensureInternalsComplete = (internals: ElementInternals): void => {
  ensureMethod(internals, 'setValidity', () => {})
  ensureMethod(internals, 'setFormValue', () => {})
  ensureMethod(internals, 'checkValidity', () => true)
  ensureMethod(internals, 'reportValidity', () => true)
  ensureValidity(internals)        // guarantees validity.valid === true
  ensureStates(internals)          // guarantees internals.states is *something*
  ensureValidationMessage(internals)
  ensureWillValidate(internals)
  ensureShadowRoot(internals)
}
```

It is reached two ways:

- **Prototype patch** — `patchElementInternalsPrototype()` adds the missing methods to `ElementInternals.prototype` once, so every future instance inherits them.
- **Instance patch** — `patchAttachInternals()` wraps `HTMLElement.prototype.attachInternals`:
  - tries the native call,
  - on throw / falsy return → falls back to `createFallbackInternals()`,
  - on success-but-incomplete → calls `ensureInternalsComplete(internals)`.

> A second, older stub also exists at `packages/ui/vitest.setup.ts`. It returns a full `ElementInternals` stub with `states = new Set<string>()` (a real `Set`), so `:state()` styling *does* work there. Prefer the Angular `test-setup.ts` variant as the canonical reference; the `packages/ui` one is legacy.

---

## 3. Caveat — `states` fallback is NOT a real CustomStateSet

Within `ensureInternalsComplete`, the `states` shim is a **minimal stub**:

```typescript
const ensureStates = (internals: ElementInternals): void => {
  if (!Reflect.get(internals, 'states')) {
    Reflect.set(internals, 'states', { add: () => {}, delete: () => {}, has: () => false })
  }
}
```

It provides only `{ add, delete, has }`. A real `CustomStateSet` is **Set-like** — it has `.size` and is iterable. Therefore:

- **WA `:state()` CSS styling will NOT work under this shim.** `:state(invalid)` / `:state(required)` selectors cannot match.
- This is **test-only and acceptable** — tests assert on JS properties, not on `:state()`-driven styles.
- **Flag it** if any component relies on `:state()` in tests (e.g. a visual test asserting a `:state(...)` rule applies). Those tests need a real `CustomStateSet` (use the `packages/ui/vitest.setup.ts` stub, or run under a complete engine).

---

## 4. When you need real `:state()` in tests

- Use the `packages/ui/vitest.setup.ts` stub (its `states` is a real `Set<string>`), **or**
- run under a FACE-complete engine (Chromium-based, Safari ≥ 17.4, Firefox ≥ 126), **or**
- upgrade the `states` fallback in `test-setup.ts` to a `Set`-compatible shim if a component genuinely needs `:state()` assertions.

---

## 5. Sources

- `https://caniuse.com/mdn-api_elementinternals_states` — CustomStateSet: Safari 17.4+, FF 126+, Chrome/Edge 90+
- `https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals`
- `https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue` — Chrome 77, FF 98, Safari 16.4
- `https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements`
- `https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet`
