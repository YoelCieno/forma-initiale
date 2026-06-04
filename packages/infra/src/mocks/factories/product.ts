import type { Product } from '@repo/domain'

const FRAMEWORK_NAMES = ['vue', 'angular', 'react', 'svelte', 'solid'] as const
let counter = 0

export function buildProduct(overrides?: Partial<Product>): Product {
  counter++
  return {
    id: `prod-${counter}`,
    name: FRAMEWORK_NAMES[(counter - 1) % FRAMEWORK_NAMES.length],
    previousPrice: parseFloat((29.99 + counter * 10).toFixed(2)),
    price: 0,
    rate: (counter % 5) + 1,
    ...overrides,
  }
}

export function buildProductList(count = 3): Product[] {
  return Array.from({ length: count }, () => buildProduct())
}

export function resetProductCounter(): void {
  counter = 0
}
