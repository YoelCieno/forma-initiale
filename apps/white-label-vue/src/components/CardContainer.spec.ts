import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CardContainer from './CardContainer.vue'

describe('CardContainer', () => {
  it('renders default card', () => {
    const wrapper = mount(CardContainer)
    const cards = wrapper.findAll('fe-card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
    expect(cards[0].exists()).toBe(true)
    expect(cards[0].attributes('appearance')).toBeUndefined()
  })

  it('renders all 3 appearances', () => {
    const wrapper = mount(CardContainer)
    const outlined = wrapper.find('fe-card[appearance="outlined"]')
    const filled = wrapper.find('fe-card[appearance="filled"]')
    const accent = wrapper.find('fe-card[appearance="accent"]')
    expect(outlined.exists()).toBe(true)
    expect(filled.exists()).toBe(true)
    expect(accent.exists()).toBe(true)
  })

  it('renders card with header slot', () => {
    const wrapper = mount(CardContainer)
    const headerSlot = wrapper.find('h4[slot="header"]')
    expect(headerSlot.exists()).toBe(true)
    expect(headerSlot.text()).toBe('Card Title')
  })

  it('renders horizontal card', () => {
    const wrapper = mount(CardContainer)
    const horizCard = wrapper.find('fe-card[orientation="horizontal"]')
    expect(horizCard.exists()).toBe(true)
  })
})
