import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutPage from './AboutPage.vue'

describe('AboutPage', () => {
  it('renders h1 "About Fake Plants"', () => {
    const wrapper = mount(AboutPage)
    const heading = wrapper.find('h1')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('About Fake Plants')
  })

  it('renders fe-card element', () => {
    const wrapper = mount(AboutPage)
    const card = wrapper.find('fe-card')
    expect(card.exists()).toBe(true)
  })

  it('renders paragraph about white-label platform', () => {
    const wrapper = mount(AboutPage)
    expect(wrapper.text()).toContain('white-label')
    expect(wrapper.text()).toContain('forma-initiale')
  })
})
