import { describe, it, expect } from 'vitest'
import { getErrorMessage } from './error'

describe('getErrorMessage', () => {
  it('returns message from Error instance', () => {
    expect(getErrorMessage(new Error('oops'))).toBe('oops')
  })

  it('handles Error with empty message', () => {
    expect(getErrorMessage(new Error(''))).toBe('')
  })

  it('returns string coercion for number', () => {
    expect(getErrorMessage(42)).toBe('42')
  })

  it('returns string coercion for string', () => {
    expect(getErrorMessage('hello')).toBe('hello')
  })

  it('returns string coercion for plain object', () => {
    expect(getErrorMessage({ foo: 1 })).toBe('[object Object]')
  })

  it('returns string coercion for null', () => {
    expect(getErrorMessage(null)).toBe('null')
  })

  it('returns string coercion for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('undefined')
  })
})
