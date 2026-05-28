import type { Product } from '@repo/domain'

let counter = 0

export function buildProduct(overrides?: Partial<Product>): Product {
  counter++
  return {
    id: `prod-${counter}`,
    title: `Product ${counter}`,
    price: parseFloat((9.99 + counter * 10).toFixed(2)),
    ...overrides,
  }
}

export function buildProductList(count = 3): Product[] {
  return Array.from({ length: count }, () => buildProduct())
}

export function resetProductCounter(): void {
  counter = 0
}
