import type { Product } from '@repo/domain'

export class GetProductsAdapter {
  async execute(): Promise<Product[]> {
    const response = await fetch('https://api.example.com/products')
    if (!response.ok) {
      throw new Error(`Failed to fetch products: HTTP ${response.status}`)
    }
    return response.json() as Promise<Product[]>
  }
}
