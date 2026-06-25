import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonContainer from './ButtonContainer.vue'

describe('ButtonContainer', () => {
  it('renders all variant buttons', () => {
    const wrapper = mount(ButtonContainer)
    const buttons = wrapper.findAll('fe-button')
    const variants = ['neutral', 'brand', 'success', 'warning', 'danger']
    variants.forEach((variant) => {
      const found = buttons.some((b) => b.attributes('variant') === variant)
      expect(found, `expected fe-button with variant="${variant}"`).toBe(true)
    })
  })

  it('renders all size variants', () => {
    const wrapper = mount(ButtonContainer)
    const buttons = wrapper.findAll('fe-button')
    const sizes = ['xs', 's', 'm', 'l', 'xl']
    sizes.forEach((size) => {
      const found = buttons.some((b) => b.attributes('size') === size)
      expect(found, `expected fe-button with size="${size}"`).toBe(true)
    })
  })

  it('renders all appearance variants', () => {
    const wrapper = mount(ButtonContainer)
    const buttons = wrapper.findAll('fe-button')
    const appearances = ['accent', 'filled', 'outlined', 'plain']
    appearances.forEach((appearance) => {
      const found = buttons.some(
        (b) => b.attributes('appearance') === appearance,
      )
      expect(
        found,
        `expected fe-button with appearance="${appearance}"`,
      ).toBe(true)
    })
  })

  it('renders states in their section', () => {
    const wrapper = mount(ButtonContainer)
    const disabledButtons = wrapper.findAll('fe-button[disabled]')
    expect(disabledButtons.length).toBeGreaterThanOrEqual(1)
    const loadingButtons = wrapper.findAll('fe-button[loading]')
    expect(loadingButtons.length).toBeGreaterThanOrEqual(1)
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
