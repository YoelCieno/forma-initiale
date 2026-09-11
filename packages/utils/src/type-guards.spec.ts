import { describe, it, expect } from 'vitest'
import { isFunction } from './type-guards'

describe('isFunction', () => {
  it('returns true for arrow function', () => {
    expect(isFunction(() => {})).toBe(true)
  })

  it('returns true for regular function', () => {
    expect(isFunction(function foo() {})).toBe(true)
  })

  it('returns true for async function', () => {
    expect(isFunction(async () => {})).toBe(true)
  })

  it('returns true for class constructors', () => {
    class Foo {}
    expect(isFunction(Foo)).toBe(true)
  })

  it('returns false for string', () => {
    expect(isFunction('hello')).toBe(false)
  })

  it('returns false for number', () => {
    expect(isFunction(42)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isFunction(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isFunction(undefined)).toBe(false)
  })

  it('returns false for object', () => {
    expect(isFunction({})).toBe(false)
  })

  it('returns false for array', () => {
    expect(isFunction([])).toBe(false)
  })

  it('returns false for Promise (typeof is object)', () => {
    expect(isFunction(Promise.resolve())).toBe(false)
  })
})
