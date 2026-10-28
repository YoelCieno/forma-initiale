import { describe, it, expect } from 'vitest'
import type { TenantContext, Theme } from '../models'
import { gitkeep, tokensCss, metadataTs } from './common'

function ctx(overrides: Partial<TenantContext> = {}): TenantContext {
  return {
    name: 'test-tenant',
    Name: 'Test',
    camelName: 'testTenant',
    description: 'Test tenant',
    metadataMode: 'fixture',
    theme: 'default',
    brandHex: undefined,
    overrideComponent: false,
    overrideComponentName: undefined,
    prefix: 'te',
    framework: 'vue',
    devPort: 3103,
    cwd: '/tmp',
    argv: [],
    pinion: {} as TenantContext['pinion'],
    ...overrides,
  }
}

describe('gitkeep', () => {
  it('is an empty string (static file, no interpolation)', () => {
    expect(gitkeep).toBe('')
  })
})

describe('tokensCss', () => {
  it('contains brand hex when theme is custom', () => {
    const result = tokensCss(ctx({ theme: 'custom', brandHex: '#ff6600' }))
    expect(result).toContain('--brand-fill-normal: #ff6600')
  })

  it('contains theme tokens for cyberpunk theme', () => {
    const result = tokensCss(ctx({ theme: 'cyberpunk' }))
    expect(result).toContain('--brand-fill-normal')
    expect(result).toContain('--color-text-body')
    expect(result).toContain('--fs-xl')
  })

  it('contains theme tokens for coffeecup theme', () => {
    const result = tokensCss(ctx({ theme: 'coffeecup' }))
    expect(result).toContain('--brand-fill-normal')
    expect(result).toContain('--color-text-body')
    expect(result).toContain('--fs-xl')
  })

  it('contains theme tokens for silk theme', () => {
    const result = tokensCss(ctx({ theme: 'silk' }))
    expect(result).toContain('--brand-fill-normal')
    expect(result).toContain('--color-text-body')
    expect(result).toContain('--fs-xl')
  })

  const allThemes: Theme[] = ['default', 'custom', 'cyberpunk', 'coffeecup', 'silk']
  for (const theme of allThemes) {
    it(`emits no JS-style line comment for ${theme} theme`, () => {
      const result = tokensCss(
        ctx({ theme, brandHex: theme === 'custom' ? '#ff6600' : undefined }),
      )
      expect(result).not.toMatch(/(^|\s)\/\//)
    })
  }

  it('uses CSS block comments for the default theme fallback', () => {
    const result = tokensCss(ctx({ theme: 'default' }))
    expect(result).toContain(':where(:root)')
    expect(result).toContain('/*')
  })
})

describe('metadataTs', () => {
  it('keys match getProductNames: full name + alpha/beta/gamma', () => {
    const result = metadataTs(ctx({ name: 'my-tenant', camelName: 'myTenant' }))
    expect(result).toContain("'my-tenant-alpha':")
    expect(result).toContain("'my-tenant-beta':")
    expect(result).toContain("'my-tenant-gamma':")
    expect(result).toContain('title:')
    expect(result).toContain('description:')
    expect(result).toContain("image: 'seedling'")
    expect(result).toContain("image: 'leaf'")
    expect(result).toContain("image: 'tree'")
    expect(result).toContain("imageFamily: 'classic'")
  })

  it('works for single-segment name', () => {
    const result = metadataTs(ctx({ name: 'zen', camelName: 'zen' }))
    expect(result).toContain("'zen-alpha':")
    expect(result).toContain("'zen-beta':")
    expect(result).toContain("'zen-gamma':")
  })

  it('uses camelName for the export name', () => {
    const result = metadataTs(ctx({ name: 'my-cool-shop', camelName: 'myCoolShop' }))
    expect(result).toContain('export const myCoolShopMap')
  })
})
