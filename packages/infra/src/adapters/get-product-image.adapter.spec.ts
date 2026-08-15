import { describe, it, expect } from 'vitest'
import { getProductImageUrl } from './get-product-image.adapter'

describe('getProductImageUrl', () => {
  it('returns deterministic URL for same product ID', () => {
    const url1 = getProductImageUrl('abc-123')
    const url2 = getProductImageUrl('abc-123')
    expect(url1).toBe(url2)
  })

  it('returns different URL for different product IDs', () => {
    const url1 = getProductImageUrl('abc-123')
    const url2 = getProductImageUrl('xyz-789')
    expect(url1).not.toBe(url2)
  })

  it('URL contains seed parameter', () => {
    const url = getProductImageUrl('test-id')
    expect(url).toContain('seed=')
  })

  it('URL is derived deterministically (not random)', () => {
    const result1 = getProductImageUrl('product-1')
    const result2 = getProductImageUrl('product-1')
    expect(result1).toBe(result2)
  })
})
