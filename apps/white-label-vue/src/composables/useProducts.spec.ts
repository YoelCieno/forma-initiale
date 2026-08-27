import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import { getProducts } from '@repo/infra'
import { mockProducts } from '../helpers'
import { useProducts } from './useProducts'

// Mock @repo/infra to control getProducts directly
vi.mock('@repo/infra', () => ({
  getProducts: vi.fn(),
}))

function createTestHarness() {
  return defineComponent({
    setup() {
      return useProducts()
    },
    template: '<div></div>',
  })
}

describe('useProducts (cached)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useProducts().clearCache()
  })

  it('returns expected API shape', async () => {
    vi.mocked(getProducts).mockResolvedValue({ data: [], total: 0 })

    const wrapper = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })

    expect(wrapper.vm).toHaveProperty('products')
    expect(Array.isArray(wrapper.vm.products)).toBe(true)
    expect(wrapper.vm).toHaveProperty('loading')
    expect(typeof wrapper.vm.loading).toBe('boolean')
    expect(wrapper.vm).toHaveProperty('error')
    expect(wrapper.vm).toHaveProperty('fetch')
    expect(typeof wrapper.vm.fetch).toBe('function')
  })

  it('fetches products on mount', async () => {
    vi.mocked(getProducts).mockResolvedValue({ data: mockProducts, total: 2 })

    const wrapper = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })

    expect(getProducts).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.products).toHaveLength(2)
    expect(wrapper.vm.products[0].name).toBe('vue')
  })

  it('returns cached data across component mounts — no second fetch', async () => {
    vi.mocked(getProducts).mockResolvedValue({ data: mockProducts, total: 2 })

    // First mount
    const wrapper1 = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper1.vm.loading).toBe(false)
    })
    expect(getProducts).toHaveBeenCalledTimes(1)
    const products1 = wrapper1.vm.products
    wrapper1.unmount()

    // Second mount — should hit cache, not call getProducts again
    const wrapper2 = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper2.vm.loading).toBe(false)
    })

    // getProducts should NOT have been called again
    expect(getProducts).toHaveBeenCalledTimes(1)
    expect(wrapper2.vm.products).toEqual(products1)
  })

  it('fetch() forces re-fetch bypassing cache', async () => {
    vi.mocked(getProducts).mockResolvedValue({ data: mockProducts, total: 2 })

    const wrapper = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    expect(getProducts).toHaveBeenCalledTimes(1)

    // fetch() should bypass cache and call getProducts again
    wrapper.vm.fetch({ bypass: true })
    await vi.waitFor(() => {
      expect(getProducts).toHaveBeenCalledTimes(2)
    })
  })

  it('loading starts true, becomes false after resolve', async () => {
    // Use a delayed promise so we can check loading state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolvePromise!: (value: any) => void
    vi.mocked(getProducts).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )

    const wrapper = mount(createTestHarness())

    // Initially loading
    expect(wrapper.vm.loading).toBe(true)
    expect(wrapper.vm.products).toEqual([])
    expect(wrapper.vm.error).toBeUndefined()

    // Resolve the promise
    resolvePromise({ data: mockProducts, total: 2 })
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })

    expect(wrapper.vm.products).toHaveLength(2)
    expect(wrapper.vm.error).toBeUndefined()
  })

  it('sets error on rejection', async () => {
    vi.mocked(getProducts).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })

    expect(wrapper.vm.products).toEqual([])
    expect(wrapper.vm.error).toBe('Network error')
  })

  it('handles non-Error rejection gracefully', async () => {
    vi.mocked(getProducts).mockRejectedValue('string error')

    const wrapper = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })

    expect(wrapper.vm.products).toEqual([])
    expect(wrapper.vm.error).toBe('Failed to load products')
  })

  it('returns same data reference from cache on re-mount', async () => {
    vi.mocked(getProducts).mockResolvedValue({ data: mockProducts, total: 2 })

    const wrapper1 = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper1.vm.loading).toBe(false)
    })

    const products1 = wrapper1.vm.products
    wrapper1.unmount()

    // Re-mount — cached data should be the SAME array reference
    const wrapper2 = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper2.vm.loading).toBe(false)
    })

    expect(wrapper2.vm.products).toBe(products1)
  })
})
