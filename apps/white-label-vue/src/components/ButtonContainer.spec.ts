import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonContainer from './ButtonContainer.vue'

describe('ButtonContainer', () => {
  it('renders all variant buttons', () => {
    const wrapper = mount(ButtonContainer)
    expect(wrapper.text()).toContain('Neutral')
    expect(wrapper.text()).toContain('Brand')
    expect(wrapper.text()).toContain('Success')
    expect(wrapper.text()).toContain('Warning')
    expect(wrapper.text()).toContain('Danger')
  })

  it('renders all size variants', () => {
    const wrapper = mount(ButtonContainer)
    expect(wrapper.text()).toContain('XS')
    expect(wrapper.text()).toContain('S')
    expect(wrapper.text()).toContain('M')
    expect(wrapper.text()).toContain('L')
    expect(wrapper.text()).toContain('XL')
  })

  it('renders all appearance variants', () => {
    const wrapper = mount(ButtonContainer)
    expect(wrapper.text()).toContain('Accent')
    expect(wrapper.text()).toContain('Filled')
    expect(wrapper.text()).toContain('Outlined')
    expect(wrapper.text()).toContain('Plain')
  })

  it('renders states in their section', () => {
    const wrapper = mount(ButtonContainer)
    expect(wrapper.text()).toContain('Disabled')
    expect(wrapper.text()).toContain('Loading')
  })

  it('renders 16 fe-button elements', () => {
    const wrapper = mount(ButtonContainer)
    const buttons = wrapper.findAll('fe-button')
    expect(buttons.length).toBe(16)
	})

  it('has block class on root element', () => {
    const wrapper = mount(ButtonContainer)
    expect(wrapper.classes()).toContain('button-container')
  })

  it('renders section headings', () => {
    const wrapper = mount(ButtonContainer)
    expect(wrapper.text()).toContain('Variants')
    expect(wrapper.text()).toContain('Sizes')
    expect(wrapper.text()).toContain('Appearances')
    expect(wrapper.text()).toContain('States')
  })

  it('renders section fe-card', () => {
    const wrapper = mount(ButtonContainer)
    const cards = wrapper.findAll('fe-card')
    expect(cards.length).toBe(4)
  })

  it('renders subheadings with "subheading__h3" BEM class', () => {
    const wrapper = mount(ButtonContainer)
    const subheadings = wrapper.findAll('h3')
    expect(subheadings.length).toBe(4)
    subheadings.forEach(h3 => {
      expect(h3.classes()).toContain('subheading__h3')
    })
  })
})
