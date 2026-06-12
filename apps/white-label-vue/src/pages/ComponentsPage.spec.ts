import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentsPage from './ComponentsPage.vue'

describe('ComponentsPage', () => {
  it('renders all section headings', () => {
    const wrapper = mount(ComponentsPage)
    expect(wrapper.text()).toContain('Button')
    expect(wrapper.text()).toContain('Icon')
    expect(wrapper.text()).toContain('Rating')
    expect(wrapper.text()).toContain('Card')
  })

  it('renders all child container components', () => {
    const wrapper = mount(ComponentsPage)
    expect(wrapper.findComponent({ name: 'ButtonContainer' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'IconContainer' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'RatingContainer' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'CardContainer' }).exists()).toBe(true)
  })

  it('has correct root BEM CSS class', () => {
    const wrapper = mount(ComponentsPage)
    expect(wrapper.classes()).toContain('components-page')
  })
})
