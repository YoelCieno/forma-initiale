import { describe, it, expect } from 'vitest'
import { validateHex, getThemeClass } from './palette'

describe('validateHex', () => {
  it('accepts #ff0000', () => {
    expect(validateHex('#ff0000')).toBe(true)
  })

  it('accepts #fff (shorthand)', () => {
    expect(validateHex('#fff')).toBe(true)
  })

  it('rejects #xyz123', () => {
    expect(validateHex('#xyz123')).toBe(false)
  })

  it('rejects ff0000 (missing #)', () => {
    expect(validateHex('ff0000')).toBe(false)
  })

  it('rejects #GGGGGG', () => {
    expect(validateHex('#GGGGGG')).toBe(false)
  })
})

describe('getThemeClass', () => {
  it('maps default to wa-theme-default', () => {
    expect(getThemeClass('default')).toBe('wa-theme-default')
  })

  it('maps awesome to wa-theme-awesome', () => {
    expect(getThemeClass('awesome')).toBe('wa-theme-awesome')
  })

  it('maps shoelace to wa-theme-shoelace', () => {
    expect(getThemeClass('shoelace')).toBe('wa-theme-shoelace')
  })

  it('maps custom to empty string', () => {
    expect(getThemeClass('custom')).toBe('')
  })
})
