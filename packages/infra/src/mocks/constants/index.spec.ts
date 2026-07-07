import { describe, expect, it } from 'vitest'
import {
  FRAMEWORK_NAMES,
  FAKE_PLANTS_NAMES,
  PRODUCT_TENANT_CONFIGS,
} from './'
import type { PriceConfig } from './'

describe('mocked-data', () => {
  describe('FRAMEWORK_NAMES', () => {
    it('exports the expected framework names', () => {
      expect(FRAMEWORK_NAMES).toEqual([
        'react',
        'angular',
        'vue',
        'svelte',
        'solid',
      ])
    })

    it('is a readonly tuple', () => {
      expect(FRAMEWORK_NAMES.length).toBe(5)
      expect(FRAMEWORK_NAMES[0]).toBe('react')
    })
  })

  describe('FAKE_PLANTS_NAMES', () => {
    it('exports the expected plant names', () => {
      expect(FAKE_PLANTS_NAMES).toEqual([
        'light-bearer',
        'misty-biter',
        'silent-trumpet',
        'dancing-box',
        'little-shade',
        'crimson-veil',
        'ember-leaf',
      ])
    })

    it('is a readonly tuple', () => {
      expect(FAKE_PLANTS_NAMES.length).toBe(7)
      expect(FAKE_PLANTS_NAMES[0]).toBe('light-bearer')
    })
  })

  describe('PRODUCT_TENANT_CONFIGS', () => {
    it('exports config for wl tenant', () => {
      const wl = PRODUCT_TENANT_CONFIGS.wl
      expect(wl).toBeDefined()
      expect(wl.names).toEqual(FRAMEWORK_NAMES)
      expect(wl.price).toBeUndefined()
      expect(wl.previousPrice).toEqual({
        base: 29.99,
        increment: 10,
      } satisfies PriceConfig)
      expect(wl.rateType).toBe('cyclic')
    })

    it('exports config for fp tenant', () => {
      const fp = PRODUCT_TENANT_CONFIGS.fp
      expect(fp).toBeDefined()
      expect(fp.names).toEqual(FAKE_PLANTS_NAMES)
      expect(fp.price).toEqual({
        base: 9.99,
        increment: 10,
      } satisfies PriceConfig)
      expect(fp.previousPrice).toBeUndefined()
      expect(fp.rateType).toBe('random')
    })

    it('config object is frozen / immutable', () => {
      expect(Object.isFrozen(PRODUCT_TENANT_CONFIGS)).toBe(true)
    })

    it('contains wl and fp tenants', () => {
      expect(Object.keys(PRODUCT_TENANT_CONFIGS)).toContain('wl')
      expect(Object.keys(PRODUCT_TENANT_CONFIGS)).toContain('fp')
    })
  })
})
