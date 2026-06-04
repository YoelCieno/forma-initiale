import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentsPage from './ComponentsPage.vue'

describe('ComponentsPage', () => {
  it('renders demo page title', () => {
    const wrapper = mount(ComponentsPage)
    expect(wrapper.text()).toContain('Button')
  })

  it('renders brand variant fe-button', () => {
    const wrapper = mount(ComponentsPage)
    const brand = wrapper.find('fe-button[variant="brand"]')
    expect(brand.exists()).toBe(true)
  })

  it('renders success variant fe-button', () => {
    const wrapper = mount(ComponentsPage)
    const success = wrapper.find('fe-button[variant="success"]')
    expect(success.exists()).toBe(true)
  })

  it('renders danger variant fe-button', () => {
    const wrapper = mount(ComponentsPage)
    const danger = wrapper.find('fe-button[variant="danger"]')
    expect(danger.exists()).toBe(true)
  })

  it('renders at least 3 different sizes', () => {
    const wrapper = mount(ComponentsPage)
    const sizes = ['xs', 's', 'm', 'l', 'xl'].filter(
      size => wrapper.find(`fe-button[size="${size}"]`).exists(),
    )
    expect(sizes.length).toBeGreaterThanOrEqual(3)
  })

  it('renders a disabled fe-button', () => {
    const wrapper = mount(ComponentsPage)
    const disabled = wrapper.find('fe-button[disabled]')
    expect(disabled.exists()).toBe(true)
  })

  it('renders a loading fe-button', () => {
    const wrapper = mount(ComponentsPage)
    const loading = wrapper.find('fe-button[loading]')
    expect(loading.exists()).toBe(true)
  })

  it('renders fe-icon section heading', () => {
    const wrapper = mount(ComponentsPage)
    expect(wrapper.text()).toContain('Icons')
  })

  it('renders basic icons', () => {
    const wrapper = mount(ComponentsPage)
    const check = wrapper.find('fe-icon[name="check"]')
    const star = wrapper.find('fe-icon[name="star"]')
    expect(check.exists()).toBe(true)
    expect(star.exists()).toBe(true)
  })

  it('renders animated icons', () => {
    const wrapper = mount(ComponentsPage)
    const spin = wrapper.find('fe-icon[animation="spin"]')
    const pulse = wrapper.find('fe-icon[animation="pulse"]')
    expect(spin.exists()).toBe(true)
    expect(pulse.exists()).toBe(true)
  })

  it('renders size-variant icons', () => {
    const wrapper = mount(ComponentsPage)
    const rocketXs = wrapper.find('fe-icon[name="rocket"]')
    expect(rocketXs.exists()).toBe(true)
  })

  it('renders fe-card section heading', () => {
    const wrapper = mount(ComponentsPage)
    expect(wrapper.text()).toContain('Card')
  })

  it('renders default fe-card', () => {
    const wrapper = mount(ComponentsPage)
    const card = wrapper.find('fe-card')
    expect(card.exists()).toBe(true)
  })

  it('renders appearance variant cards', () => {
    const wrapper = mount(ComponentsPage)
    // WA components use JS properties not HTML attrs; check via text
    expect(wrapper.text()).toContain('Outlined (default)')
    expect(wrapper.text()).toContain('Filled')
    expect(wrapper.text()).toContain('Accent')
    expect(wrapper.text()).toContain('Plain')
  })

  it('renders card with header slot', () => {
    const wrapper = mount(ComponentsPage)
    expect(wrapper.text()).toContain('Card Title')
  })

  it('renders horizontal card', () => {
    const wrapper = mount(ComponentsPage)
    // WA uses JS properties not HTML attrs; check via text content
    expect(wrapper.text()).toContain('Horizontal card')
  })
})
