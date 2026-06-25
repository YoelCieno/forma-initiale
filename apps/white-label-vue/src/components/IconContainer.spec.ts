import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconContainer from './IconContainer.vue'

describe('IconContainer', () => {
  it('renders basic icons section', () => {
    const wrapper = mount(IconContainer)
    expect(wrapper.text()).toContain('Basic Icons')
    expect(wrapper.find('fe-icon[name="check"]').exists()).toBe(true)
    expect(wrapper.find('fe-icon[name="star"]').exists()).toBe(true)
    expect(wrapper.find('fe-icon[name="heart"]').exists()).toBe(true)
  })

  it('renders animation variants', () => {
    const wrapper = mount(IconContainer)
    expect(wrapper.text()).toContain('Animations')
    expect(wrapper.find('fe-icon[animation="spin"]').exists()).toBe(true)
    expect(wrapper.find('fe-icon[animation="pulse"]').exists()).toBe(true)
    expect(wrapper.find('fe-icon[animation="bounce"]').exists()).toBe(true)
  })

  it('renders size variants', () => {
    const wrapper = mount(IconContainer)
    expect(wrapper.text()).toContain('Sizes')
    const rocketIcons = wrapper.findAll('fe-icon[name="rocket"]')
    expect(rocketIcons).toHaveLength(6)
  })
})