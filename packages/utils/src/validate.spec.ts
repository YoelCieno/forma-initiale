import { describe, it, expect } from 'vitest'
import { validateHex } from './validate'

describe('validateHex', () => {
  it('returns true for valid 6-digit hex #ff00ff', () => {
    expect(validateHex('#ff00ff')).toBe(true)
  })

  it('returns true for valid 6-digit hex #FF00FF', () => {
    expect(validateHex('#FF00FF')).toBe(true)
  })

  it('returns true for valid 6-digit hex #123abc', () => {
    expect(validateHex('#123abc')).toBe(true)
  })

  it('returns true for valid 3-digit hex #f0f', () => {
    expect(validateHex('#f0f')).toBe(true)
  })

  it('returns true for valid 3-digit hex #FFF', () => {
    expect(validateHex('#FFF')).toBe(true)
  })

  it('returns false for invalid #fff0', () => {
    expect(validateHex('#fff0')).toBe(false)
  })

  it('returns false for invalid #gggggg', () => {
    expect(validateHex('#gggggg')).toBe(false)
  })

  it('returns false for missing hash ff00ff', () => {
    expect(validateHex('ff00ff')).toBe(false)
  })

  it('returns false for invalid length #12345', () => {
    expect(validateHex('#12345')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(validateHex('')).toBe(false)
  })
})
