import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import { mockProducts, mockOkResponse } from '../helpers'

describe('useProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function createTestHarness() {
    return defineComponent({
      setup() {
        return useProducts()
      },
      template: '<div></div>',
    })
  }

  it('starts with loading true, empty products, no error', () => {
    // Never-resolving fetch keeps loading=true
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    const wrapper = mount(createTestHarness())

    expect(wrapper.vm.loading).toBe(true)
    expect(wrapper.vm.products).toEqual([])
    expect(wrapper.vm.error).toBeUndefined()
  })

  it('sets products after successful fetch', async () => {
    const apiResponse = { data: mockProducts, total: mockProducts.length }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(apiResponse)))

    const wrapper = mount(createTestHarness())

    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    expect(wrapper.vm.products).toHaveLength(2)
    expect(wrapper.vm.products[0].title).toBe('Vue')
    expect(wrapper.vm.products[0].name).toBe('vue')
    expect(wrapper.vm.error).toBeUndefined()
  })

  it('sets error message on HTTP failure with status code 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )

    const wrapper = mount(createTestHarness())

    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    expect(wrapper.vm.products).toEqual([])
    expect(wrapper.vm.error).toBe('Failed to fetch products: HTTP 500')
  })

  it('handles non-Error thrown values gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('string error'))

    const wrapper = mount(createTestHarness())

    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    expect(wrapper.vm.products).toEqual([])
    expect(wrapper.vm.error).toBe('Failed to load products')
  })

  it('fetch can be called manually after mount', async () => {
    const apiResponse = { data: mockProducts, total: mockProducts.length }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(apiResponse)))

    const wrapper = mount(createTestHarness())

    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })

    // Second call with new data
    const newProducts = [
      { id: '3', name: 'svelte', previousPrice: 0, price: 0, rate: 5 },
    ]
    const newApiResponse = { data: newProducts, total: 1 }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(newApiResponse)))

    wrapper.vm.fetch()
    await vi.waitFor(() => {
      expect(wrapper.vm.products).toHaveLength(1)
      expect(wrapper.vm.products[0].title).toBe('Svelte')
    })
  })
})
