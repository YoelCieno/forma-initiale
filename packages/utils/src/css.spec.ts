import { describe, it, expect } from 'vitest'
import { formatCSSKeyValue } from './css'

describe('formatCSSKeyValue', () => {
  it('formats single entry', () => {
    expect(formatCSSKeyValue({ '--color': 'red' })).toBe('  --color: red;')
  })

  it('formats multiple entries with newlines', () => {
    const result = formatCSSKeyValue({ '--color': 'red', '--bg': 'blue' })
    expect(result).toBe('  --color: red;\n  --bg: blue;')
  })

  it('returns empty string for empty object', () => {
    expect(formatCSSKeyValue({})).toBe('')
  })

  it('preserves CSS variable naming convention (--kebab-case)', () => {
    expect(formatCSSKeyValue({ '--my-var': '10px', '--another-var': '#fff' })).toBe(
      '  --my-var: 10px;\n  --another-var: #fff;'
    )
  })
})
