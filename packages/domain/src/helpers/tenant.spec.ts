import { describe, it, expect, expectTypeOf } from 'vitest'
import { isValidTenant } from './tenant'

describe('isValidTenant', () => {
  it('returns true for valid tenant ID in the provided list', () => {
    expect(isValidTenant('default', ['default', 'silk'])).toBe(true)
    expect(isValidTenant('silk', ['default', 'silk'])).toBe(true)
  })

  it('returns false for invalid tenant ID', () => {
    expect(isValidTenant('unknown', ['default', 'silk'])).toBe(false)
    expect(isValidTenant('custom', ['default', 'silk'])).toBe(false)
  })

  it('works with empty valid IDs array', () => {
    expect(isValidTenant('default', [])).toBe(false)
    expect(isValidTenant('', [])).toBe(false)
  })

  it('type narrowing works (value is string after check)', () => {
    const value: unknown = 'default'
    const validIds = ['default', 'silk']
    // type guard should narrow unknown -> string when true
    if (isValidTenant(value as string, validIds)) {
      expectTypeOf(value as string).toEqualTypeOf<string>()
      expect(value).toBe('default')
    } else {
      throw new Error('should have narrowed to valid tenant')
    }

    const invalid: unknown = 'unknown'
    expect(isValidTenant(invalid as string, validIds)).toBe(false)
  })
})
