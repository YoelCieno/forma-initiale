import { describe, it, expect } from 'vitest'
import { theme } from './theme'

describe('getThemeClass', () => {
  it("returns 'wa-theme-default' for 'default' theme", () => {
    const { getThemeClass } = theme()
    expect(getThemeClass('default')).toBe('wa-theme-default')
  })

  it('returns empty string for cyberpunk', () => {
    const { getThemeClass } = theme()
    expect(getThemeClass('cyberpunk')).toBe('')
  })

  it('returns empty string for coffeecup', () => {
    const { getThemeClass } = theme()
    expect(getThemeClass('coffeecup')).toBe('')
  })

  it('returns empty string for silk', () => {
    const { getThemeClass } = theme()
    expect(getThemeClass('silk')).toBe('')
  })

  it('returns empty string for custom', () => {
    const { getThemeClass } = theme()
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

  it("returns empty object for 'default' theme", () => {
    const { getThemeTokens } = theme()
    expect(getThemeTokens('default')).toEqual({})
  })

  it("returns color tokens for 'cyberpunk' theme", () => {
    const { getThemeTokens } = theme()
    const tokens = getThemeTokens('cyberpunk')
    expect(tokens).toHaveProperty('--brand-fill-quiet')
    expect(tokens).toHaveProperty('--brand-fill-normal')
    assertColorTokens(tokens)
  })

  it("returns color tokens for 'coffeecup' theme", () => {
    const { getThemeTokens } = theme()
    assertColorTokens(getThemeTokens('coffeecup'))
  })

  it("returns color tokens for 'silk' theme", () => {
    const { getThemeTokens } = theme()
    assertColorTokens(getThemeTokens('silk'))
  })

  it('returns empty object for unknown theme', () => {
    const { getThemeTokens } = theme()
    expect(getThemeTokens('unknown')).toEqual({})
    expect(getThemeTokens('custom-unknown')).toEqual({})
  })
})
