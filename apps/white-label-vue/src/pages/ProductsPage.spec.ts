import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import ProductsPage from './ProductsPage.vue'

import { mockProducts, mockOkResponse } from '../helpers'
import { frameworkMap } from '../../metadata'
import { useProducts } from '../composables/useProducts'

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useProducts().clearCache()
  })

  it('shows loading state while fetching', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    const wrapper = mount(ProductsPage, {
      global: { provide: { metaMap: frameworkMap } },
    })
    // Flush hybridJS + Lit microtasks for WC initialization
    await Promise.resolve()
    await Promise.resolve()

    await vi.waitFor(() => {
      // fe-loader is in shadow DOM, so wrapper.text() won't see it.
      // Check for fe-loader element in the loading slot instead.
      expect(wrapper.find('fe-loader').exists()).toBe(true)
    })
    // During loading, error text is empty (error=undefined → empty interpolation).
    expect(wrapper.find('.products-page__error').text()).toBe('')
    // Grid element exists but has no product cards yet
    expect(wrapper.findAll('fe-card')).toHaveLength(0)
  })

  it('renders product card grid after successful fetch', async () => {
    const apiResponse = { data: mockProducts, total: mockProducts.length }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockOkResponse(apiResponse)),
    )

    const wrapper = mount(ProductsPage, {
      global: { provide: { metaMap: frameworkMap } },
    })

    // Wait for cards to appear (fe-async-content projects default slot)
    await vi.waitFor(() => {
      const cards = wrapper.findAll('fe-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    const cards = wrapper.findAll('fe-card')
    expect(cards).toHaveLength(2)
    expect(wrapper.text()).toContain('Vue')
    expect(wrapper.text()).toContain('React')
    expect(wrapper.text()).toContain('Progressive framework for building UIs')
    expect(wrapper.text()).toContain('Library for building user interfaces')
    expect(wrapper.text()).toContain('Free')
    expect(wrapper.text()).toContain('$29.99')
    expect(wrapper.text()).toContain('$19.99')
    const ratings = wrapper.findAll('fe-rating')
    expect(ratings).toHaveLength(2)
  })

  it('displays error message on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )

    const wrapper = mount(ProductsPage, {
      global: { provide: { metaMap: frameworkMap } },
    })

    // Wait for error TEXT to appear (not just element — element is always present
    // in light DOM, but text updates after fetch resolves)
    await vi.waitFor(() => {
      expect(wrapper.find('.products-page__error').text()).toContain(
        'Failed to fetch',
      )
    })
    expect(wrapper.text()).toContain('Failed to fetch products: HTTP 500')
    // Grid element exists in light DOM but has no product cards
    expect(wrapper.findAll('fe-card')).toHaveLength(0)
  })
})
