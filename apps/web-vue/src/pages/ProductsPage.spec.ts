import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import ProductsPage from './ProductsPage.vue'

const mockProducts = [
  { id: '1', name: 'vue', previousPrice: 29.99, price: 0, rate: 4 },
  { id: '2', name: 'react', previousPrice: 19.99, price: 0, rate: 5 },
]

function mockOkResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) }
}

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state while fetching', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    const wrapper = mount(ProductsPage)

    expect(wrapper.text()).toContain('Loading...')
    expect(wrapper.find('.products-page__error').exists()).toBe(false)
    expect(wrapper.find('.products-page__grid').exists()).toBe(false)
  })

  it('renders product card grid after successful fetch', async () => {
    const apiResponse = { data: mockProducts, total: mockProducts.length }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(apiResponse)))

    const wrapper = mount(ProductsPage)

    await vi.waitFor(() => {
      expect(wrapper.text()).not.toContain('Loading...')
    })

    expect(wrapper.find('.products-page__grid').exists()).toBe(true)
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

    const wrapper = mount(ProductsPage)

    await vi.waitFor(() => {
      expect(wrapper.find('.products-page__error').exists()).toBe(true)
    })
    expect(wrapper.text()).toContain('Failed to fetch products: HTTP 500')
    expect(wrapper.find('.products-page__grid').exists()).toBe(false)
  })
})
