import type { GetProductsFn } from '@repo/domain'

export type { GetProductsResponse } from '@repo/domain'

const buildProductsUrl = (baseUrl: string, tenantId: string): string => `${baseUrl.replace(/\/$/, '')}/${tenantId}/products`

export const getProducts: GetProductsFn = async ({ baseUrl, tenantId }) => {
  const url = buildProductsUrl(baseUrl, tenantId)
  const response = await fetch(url, {
    headers: { 'x-tenant-id': tenantId },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`)
  }
  return response.json()
}
