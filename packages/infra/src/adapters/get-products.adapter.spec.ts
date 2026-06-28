import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getProducts } from './get-products.adapter'

const mockProducts = [
  { id: '1', name: 'Product 1', previousPrice: 20.99, price: 10.99, rate: 4 },
  { id: '2', name: 'Product 2', previousPrice: 34.99, price: 24.99, rate: 5 },
]

import { mockOkResponse } from '../mocks/helpers'

describe('getProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns products on successful fetch', async () => {
    const apiResponse = { data: mockProducts, total: mockProducts.length }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(apiResponse)))

    const result = await getProducts()

    expect(result).toEqual(apiResponse)
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/products', {
      headers: { 'x-tenant-id': 'wl' },
    })
  })

  it('throws on non-ok response (HTTP 500)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )

    await expect(getProducts()).rejects.toThrow(
      'Failed to fetch products: HTTP 500',
    )
  })

  it('throws on HTTP 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    )

    await expect(getProducts()).rejects.toThrow(
      'Failed to fetch products: HTTP 404',
    )
  })

  it('throws on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network failure')),
    )

    await expect(getProducts()).rejects.toThrow('Network failure')
  })

  it('returns empty result when API returns empty', async () => {
    const apiResponse = { data: [], total: 0 }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(apiResponse)))

    const result = await getProducts()

    expect(result).toEqual(apiResponse)
  })

  it('sends x-tenant-id header from VITE_TENANT_ID env var', async () => {
    const apiResponse = { data: mockProducts, total: mockProducts.length }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(apiResponse)));

    // Simulate a non-default tenant ID
    (import.meta.env as { VITE_TENANT_ID: string }).VITE_TENANT_ID = 'fp'
    const result = await getProducts()

    expect(result).toEqual(apiResponse)
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/products', {
      headers: { 'x-tenant-id': 'fp' },
    })
  })
})
