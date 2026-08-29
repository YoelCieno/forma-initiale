import type { Product } from '@repo/domain'

export interface GetProductsResponse {
  data: Product[]
  total: number
}

const readEnvString = (key: string): string | undefined => {
  const value = Reflect.get(import.meta.env, key)
  return typeof value === 'string' ? value : undefined
}

export async function getProducts(): Promise<GetProductsResponse> {
  const baseUrl = readEnvString('VITE_API_URL')
  const tenantId = readEnvString('VITE_TENANT_ID') ?? 'wl'

	const response = await fetch(`${baseUrl}/products`, {
    headers: { 'x-tenant-id': String(tenantId) },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`)
  }

  return response.json()
}
