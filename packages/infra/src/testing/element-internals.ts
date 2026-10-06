/**
 * Shared ElementInternals (form-associated custom element / FACE) test shim.
 *
 * jsdom (and old Safari <17.4 / Firefox <126) expose an incomplete
 * `ElementInternals` surface — missing FACE methods, `validity.valid`,
 * `states`, etc. — so WA form controls throw on `attachInternals()`.
 * Single source of truth for both Angular apps: imported as a self-installing
 * `setupFiles` entry (`@repo/infra/testing/element-internals`).
 */

const WRAPPED = Symbol.for('repo.element-internals.shim.wrapped')

const FACE_METHODS = ['setValidity', 'setFormValue', 'checkValidity', 'reportValidity'] as const
type FaceMethod = (typeof FACE_METHODS)[number]

const FACE_FALLBACKS = {
  setValidity: () => {},
  setFormValue: () => {},
  checkValidity: () => true,
  reportValidity: () => true,
} satisfies Record<FaceMethod, () => boolean | void>

type OptionalProp = 'states' | 'validationMessage' | 'willValidate' | 'shadowRoot'

const OPTIONAL_PROPS: ReadonlyArray<readonly [OptionalProp, () => unknown]> = [
  ['states', () => ({ add: () => {}, delete: () => {}, has: () => false })],
  ['validationMessage', () => ''],
  ['willValidate', () => false],
  ['shadowRoot', () => null],
]

/** Return-type interface (function-factory convention: same file as factory). */
export interface ElementInternalsShim {
  createFallbackInternals: () => ElementInternals
  ensureInternalsComplete: (internals: ElementInternals) => void
  patchElementInternalsPrototype: () => void
  patchAttachInternals: () => void
  install: () => void
}

export function elementInternalsShim(): ElementInternalsShim {
  /**
   * Full FACE surface stand-in for when the native call is unusable.
   * D5 — single documented boundary cast: a fabricated object standing in
   * for the DOM `ElementInternals` (no runtime type exists to construct one).
   */
  const createFallbackInternals = (): ElementInternals =>
    ({
      shadowRoot: null,
      form: null,
      labels: [],
      states: { add: () => {}, delete: () => {}, has: () => false },
      validationMessage: '',
      validity: { valid: true },
      willValidate: false,
      checkValidity: () => true,
      reportValidity: () => true,
      setFormValue: () => {},
      setValidity: () => {},
    }) as unknown as ElementInternals

  const ensureValidity = (internals: ElementInternals): void => {
    const validity = Reflect.get(internals, 'validity')
    if (typeof validity !== 'object' || validity === null) {
      Reflect.set(internals, 'validity', { valid: true })
      return
    }
    if (typeof Reflect.get(validity, 'valid') === 'undefined') {
      Reflect.set(validity, 'valid', true)
    }
  }

  const ensureInternalsComplete = (internals: ElementInternals): void => {
    for (const name of FACE_METHODS) {
      if (typeof Reflect.get(internals, name) !== 'function') {
        Reflect.set(internals, name, FACE_FALLBACKS[name])
      }
    }
    ensureValidity(internals)
    for (const [name, fallback] of OPTIONAL_PROPS) {
      if (Reflect.get(internals, name) === undefined) {
        Reflect.set(internals, name, fallback())
      }
    }
  }

  const patchElementInternalsPrototype = (): void => {
    const ctor = globalThis.ElementInternals
    if (!ctor) return
    for (const name of FACE_METHODS) {
      if (typeof Reflect.get(ctor.prototype, name) !== 'function') {
        Reflect.set(ctor.prototype, name, FACE_FALLBACKS[name])
      }
    }
  }

  const patchAttachInternals = (): void => {
    const HTMLElementCtor = globalThis.HTMLElement
    if (!HTMLElementCtor) return

    const original = HTMLElementCtor.prototype.attachInternals
    if (!original) {
      const fallback = (): ElementInternals => createFallbackInternals()
      Reflect.set(fallback, WRAPPED, true)
      HTMLElementCtor.prototype.attachInternals = fallback
      return
    }
    // D6 — idempotency: never stack wrappers (module side effect + explicit install).
    if (Reflect.get(original, WRAPPED)) return

    const wrapper = function (this: HTMLElement): ElementInternals {
      try {
        const internals = original.call(this)
        if (internals) {
          ensureInternalsComplete(internals)
          return internals
        }
        return createFallbackInternals()
      } catch {
        return createFallbackInternals()
      }
    }
    Reflect.set(wrapper, WRAPPED, true)
    HTMLElementCtor.prototype.attachInternals = wrapper
  }

  const install = (): void => {
    patchElementInternalsPrototype()
    patchAttachInternals()
  }

  return {
    createFallbackInternals,
    ensureInternalsComplete,
    patchElementInternalsPrototype,
    patchAttachInternals,
    install,
  }
}

// Self-installing entry (D1): setupFiles import applies the shim with zero app code.
elementInternalsShim().install()
