import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DemoRating from './DemoRating.vue'

describe('DemoRating', () => {
  it('renders basic heading', () => {
    const wrapper = mount(DemoRating)
    expect(wrapper.text()).toContain('Basic')
  })

  it('renders rating with initial value', () => {
    const wrapper = mount(DemoRating)
    const withValue = wrapper.find('fe-rating[value="3"]')
    expect(withValue.exists()).toBe(true)
  })

  it('renders readonly rating', () => {
    const wrapper = mount(DemoRating)
    const readonly = wrapper.find('fe-rating[readonly]')
    expect(readonly.exists()).toBe(true)
  })

  it('renders disabled rating', () => {
    const wrapper = mount(DemoRating)
    const disabled = wrapper.find('fe-rating[disabled]')
    expect(disabled.exists()).toBe(true)
  })

  it('renders rating with different max', () => {
    const wrapper = mount(DemoRating)
    const max3 = wrapper.find('fe-rating[max="3"]')
    expect(max3.exists()).toBe(true)
  })

  it('renders half-star precision heading', () => {
    const wrapper = mount(DemoRating)
    expect(wrapper.text()).toContain('Half-Star Precision')
  })

  it('renders all 5 sizes', () => {
    const wrapper = mount(DemoRating)
    const sizes = ['xs', 's', 'm', 'l', 'xl']
    sizes.forEach(size => {
      expect(wrapper.find(`fe-rating[size="${size}"]`).exists()).toBe(true)
    })
  })
})
