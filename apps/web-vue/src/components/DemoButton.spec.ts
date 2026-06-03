import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DemoButton from './DemoButton.vue'

describe('DemoButton', () => {
  it('renders all variant buttons', () => {
    const wrapper = mount(DemoButton)
    expect(wrapper.text()).toContain('Neutral')
    expect(wrapper.text()).toContain('Brand')
    expect(wrapper.text()).toContain('Success')
    expect(wrapper.text()).toContain('Warning')
    expect(wrapper.text()).toContain('Danger')
  })

  it('renders all size variants', () => {
    const wrapper = mount(DemoButton)
    expect(wrapper.text()).toContain('XS')
    expect(wrapper.text()).toContain('S')
    expect(wrapper.text()).toContain('M')
    expect(wrapper.text()).toContain('L')
    expect(wrapper.text()).toContain('XL')
  })

  it('renders all appearance variants', () => {
    const wrapper = mount(DemoButton)
    expect(wrapper.text()).toContain('Accent')
    expect(wrapper.text()).toContain('Filled')
    expect(wrapper.text()).toContain('Outlined')
    expect(wrapper.text()).toContain('Plain')
  })

  it('renders states section', () => {
    const wrapper = mount(DemoButton)
    expect(wrapper.text()).toContain('Disabled')
    expect(wrapper.text()).toContain('Loading')
  })

  it('renders fe-button elements', () => {
    const wrapper = mount(DemoButton)
    const buttons = wrapper.findAll('fe-button')
    expect(buttons.length).toBe(16)
  })

  it('renders section headings', () => {
    const wrapper = mount(DemoButton)
    expect(wrapper.text()).toContain('Variants')
    expect(wrapper.text()).toContain('Sizes')
    expect(wrapper.text()).toContain('Appearances')
    expect(wrapper.text()).toContain('States')
  })

  it('renders each section inside fe-card', () => {
    const wrapper = mount(DemoButton)
    const cards = wrapper.findAll('fe-card')
    expect(cards.length).toBe(4)
  })

  it('renders subheadings with BEM class', () => {
    const wrapper = mount(DemoButton)
    const subheadings = wrapper.findAll('h3')
    expect(subheadings.length).toBe(4)
    subheadings.forEach(h3 => {
      expect(h3.classes()).toContain('demo-button__subheading')
    })
  })

  it('has block class on root element', () => {
    const wrapper = mount(DemoButton)
    expect(wrapper.classes()).toContain('demo-button')
  })

  it('renders wrapper divs inside cards', () => {
    const wrapper = mount(DemoButton)
    const wrappers = wrapper.findAll('.demo-button__row')
    expect(wrappers.length).toBe(4)
  })
})
