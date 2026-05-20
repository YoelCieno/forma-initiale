import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getProducts } from './get-products.adapter'

const mockProducts = [
  { id: '1', title: 'Product 1', price: 10.99 },
  { id: '2', title: 'Product 2', price: 24.99 },
]

describe('getProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns products on successful fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      }),
    )

    const result = await getProducts()

    expect(result).toEqual(mockProducts)
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/products')
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

  it('returns empty array when API returns empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      }),
    )

    const result = await getProducts()

    expect(result).toEqual([])
  })
})
