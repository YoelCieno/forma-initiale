import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DemoCard from './DemoCard.vue'

describe('DemoCard', () => {
  it('renders default card', () => {
    const wrapper = mount(DemoCard)
    expect(wrapper.text()).toContain('default card')
  })

  it('renders all 3 appearances', () => {
    const wrapper = mount(DemoCard)
    expect(wrapper.text()).toContain('Outlined (default)')
    expect(wrapper.text()).toContain('Filled')
    expect(wrapper.text()).toContain('Accent')
  })

  it('renders card with header slot', () => {
    const wrapper = mount(DemoCard)
    expect(wrapper.text()).toContain('Card Title')
  })

  it('renders horizontal card', () => {
    const wrapper = mount(DemoCard)
    expect(wrapper.text()).toContain('Horizontal card')
  })
})
