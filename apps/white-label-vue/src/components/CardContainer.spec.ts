import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CardContainer from './CardContainer.vue'

describe('CardContainer', () => {
  it('renders default card', () => {
    const wrapper = mount(CardContainer)
    expect(wrapper.text()).toContain('default card')
  })

  it('renders all 3 appearances', () => {
    const wrapper = mount(CardContainer)
    expect(wrapper.text()).toContain('Outlined (default)')
    expect(wrapper.text()).toContain('Filled')
    expect(wrapper.text()).toContain('Accent')
  })

  it('renders card with header slot', () => {
    const wrapper = mount(CardContainer)
    expect(wrapper.text()).toContain('Card Title')
  })

  it('renders horizontal card', () => {
		const wrapper = mount(CardContainer)
		// If orientation="horizontal" in fe-card
    expect(wrapper.text()).toContain('Horizontal card')
  })
})
