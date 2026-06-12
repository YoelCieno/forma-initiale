import type { Product } from '@repo/domain'

export const mockProducts: Product[] = [
  { id: '1', name: 'vue', previousPrice: 29.99, price: 0, rate: 4 },
  { id: '2', name: 'react', previousPrice: 19.99, price: 0, rate: 5 },
]

export function mockOkResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) }
}
