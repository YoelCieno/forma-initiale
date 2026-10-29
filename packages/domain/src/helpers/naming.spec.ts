import { describe, it, expect } from 'vitest'
import { naming } from './naming'

describe('getProductNames', () => {
  it('returns alpha/beta/gamma ids for a hyphenated tenant name', () => {
    const { getProductNames } = naming()
    expect(getProductNames('zen-plants')).toEqual([
      'zen-plants-alpha',
      'zen-plants-beta',
      'zen-plants-gamma',
    ])
  })

  it('returns alpha/beta/gamma ids for a single-word tenant name', () => {
    const { getProductNames } = naming()
    expect(getProductNames('x')).toEqual(['x-alpha', 'x-beta', 'x-gamma'])
  })
})

describe('derivePrefix', () => {
  it('uses first characters of the first two segments for a two-segment name', () => {
    const { derivePrefix } = naming()
    expect(derivePrefix('fake-plants')).toBe('fp')
    expect(derivePrefix('fake-plants-vue')).toBe('fp')
    expect(derivePrefix('fake-plants-angular')).toBe('fp')
  })

  it('uses only the first two segments for a three-segment name', () => {
    const { derivePrefix } = naming()
    expect(derivePrefix('my-cool-app')).toBe('mc')
  })

  it('falls back to the first two characters for a single-segment name', () => {
    const { derivePrefix } = naming()
    expect(derivePrefix('solo')).toBe('so')
  })
})
