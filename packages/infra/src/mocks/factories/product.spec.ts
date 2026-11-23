import { describe, expect, it, beforeEach } from 'vitest'
import {
  buildProduct,
  buildProductList,
  resetProductCounter,
} from './product'

describe('product factory', () => {
  beforeEach(() => {
    resetProductCounter()
  })

  describe('buildProduct', () => {
    it('builds a product with default tenant (wl) shape', () => {
      const product = buildProduct('wl')
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('previousPrice')
      expect(product).toHaveProperty('price')
      expect(product).toHaveProperty('rate')
    })

    it('wl tenant: price is 0, previousPrice > 0', () => {
      const products = Array.from({ length: 5 }, () => buildProduct('wl'))
      for (const p of products) {
        expect(p.price).toBe(0)
        expect(p.previousPrice).toBeGreaterThan(0)
      }
    })

    it('wl tenant: rate cycles 1-5', () => {
      resetProductCounter()
      // (counter % 5) + 1 where counter is 1..n after increment
      // counter=1 → (1%5)+1=2, counter=2 → 3, ..., counter=5 → (5%5)+1=1
      const expectedSequence = [2, 3, 4, 5, 1]
      for (const expected of expectedSequence) {
        const p = buildProduct('wl')
        expect(p.rate).toBe(expected)
      }
    })

    it('fpv tenant: price > 0, previousPrice is 0', () => {
      const product = buildProduct('fpv')
      expect(product.price).toBeGreaterThan(0)
      expect(product.previousPrice).toBe(0)
    })

    it('fpv tenant: rate is 1-5 (random)', () => {
      const products = Array.from({ length: 50 }, () => buildProduct('fpv'))
      for (const p of products) {
        expect(p.rate).toBeGreaterThanOrEqual(1)
        expect(p.rate).toBeLessThanOrEqual(5)
      }
    })

    it('fpv tenant: price increments with counter', () => {
      resetProductCounter()
      const p1 = buildProduct('fpv')
      const p2 = buildProduct('fpv')
      // counter 1: 9.99 + 1*10 = 19.99
      // counter 2: 9.99 + 2*10 = 29.99
      expect(p1.price).toBe(19.99)
      expect(p2.price).toBe(29.99)
    })

    it('wl tenant: previousPrice increments with counter', () => {
      resetProductCounter()
      const p1 = buildProduct('wl')
      const p2 = buildProduct('wl')
      // counter 1: 29.99 + 1*10 = 39.99
      // counter 2: 29.99 + 2*10 = 49.99
      expect(p1.previousPrice).toBe(39.99)
      expect(p2.previousPrice).toBe(49.99)
    })

    it('overrides are applied', () => {
      const product = buildProduct('wl', { name: 'override-name', price: 999 })
      expect(product.name).toBe('override-name')
      expect(product.price).toBe(999)
    })
  })

  describe('buildProductList', () => {
    it('returns correct count with wl tenant', () => {
      const products = buildProductList('wl')
      expect(products).toHaveLength(5)
    })

    it('returns correct count with fpv tenant', () => {
      const products = buildProductList('fpv')
      expect(products).toHaveLength(7)
    })

    it('all products in list have correct shape for wl', () => {
      const products = buildProductList('wl')
      for (const p of products) {
        expect(p.price).toBe(0)
        expect(p.previousPrice).toBeGreaterThan(0)
      }
    })

    it('all products in list have correct shape for fpv', () => {
      const products = buildProductList('fpv')
      for (const p of products) {
        expect(p.price).toBeGreaterThan(0)
        expect(p.previousPrice).toBe(0)
      }
    })
  })

  describe('resetProductCounter', () => {
    it('resets counter affecting id sequence', () => {
      const p1 = buildProduct('wl')
      expect(p1.id).toBe('prod-1')
      resetProductCounter()
      const p2 = buildProduct('wl')
      expect(p2.id).toBe('prod-1')
    })
  })
})
