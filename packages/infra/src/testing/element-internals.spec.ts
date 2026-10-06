import { afterEach, describe, expect, it, vi } from 'vitest'
import { elementInternalsShim } from './element-internals'

/**
 * Test-boundary cast: fabricated `ElementInternals` doubles. Node test env
 * has no runtime DOM constructor, so every stub object crosses this single
 * documented boundary.
 */
const fabricate = (partial: Record<string, unknown>): ElementInternals =>
  partial as unknown as ElementInternals

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('elementInternalsShim factory', () => {
  it('returns all shim operations', () => {
    const shim = elementInternalsShim()
    expect(typeof shim.createFallbackInternals).toBe('function')
    expect(typeof shim.ensureInternalsComplete).toBe('function')
    expect(typeof shim.patchElementInternalsPrototype).toBe('function')
    expect(typeof shim.patchAttachInternals).toBe('function')
    expect(typeof shim.install).toBe('function')
  })

  it('applies the shim automatically on import (self-installing entry)', async () => {
    vi.resetModules()
    class ThrowingHost {
      attachInternals(): ElementInternals {
        throw new Error('jsdom: not supported')
      }
    }
    vi.stubGlobal('HTMLElement', ThrowingHost)

    const mod = await import('./element-internals')
    expect(typeof mod.elementInternalsShim).toBe('function')

    const host = new ThrowingHost()
    const internals = host.attachInternals()
    expect(internals.validity.valid).toBe(true)
  })
})

describe('ensureInternalsComplete', () => {
  it('completes every missing piece of an incomplete FACE surface', () => {
    const internals = fabricate({ validity: {} })

    elementInternalsShim().ensureInternalsComplete(internals)

    expect(internals.validity.valid).toBe(true)
    expect(internals.states.has('some-state')).toBe(false)
    expect(typeof internals.states.add).toBe('function')
    expect(typeof internals.states.delete).toBe('function')
    expect(internals.validationMessage).toBe('')
    expect(internals.willValidate).toBe(false)
    expect(internals.shadowRoot).toBeNull()
    expect(typeof internals.setValidity).toBe('function')
    expect(typeof internals.setFormValue).toBe('function')
    expect(internals.checkValidity()).toBe(true)
    expect(internals.reportValidity()).toBe(true)
  })

  it('preserves already-complete values', () => {
    const nativeSetValidity = (): void => {}
    const existingStates = { add: () => {}, delete: () => {}, has: () => true }
    const internals = fabricate({
      validity: { valid: false },
      states: existingStates,
      validationMessage: 'custom message',
      willValidate: true,
      shadowRoot: null,
      setValidity: nativeSetValidity,
      setFormValue: () => {},
      checkValidity: () => false,
      reportValidity: () => false,
    })

    elementInternalsShim().ensureInternalsComplete(internals)

    expect(internals.validity.valid).toBe(false)
    expect(internals.states.has('anything')).toBe(true)
    expect(internals.validationMessage).toBe('custom message')
    expect(internals.willValidate).toBe(true)
    expect(internals.setValidity).toBe(nativeSetValidity)
    expect(internals.checkValidity()).toBe(false)
  })
})

describe('patchAttachInternals fallbacks', () => {
  it('returns a usable fallback when native attachInternals throws', () => {
    class ThrowingHost {
      attachInternals(): ElementInternals {
        throw new Error('jsdom: not supported')
      }
    }
    vi.stubGlobal('HTMLElement', ThrowingHost)
    elementInternalsShim().install()

    const internals = new ThrowingHost().attachInternals()

    expect(internals.validity.valid).toBe(true)
    expect(typeof internals.setValidity).toBe('function')
    expect(typeof internals.setFormValue).toBe('function')
    expect(typeof internals.checkValidity).toBe('function')
    expect(typeof internals.reportValidity).toBe('function')
    expect(typeof internals.states.add).toBe('function')
    expect(typeof internals.states.delete).toBe('function')
    expect(typeof internals.states.has).toBe('function')
  })

  it('returns a usable fallback when native attachInternals returns falsy', () => {
    class FalsyHost {
      attachInternals(): ElementInternals | undefined {
        return undefined
      }
    }
    vi.stubGlobal('HTMLElement', FalsyHost)
    elementInternalsShim().install()

    const internals = new FalsyHost().attachInternals()

    expect(internals?.validity.valid).toBe(true)
    expect(typeof internals?.setFormValue).toBe('function')
  })

  it('returns a fallback when attachInternals is missing on the prototype', () => {
    class BareHost {}
    vi.stubGlobal('HTMLElement', BareHost)
    elementInternalsShim().install()

    const attached: () => ElementInternals = Reflect.get(BareHost.prototype, 'attachInternals')
    const internals = attached.call(new BareHost())

    expect(internals.validity.valid).toBe(true)
    expect(typeof internals.setValidity).toBe('function')
    expect(typeof internals.states.has).toBe('function')
  })

  it('completes incomplete-but-truthy native internals', () => {
    class PartialHost {
      attachInternals(): ElementInternals {
        return fabricate({ validity: {} })
      }
    }
    vi.stubGlobal('HTMLElement', PartialHost)
    elementInternalsShim().install()

    const internals = new PartialHost().attachInternals()

    expect(internals.validity.valid).toBe(true)
    expect(internals.validationMessage).toBe('')
    expect(internals.willValidate).toBe(false)
    expect(typeof internals.states.has).toBe('function')
  })
})

describe('patchElementInternalsPrototype', () => {
  it('stubs a missing prototype method so it is callable', () => {
    class FakeInternals {
      setValidity(): void {}
    }
    vi.stubGlobal('ElementInternals', FakeInternals)
    elementInternalsShim().patchElementInternalsPrototype()

    const descriptor = Object.getOwnPropertyDescriptor(FakeInternals.prototype, 'setFormValue')
    expect(typeof descriptor?.value).toBe('function')
    expect(() => descriptor?.value?.()).not.toThrow()
  })

  it('preserves an existing native method', () => {
    class FakeInternals {
      setValidity(): void {}
    }
    vi.stubGlobal('ElementInternals', FakeInternals)
    const nativeSetValidity = FakeInternals.prototype.setValidity
    elementInternalsShim().patchElementInternalsPrototype()

    const after = Reflect.get(FakeInternals.prototype, 'setValidity')
    expect(after).toBe(nativeSetValidity)
  })
})

describe('install idempotency', () => {
  it('wraps attachInternals exactly once across double install', () => {
    class NativeHost {
      attachInternals(): ElementInternals {
        return fabricate({ validity: { valid: true } })
      }
    }
    vi.stubGlobal('HTMLElement', NativeHost)
    const { install } = elementInternalsShim()

    install()
    const firstWrap = NativeHost.prototype.attachInternals
    install()
    const secondWrap = NativeHost.prototype.attachInternals

    expect(secondWrap).toBe(firstWrap)
  })
})

describe('missing DOM globals', () => {
  it('is a safe no-op and creates no global', () => {
    vi.stubGlobal('ElementInternals', undefined)
    vi.stubGlobal('HTMLElement', undefined)

    expect(() => elementInternalsShim().install()).not.toThrow()
    expect(globalThis.ElementInternals).toBeUndefined()
    expect(globalThis.HTMLElement).toBeUndefined()
  })
})
