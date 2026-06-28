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
  it.each([
    ['vue', 'vue'],
    ['angular', 'angular'],
    ['react', 'react'],
    ['svelte', 'svelte'],
    ['solid', 'solid'],
  ])('uses product name %s as fallback title without metaMap', (name, expected) => {
    const result = toProductView({ id: '1', name, previousPrice: 100, price: 80, rate: 4 })

    expect(result.title).toBe(expected)
    expect(result.description).toBe('')
    expect(result.image).toBe('code')
  })

  it('handles kebab-case product names', () => {
    const result = toProductView({ id: '9', name: 'crimson-veil', previousPrice: 15, price: 12, rate: 3.5 })

    expect(result.title).toBe('crimson-veil')
    expect(result.image).toBe('code')
  })

  it('maps unknown product to fallback defaults', () => {
    const result = toProductView(unknownProduct)

    expect(result.title).toBe('Unknown')
    expect(result.description).toBe('')
    expect(result.image).toBe('code')
    expect(result.imageFamily).toBe('classic')
  })

  it('formats previousPrice with currency prefix', () => {
    const result = toProductView(vueProduct)

    expect(result.previousPrice).toBe('$100')
  })

  it('formats price with currency prefix', () => {
    const result = toProductView(vueProduct)

    expect(result.price).toBe('$80')
  })

  it('passes rate through unchanged', () => {
    const result = toProductView(vueProduct)

    expect(result.rate).toBe(4.5)
  })

  it('handles rate of 0', () => {
    const result = toProductView(edgeZeroRateProduct)

    expect(result.rate).toBe(0)
    expect(result.title).toBe('vue')
    expect(result.description).toBe('')
    expect(result.image).toBe('code')
  })

  it('handles very high previousPrice', () => {
    const result = toProductView(edgeHighPriceProduct)

    expect(result.previousPrice).toBe('$999999')
    expect(result.price).toBe('$800000')
    expect(result.title).toBe('angular')
    expect(result.description).toBe('')
  })
})

describe('toProductViewList', () => {
  it('maps array of products to presenters with fallback titles', () => {
    const products = [vueProduct, angularProduct, unknownProduct]
    const results = toProductViewList(products)

    expect(results).toHaveLength(3)
    expect(results[0].title).toBe('vue')
    expect(results[1].title).toBe('angular')
    expect(results[2].title).toBe('Unknown')
    expect(results[2].image).toBe('code')
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
      expect(p.previousPrice).toBe(`$${products[i].previousPrice}`)
      expect(p.price).toBe(`$${products[i].price}`)
      expect(p.rate).toBe(products[i].rate)
    })
  })


  it('passes metaMap through to each product via toProductViewList', () => {
    const metaMap = {
      vue: { title: 'Custom Vue', description: 'Custom desc', image: 'plant', imageFamily: 'classic' },
    }
    const products = [vueProduct, angularProduct]
    const results = toProductViewList(products, metaMap)

    expect(results[0].title).toBe('Custom Vue')
    expect(results[0].image).toBe('plant')
    // angular not in metaMap so falls back to generic defaults
    expect(results[1].title).toBe('angular')
    expect(results[1].image).toBe('code')
  })
})

describe('toProductView with metaMap', () => {
  it('uses metaMap to override default fallback values', () => {
    const metaMap = {
      vue: { title: 'Custom Vue', description: 'Custom desc', image: 'plant', imageFamily: 'awesome' },
    }
    const result = toProductView(vueProduct, metaMap)

    expect(result.title).toBe('Custom Vue')
    expect(result.description).toBe('Custom desc')
    expect(result.image).toBe('plant')
    expect(result.imageFamily).toBe('awesome')
    // non-meta fields preserved
    expect(result.name).toBe('vue')
    expect(result.price).toBe('$80')
    expect(result.rate).toBe(4.5)
  })

  it('falls back to generic defaults when name not in metaMap', () => {
    const metaMap = {
      'non-existent': { title: 'Nope', description: 'Nope', image: 'nope', imageFamily: 'nope' },
    }
    const result = toProductView(vueProduct, metaMap)

    expect(result.title).toBe('vue')
    expect(result.description).toBe('')
    expect(result.image).toBe('code')
    expect(result.imageFamily).toBe('classic')
  })

  it('falls back to generic defaults when metaMap is undefined', () => {
    const result = toProductView(vueProduct, undefined)

    expect(result.title).toBe('vue')
    expect(result.description).toBe('')
    expect(result.image).toBe('code')
    expect(result.imageFamily).toBe('classic')
  })
})
