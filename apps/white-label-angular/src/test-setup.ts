import { isFunction, isObject } from './utils/type-guards'
import { createFallbackInternals } from './utils/dom-shim'

// ── helpers ──

const ensureMethod = (target: object, name: string, fallback: (...args: unknown[]) => unknown): void => {
  if (!isFunction(Reflect.get(target, name))) {
    Reflect.set(target, name, fallback)
  }
}

/**
 * jsdom + some browsers expose ElementInternals but with incomplete
 * surface (missing `validity.valid`, `states`, etc.). This ensures
 * the `validity` prop always has at least `{ valid: true }`.
 * Extracted from ensureInternalsComplete for SRP — validity patching
 * is its own concern, testable in isolation.
 */
const ensureValidity = (internals: ElementInternals): void => {
  if (!isObject(Reflect.get(internals, 'validity'))) {
    Reflect.set(internals, 'validity', { valid: true })
    return
  }
  const validity = Reflect.get(internals, 'validity')
  if (isObject(validity) && typeof validity['valid'] === 'undefined') {
    Reflect.set(validity, 'valid', true)
  }
}

const ensureStates = (internals: ElementInternals): void => {
  if (!Reflect.get(internals, 'states')) {
    Reflect.set(internals, 'states', { add: () => {}, delete: () => {}, has: () => false })
  }
}

const ensureValidationMessage = (internals: ElementInternals): void => {
  if (typeof Reflect.get(internals, 'validationMessage') !== 'string') {
    Reflect.set(internals, 'validationMessage', '')
  }
}

const ensureWillValidate = (internals: ElementInternals): void => {
  if (typeof Reflect.get(internals, 'willValidate') === 'undefined') {
    Reflect.set(internals, 'willValidate', false)
  }
}

const ensureShadowRoot = (internals: ElementInternals): void => {
  if (!('shadowRoot' in internals)) {
    Reflect.set(internals, 'shadowRoot', null)
  }
}

const ensureInternalsComplete = (internals: ElementInternals): void => {
  ensureMethod(internals, 'setValidity', () => {})
  ensureMethod(internals, 'setFormValue', () => {})
  ensureMethod(internals, 'checkValidity', () => true)
  ensureMethod(internals, 'reportValidity', () => true)
  ensureValidity(internals)
  ensureStates(internals)
  ensureValidationMessage(internals)
  ensureWillValidate(internals)
  ensureShadowRoot(internals)
}

// ── patches ──

/**
 * What is ElementInternals (EI)?
 * - Browser API for form-associated custom elements (extends HTMLElement via attachInternals()).
 * - Exposes setValidity(), setFormValue(), validity, states, etc. for custom form controls.
 * - jsdom ships a partial stub — methods like setFormValue are missing.
 *
 * What does patchElementInternalsPrototype do?
 * - Patches ElementInternals.prototype once so every future instance inherits the missing
 *   methods. Cheap, global, runs at test-setup time. Does NOT touch attachInternals().
 */
const patchElementInternalsPrototype = (): void => {
  if (typeof globalThis === 'undefined') return
  const ElementInternalsCtor = globalThis.ElementInternals
  if (!ElementInternalsCtor) return
  ensureMethod(ElementInternalsCtor.prototype, 'setValidity', () => {})
  ensureMethod(ElementInternalsCtor.prototype, 'setFormValue', () => {})
  ensureMethod(ElementInternalsCtor.prototype, 'checkValidity', () => true)
  ensureMethod(ElementInternalsCtor.prototype, 'reportValidity', () => true)
}

/**
 * Wraps the native attachInternals so callers always get a usable object:
 * - tries native orig.call(this)
 * - if it throws or returns falsy, falls back to createFallbackInternals()
 * - if it succeeds but is incomplete, patches the instance via ensureInternalsComplete()
 *
 * Extracted as standalone factory (SRP): creation logic lives outside
 * patchAttachInternals, patchAttachInternals only decides when/how to install.
 */
const createAttachInternalsWrapper = (
  orig: typeof HTMLElement.prototype.attachInternals,
): typeof HTMLElement.prototype.attachInternals =>
  function (this: HTMLElement): ElementInternals {
    try {
      const internals = orig.call(this)
      if (internals) ensureInternalsComplete(internals)
      return internals ?? createFallbackInternals()
    } catch {
      return createFallbackInternals()
    }
  }

/**
 * What does patchAttachInternals do?
 * - Monkey-patches HTMLElement.prototype.attachInternals for jsdom/test envs where
 *   the method throws, is missing, or returns incomplete internals.
 * - Delegates actual wrapping to createAttachInternalsWrapper (SRP).
 */
const patchAttachInternals = (): void => {
  if (typeof globalThis === 'undefined') return
  const HTMLElementCtor = globalThis.HTMLElement
  if (!HTMLElementCtor) return

  const orig = HTMLElementCtor.prototype.attachInternals
  if (!orig) {
    HTMLElementCtor.prototype.attachInternals = () => createFallbackInternals()
    return
  }
  HTMLElementCtor.prototype.attachInternals = createAttachInternalsWrapper(orig)
}

patchElementInternalsPrototype()
patchAttachInternals()
