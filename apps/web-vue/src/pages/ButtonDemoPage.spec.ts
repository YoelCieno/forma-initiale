import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonDemoPage from './ButtonDemoPage.vue'

describe('ButtonDemoPage', () => {
  it('renders demo page title', () => {
    const wrapper = mount(ButtonDemoPage)
    expect(wrapper.text()).toContain('Button Demo')
  })

  it('renders brand variant fe-button', () => {
    const wrapper = mount(ButtonDemoPage)
    const brand = wrapper.find('fe-button[variant="brand"]')
    expect(brand.exists()).toBe(true)
  })

  it('renders success variant fe-button', () => {
    const wrapper = mount(ButtonDemoPage)
    const success = wrapper.find('fe-button[variant="success"]')
    expect(success.exists()).toBe(true)
  })

  it('renders danger variant fe-button', () => {
    const wrapper = mount(ButtonDemoPage)
    const danger = wrapper.find('fe-button[variant="danger"]')
    expect(danger.exists()).toBe(true)
  })

  it('renders at least 3 different sizes', () => {
    const wrapper = mount(ButtonDemoPage)
    const sizes = ['xs', 's', 'm', 'l', 'xl'].filter(
      size => wrapper.find(`fe-button[size="${size}"]`).exists(),
    )
    expect(sizes.length).toBeGreaterThanOrEqual(3)
  })

  it('renders a disabled fe-button', () => {
    const wrapper = mount(ButtonDemoPage)
    const disabled = wrapper.find('fe-button[disabled]')
    expect(disabled.exists()).toBe(true)
  })

  it('renders a loading fe-button', () => {
    const wrapper = mount(ButtonDemoPage)
    const loading = wrapper.find('fe-button[loading]')
    expect(loading.exists()).toBe(true)
  })
})
