import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Content-level token contract: jsdom cannot resolve CSS custom-property
// cascade (angular.json styles not applied in unit tests), so we assert the
// source values — visual resolution is covered by the human parity check.
// cwd = app dir (per-package `ng test` script).
const readTokens = (): string =>
  readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

const readShellTokens = (): string =>
  readFileSync(
    resolve(process.cwd(), '../white-label-angular/src/styles/tokens.css'),
    'utf8',
  )

describe('fake-plants-angular brand tokens', () => {
  it('defines the green brand values matching fake-plants-vue', () => {
    const css = readTokens()
    expect(css).toContain('--brand-fill-quiet: #d6e1da')
    expect(css).toContain('--brand-fill-normal: #16a34a')
    expect(css).toContain('--brand-fill-loud: #15803d')
    expect(css).toContain('--brand-border-quiet: #bbf7d0')
    expect(css).toContain('--brand-border-normal: #86efac')
    expect(css).toContain('--brand-border-loud: #22c55e')
    expect(css).toContain('--brand-on-quiet: #166534')
    expect(css).toContain('--brand-on-normal: #fff')
    expect(css).toContain('--brand-on-loud: #f0fdf4')
  })

  it('overrides on :where(:root) like the Vue tenant', () => {
    expect(readTokens()).toContain(':where(:root)')
  })

  it('shell tokens stay untouched (no fake-plants green)', () => {
    const shell = readShellTokens()
    expect(shell).not.toContain('#16a34a')
    expect(shell).toContain('--brand-fill-normal: #4f46e5')
  })
})
