import { describe, it, expect } from 'vitest'
import { addTenantConfig } from './add-tenant'

describe('addTenantConfig', () => {
  const existingConfigs = {
    wl: {
      names: ['react', 'angular', 'vue', 'svelte', 'solid'],
      price: { base: 29.99, increment: 10 },
      rateType: 'cyclic' as const,
    },
    fp: {
      names: [
        'light-bearer',
        'misty-biter',
        'silent-trumpet',
        'dancing-box',
        'little-shade',
        'crimson-veil',
        'ember-leaf',
      ],
      price: { base: 9.99, increment: 10 },
      rateType: 'random' as const,
    },
  }

  it('adds new tenant entry', () => {
    const result = addTenantConfig(existingConfigs, 'test', ['alpha', 'beta'])

    expect(result).toHaveProperty('wl')
    expect(result).toHaveProperty('fp')
    expect(result).toHaveProperty('test')
    expect(result.test).toEqual({
      names: ['alpha', 'beta'],
      price: { base: 9.99, increment: 10 },
      rateType: 'random',
    })
  })

  it('throws on duplicate prefix', () => {
    expect(() => addTenantConfig(existingConfigs, 'wl', [])).toThrow(
      'Tenant "wl" already exists',
    )
  })

  it('does not mutate original configs object', () => {
    const originalKeys = Object.keys(existingConfigs)
    const originalWl = { ...existingConfigs.wl }

    addTenantConfig(existingConfigs, 'new-tenant', ['x'])

    expect(Object.keys(existingConfigs)).toEqual(originalKeys)
    expect(existingConfigs.wl).toEqual(originalWl)
  })

  it('preserves names array as-is', () => {
    const names = ['hello', 'world']
    const result = addTenantConfig(
      existingConfigs,
      'test-names',
      names,
    )

    expect(result['test-names']!.names).toEqual([
      'hello',
      'world',
    ])
    expect(
      result['test-names']!.names,
    ).not.toBe(names)
  })

  it('sets correct default price and rateType', () => {
    const result = addTenantConfig(
      existingConfigs,
      'defaults',
      ['a'],
    )

    expect(result.defaults).toHaveProperty('price')
    expect(result.defaults!.price).toEqual({ base: 9.99, increment: 10 })
    expect(result.defaults!.rateType).toBe('random')
  })
})
