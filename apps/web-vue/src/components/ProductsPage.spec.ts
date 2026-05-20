import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import ProductsPage from './ProductsPage.vue'

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state while fetching', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    const wrapper = mount(ProductsPage)

    expect(wrapper.text()).toContain('Loading...')
    expect(wrapper.find('.error').exists()).toBe(false)
    // ul has v-else on error v-if, so it renders when no error (even while loading)
    // but li count is 0 since products is empty
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('renders product list after successful fetch', async () => {
    const products = [
      { id: '1', title: 'Alpha', price: 10 },
      { id: '2', title: 'Beta', price: 20.5 },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(products),
      }),
    )

    const wrapper = mount(ProductsPage)

    await vi.waitFor(() => {
      expect(wrapper.text()).not.toContain('Loading...')
    })
    expect(wrapper.text()).toContain('Alpha')
    expect(wrapper.text()).toContain('$10')
    expect(wrapper.text()).toContain('Beta')
    expect(wrapper.text()).toContain('$20.5')
    expect(wrapper.findAll('li')).toHaveLength(2)
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
      expect(wrapper.find('.error').exists()).toBe(true)
    })
    expect(wrapper.text()).toContain('Failed to fetch products: HTTP 500')
    expect(wrapper.find('ul').exists()).toBe(false)
  })
})
