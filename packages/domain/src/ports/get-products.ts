import type { Product } from '../entities/Product'

export interface GetProductsResponse {
  data: Product[]
  total: number
}

export type GetProductsFn = (config: { baseUrl: string; tenantId: string }) => Promise<GetProductsResponse>
