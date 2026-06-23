import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import type { FeRatingElement } from '@repo/ui/fe-rating'
import ProductCard from './ProductCard.vue'

describe('ProductCard', () => {
  const baseProps = {
    title: 'Vue',
    description: 'Progressive framework for building UIs',
    image: 'vuejs',
    imageFamily: 'brands',
    price: 'Free',
    rate: 4.5,
  }

  it('renders title via prop', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    expect(wrapper.text()).toContain('Vue')
  })

  it('renders description via prop', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    expect(wrapper.text()).toContain('Progressive framework for building UIs')
  })

  it('renders fe-icon with correct name and family', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    const icon = wrapper.find('fe-icon')
    expect(icon.attributes('name')).toBe('vuejs')
    expect(icon.attributes('family')).toBe('brands')
  })

  it('renders fe-rating with correct value and readonly', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    const ratingEl = wrapper.find('fe-rating').element as FeRatingElement
    expect(ratingEl.value).toBe(4.5)
    expect(ratingEl.readonly).toBe(true)
  })

  it('shows previousPrice with strikethrough when provided', () => {
    const wrapper = mount(ProductCard, {
      props: { ...baseProps, previousPrice: '$99' },
    })
    expect(wrapper.text()).toContain('$99')
    const prevPrice = wrapper.find('.product-card__price--previous')
    expect(prevPrice.exists()).toBe(true)
  })

  it('does NOT show previousPrice when not provided', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    expect(wrapper.find('.product-card__price--previous').exists()).toBe(false)
  })

  it('shows "Free" as default price', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    expect(wrapper.text()).toContain('Free')
  })

  it('shows custom price when provided', () => {
    const wrapper = mount(ProductCard, {
      props: { ...baseProps, price: '$29' },
    })
    expect(wrapper.text()).toContain('$29')
  })
})
