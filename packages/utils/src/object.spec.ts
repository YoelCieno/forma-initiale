import { describe, it, expect } from 'vitest'
import { object } from './object'

describe('isObject', () => {
  const { isObject } = object()

  it('returns true for plain objects {}', () => {
    expect(isObject({})).toBe(true)
  })

  it('returns true for objects with properties', () => {
    expect(isObject({ a: 1, b: 'hello' })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false)
  })

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false)
  })

  it('returns false for string', () => {
    expect(isObject('hello')).toBe(false)
  })

  it('returns false for number', () => {
    expect(isObject(42)).toBe(false)
  })

  it('returns false for boolean', () => {
    expect(isObject(true)).toBe(false)
  })

  it('returns false for Date', () => {
    expect(isObject(new Date())).toBe(false)
  })

  it('returns false for RegExp', () => {
    expect(isObject(/abc/)).toBe(false)
  })

  it('returns false for Map', () => {
    expect(isObject(new Map())).toBe(false)
  })

  it('returns false for Set', () => {
    expect(isObject(new Set())).toBe(false)
  })
})

describe('safeJsonParse', () => {
  const { safeJsonParse } = object()

  it('parses valid JSON string', () => {
    const result = safeJsonParse<{ a: number }>('{"a":1}', 'test')
    expect(result).toEqual({ a: 1 })
  })

  it('throws for invalid JSON string', () => {
    expect(() => safeJsonParse('not-json', 'test')).toThrow(/Invalid JSON/)
  })

  it('throws with custom label in error message', () => {
    expect(() => safeJsonParse('{{{', 'my-label')).toThrow(/Invalid JSON in my-label/)
  })
})
