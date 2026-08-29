import { createFallbackInternals } from './dom-shim'

describe('dom-shim', () => {
  it('createFallbackInternals exposes ElementInternals methods', () => {
    const internals = createFallbackInternals<ElementInternals>()
    expect(typeof internals.setValidity).toBe('function')
    expect(typeof internals.setFormValue).toBe('function')
  })
  it('attachInternals patch yields internals with setValidity', () => {
    const el = document.createElement('div')
    const internals = el.attachInternals()
    expect(internals).toBeDefined()
    expect(typeof internals.setValidity).toBe('function')
  })
})
