import { describe, it, expect } from 'vitest'
import type { Product } from '@repo/domain'
import { toProductView, toProductViewList } from './product.presenter'

const vueProduct: Product = {
  id: '1',
  name: 'vue',
  previousPrice: 100,
  price: 80,
  rate: 4.5,
}

const angularProduct: Product = {
  id: '2',
  name: 'angular',
  previousPrice: 200,
  price: 150,
  rate: 4.2,
}

const reactProduct: Product = {
  id: '3',
  name: 'react',
  previousPrice: 90,
  price: 70,
  rate: 4.8,
}

const svelteProduct: Product = {
  id: '4',
  name: 'svelte',
  previousPrice: 80,
  price: 60,
  rate: 4.6,
}

const solidProduct: Product = {
  id: '5',
  name: 'solid',
  previousPrice: 70,
  price: 50,
  rate: 4.0,
}

const unknownProduct: Product = {
  id: '6',
  name: 'Unknown',
  previousPrice: 50,
  price: 40,
  rate: 3.0,
}

const edgeZeroRateProduct: Product = {
  id: '7',
  name: 'vue',
  previousPrice: 100,
  price: 80,
  rate: 0,
}

const edgeHighPriceProduct: Product = {
  id: '8',
  name: 'angular',
  previousPrice: 999999,
  price: 800000,
  rate: 4.0,
}

describe('toProductView', () => {
  it('maps Vue.js product to correct presenter', () => {
    const result = toProductView(vueProduct)

    expect(result.title).toBe('Vue')
    expect(result.description).toBe('Progressive framework for building UIs')
    expect(result.logo).toBe('vuejs')
    expect(result.logoFamily).toBe('brands')
    expect(result.rate).toBe(4.5)
  })

  it('maps Angular product to correct presenter', () => {
    const result = toProductView(angularProduct)

    expect(result.title).toBe('Angular')
    expect(result.description).toBe('Platform for building mobile & desktop web apps')
    expect(result.logo).toBe('angular')
  })

  it('maps React product to correct presenter', () => {
    const result = toProductView(reactProduct)

    expect(result.title).toBe('React')
    expect(result.description).toBe('Library for building user interfaces')
    expect(result.logo).toBe('react')
  })

  it('maps Svelte product to correct presenter', () => {
    const result = toProductView(svelteProduct)

    expect(result.title).toBe('Svelte')
    expect(result.description).toBe('Cybernetically enhanced web apps')
    expect(result.logo).toBe('svelte')
  })

  it('maps Solid product to correct presenter', () => {
    const result = toProductView(solidProduct)

    expect(result.title).toBe('Solid')
    expect(result.description).toBe('Reactive UI library')
    expect(result.logo).toBe('code')
    expect(result.logoFamily).toBe('classic')
  })

  it('maps unknown product to fallback defaults', () => {
    const result = toProductView(unknownProduct)

    expect(result.title).toBe('Unknown')
    expect(result.description).toBe('')
    expect(result.logo).toBe('code')
    expect(result.logoFamily).toBe('classic')
  })

  it('passes id through as name', () => {
    const result = toProductView(vueProduct)

    expect(result.name).toBe('vue')
  })

  it('passes previousPrice through unchanged', () => {
    const result = toProductView(vueProduct)

    expect(result.previousPrice).toBe(100)
  })

  it('passes price through unchanged', () => {
    const result = toProductView(vueProduct)

    expect(result.price).toBe(80)
  })

  it('passes rate through unchanged', () => {
    const result = toProductView(vueProduct)

    expect(result.rate).toBe(4.5)
  })

  it('handles rate of 0', () => {
    const result = toProductView(edgeZeroRateProduct)

    expect(result.rate).toBe(0)
    expect(result.title).toBe('Vue')
    expect(result.description).toBe('Progressive framework for building UIs')
    expect(result.logo).toBe('vuejs')
  })

  it('handles very high previousPrice', () => {
    const result = toProductView(edgeHighPriceProduct)

    expect(result.previousPrice).toBe(999999)
    expect(result.price).toBe(800000)
    expect(result.title).toBe('Angular')
    expect(result.description).toBe('Platform for building mobile & desktop web apps')
  })
})

describe('toProductViewList', () => {
  it('maps array of products to presenters', () => {
    const products = [vueProduct, angularProduct, unknownProduct]
    const results = toProductViewList(products)

    expect(results).toHaveLength(3)
    expect(results[0].title).toBe('Vue')
    expect(results[1].title).toBe('Angular')
    expect(results[2].title).toBe('Unknown')
    expect(results[2].logo).toBe('code')
  })

  it('returns empty array for empty input', () => {
    const results = toProductViewList([])

    expect(results).toEqual([])
  })

  it('preserves all numeric fields through list mapping', () => {
    const products = [vueProduct, angularProduct]
    const results = toProductViewList(products)

    results.forEach((p, i) => {
      expect(p.name).toBe(products[i].name)
      expect(p.previousPrice).toBe(products[i].previousPrice)
      expect(p.price).toBe(products[i].price)
      expect(p.rate).toBe(products[i].rate)
    })
  })
})
