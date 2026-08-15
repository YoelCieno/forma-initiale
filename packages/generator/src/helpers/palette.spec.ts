import { describe, it, expect } from 'vitest'
import { validateHex, getThemeClass, getThemeTokens } from './palette'

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

  it('maps cyberpunk to empty string', () => {
    expect(getThemeClass('cyberpunk')).toBe('')
  })

  it('maps coffeecup to empty string', () => {
    expect(getThemeClass('coffeecup')).toBe('')
  })

  it('maps silk to empty string', () => {
    expect(getThemeClass('silk')).toBe('')
  })

  it('maps custom to empty string', () => {
    expect(getThemeClass('custom')).toBe('')
  })
})

describe('getThemeTokens', () => {
  const expectedKeys = [
    '--brand-fill-quiet',
    '--brand-fill-normal',
    '--brand-fill-loud',
    '--brand-border-quiet',
    '--brand-border-normal',
    '--brand-border-loud',
    '--brand-on-quiet',
    '--brand-on-normal',
    '--brand-on-loud',
    '--color-text-body',
    '--color-text-muted',
    '--color-text-heading',
    '--color-border',
    '--color-border-light',
    '--color-error',
    '--fs-xs',
    '--fs-s',
    '--fs-m',
    '--fs-l',
    '--fs-xl',
    '--min-width-layout',
    '--max-width-layout',
  ]

  const hexColor = /^#[0-9a-fA-F]{3,8}$/
  const remValue = /^\d+(\.\d+)?rem$/
  const pixelValue = /^\d+px$/

  function assertColorTokens(tokens: Record<string, string>) {
    for (const key of expectedKeys) {
      expect(tokens).toHaveProperty(key)
    }
    for (const [key, value] of Object.entries(tokens)) {
      if (key.startsWith('--fs-')) {
        expect(value).toMatch(remValue)
      }
      if (key.startsWith('--brand-') || key.startsWith('--color-')) {
        expect(value).toMatch(hexColor)
      }
      if (key.startsWith('--min-width-') || key.startsWith('--max-width-')) {
        expect(value).toMatch(pixelValue)
      }
    }
  }

  it('returns empty object for default theme', () => {
    expect(getThemeTokens('default')).toEqual({})
  })

  it('returns valid tokens for cyberpunk theme', () => {
    assertColorTokens(getThemeTokens('cyberpunk'))
  })

  it('returns valid tokens for coffeecup theme', () => {
    assertColorTokens(getThemeTokens('coffeecup'))
  })

  it('returns valid tokens for silk theme', () => {
    assertColorTokens(getThemeTokens('silk'))
  })

  it('returns empty object for unknown theme', () => {
    expect(getThemeTokens('unknown')).toEqual({})
  })
})
