import { describe, it, expect } from 'vitest'
import { typeGuards } from './type-guards'

const { isFunction, isNumber } = typeGuards()

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

describe('isNumber', () => {
  it('returns true for integer', () => {
    expect(isNumber(42)).toBe(true)
  })

  it('returns true for zero', () => {
    expect(isNumber(0)).toBe(true)
  })

  it('returns true for float', () => {
    expect(isNumber(3.14)).toBe(true)
  })

  it('returns true for NaN (typeof is number)', () => {
    expect(isNumber(Number.NaN)).toBe(true)
  })

  it('returns false for numeric string', () => {
    expect(isNumber('42')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isNumber(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isNumber(undefined)).toBe(false)
  })

  it('returns false for boolean', () => {
    expect(isNumber(true)).toBe(false)
  })

  it('returns false for object', () => {
    expect(isNumber({})).toBe(false)
  })

  it('narrows an unknown to number', () => {
    const value: unknown = 7
    if (isNumber(value)) {
      expect(value + 1).toBe(8)
    } else {
      throw new Error('expected isNumber to narrow to number')
    }
  })
})
