import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from './ProductCard.vue'
import { ProductView } from '@repo/presenters'

describe('ProductCard', () => {
  const baseProps = {
    title: 'test title',
    description: 'test description',
    image: 'plant',
    imageFamily: 'classic',
    price: 'Free',
    rate: 4.2,
    id: 'test-1',
  }

  it('renders title from prop', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    expect(wrapper.text()).toContain('test title')
  })

  it('renders description from prop', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    expect(wrapper.text()).toContain('test description')
  })

  it('renders fe-rating with correct value', () => {
    const wrapper = mount(ProductCard, { props: baseProps })
    const rating = wrapper.find('fe-rating')
    expect(rating.attributes('value')).toBe('4.2')
    expect(rating.attributes('readonly')).toBeDefined()
  })

  it('shows price when provided', () => {
    const wrapper = mount(ProductCard, {
      props: { ...baseProps, price: '$12.99' },
    })
    expect(wrapper.text()).toContain('$12.99')
  })

  it('shows "Free" when no price provided (default)', () => {
    const wrapper = mount(ProductCard, {
      props: {
        title: 'test title',
        description: 'test description',
        image: 'plant',
        imageFamily: 'classic',
        rate: 4.2,
        id: 'test-1',
      } as Omit<ProductView, 'name' & 'price'>,
    })
    expect(wrapper.text()).toContain('Free')
  })

  it('renders fe-img element', () => {
    const wrapper = mount(ProductCard, {
      props: { ...baseProps, id: 'test-1' },
    })
    const feImg = wrapper.find('fe-img')
    expect(feImg.exists()).toBe(true)
    expect(feImg.element).toBeDefined()
  })

  it('uses id prop as image cache-key', () => {
    const wrapper = mount(ProductCard, {
      props: { ...baseProps, id: 'abc-123' },
    })
    const feImg = wrapper.find('fe-img')
    expect(feImg.attributes('cache-key')).toBe('abc-123')
  })
})
