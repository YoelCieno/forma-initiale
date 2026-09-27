/**
 * Test environment setup for the fake-plants-angular tenant.
 *
 * jsdom ships an incomplete `ElementInternals` (missing validity/states/
 * setFormValue), so WA form-associated custom elements throw on
 * attachInternals(). This replicates the shell's ensureInternalsComplete
 * effect with a self-contained patch — deliberately NOT imported from the
 * shell: package exports expose bootstrap only, and copying shell source
 * files into the tenant is forbidden by spec.
 */

const ensureValidity = (internals: ElementInternals): void => {
  const validity = internals.validity
  if (!validity || typeof validity.valid === 'undefined') {
    Object.defineProperty(internals, 'validity', {
      value: { valid: true },
      configurable: true,
    })
  }
}

const patchElementInternalsPrototype = (): void => {
  const ctor = globalThis.ElementInternals
  if (!ctor) return
  for (const [name, fallback] of [
    ['setValidity', () => {}],
    ['setFormValue', () => {}],
    ['checkValidity', () => true],
    ['reportValidity', () => true],
  ] as const) {
    if (typeof ctor.prototype[name] !== 'function') {
      Object.defineProperty(ctor.prototype, name, {
        value: fallback,
        configurable: true,
      })
    }
  }
}

const patchAttachInternals = (): void => {
  const HTMLElementCtor = globalThis.HTMLElement
  if (!HTMLElementCtor) return
  const original = HTMLElementCtor.prototype.attachInternals
  HTMLElementCtor.prototype.attachInternals = function (this: HTMLElement): ElementInternals {
    try {
      const internals = original.call(this)
      ensureValidity(internals)
      if (!internals.states) {
        Object.defineProperty(internals, 'states', {
          value: { add: () => {}, delete: () => {}, has: () => false },
          configurable: true,
        })
      }
      return internals
    } catch {
      // jsdom throws when no form-associated element is set up
      return { validity: { valid: true }, states: new Set() } as ElementInternals
    }
  }
}

patchElementInternalsPrototype()
patchAttachInternals()
