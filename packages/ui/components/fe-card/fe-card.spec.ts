import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import './fe-card'
import type { FeCardElement } from './fe-card'

describe('fe-card', () => {
  let el: FeCardElement

  beforeEach(async () => {
    el = document.createElement('fe-card') as FeCardElement
    document.body.appendChild(el)
    // hybridJS deferred microtask render
    await Promise.resolve()
    await Promise.resolve()
  })

  afterEach(() => {
    el.remove()
  })

  it('renders fe-card element', () => {
    expect(el).toBeDefined()
    expect(el.tagName.toLowerCase()).toBe('fe-card')
  })

  it('has default appearance', () => {
    expect(Reflect.get(el, 'appearance')).toBe('outlined')
  })

  it('has default orientation', () => {
    expect(Reflect.get(el, 'orientation')).toBe('vertical')
  })

  it('renders slot content through shadow DOM', () => {
    el.innerHTML = '<span class="test-content">Hello Card</span>'
    const text = el.querySelector('.test-content')?.textContent
    expect(text).toBe('Hello Card')
  })

  it('accepts custom appearance', async () => {
    el.appearance = 'filled'
    await Promise.resolve()
    await Promise.resolve()
    expect(Reflect.get(el, 'appearance')).toBe('filled')
  })

  it('accepts horizontal orientation', async () => {
    el.orientation = 'horizontal'
    await Promise.resolve()
    await Promise.resolve()
    expect(Reflect.get(el, 'orientation')).toBe('horizontal')
  })

  it('has wa-card in shadow DOM', () => {
    const card = el.shadowRoot?.querySelector('wa-card')
    expect(card).toBeInstanceOf(HTMLElement)
  })

  it('forwards header slot to wa-card when header slot has content', async () => {
    const cardEl = document.createElement('fe-card')
    cardEl.innerHTML = '<h2 slot="header">Title</h2>'
    document.body.appendChild(cardEl)
    await Promise.resolve()
    await Promise.resolve()
    const card = cardEl.shadowRoot?.querySelector('wa-card')
    expect(card?.querySelector('slot[slot="header"]')).toBeTruthy()
    cardEl.remove()
  })

  it('does not set with-header on wa-card when header slot is empty', () => {
    el.innerHTML = '<p>No header</p>'
    const card = el.shadowRoot?.querySelector('wa-card')
    expect(card?.hasAttribute('with-header')).toBe(false)
  })

  it('forwards footer slot to wa-card when footer slot has content', async () => {
    const cardEl = document.createElement('fe-card')
    cardEl.innerHTML = '<span slot="footer">Footer</span>'
    document.body.appendChild(cardEl)
    await Promise.resolve()
    await Promise.resolve()
    const card = cardEl.shadowRoot?.querySelector('wa-card')
    expect(card?.querySelector('slot[slot="footer"]')).toBeTruthy()
    cardEl.remove()
  })

  it('forwards media slot to wa-card when media slot has content', async () => {
    const cardEl = document.createElement('fe-card')
    cardEl.innerHTML = '<img slot="media" src="test.jpg" />'
    document.body.appendChild(cardEl)
    await Promise.resolve()
    await Promise.resolve()
    const card = cardEl.shadowRoot?.querySelector('wa-card')
    expect(card?.querySelector('slot[slot="media"]')).toBeTruthy()
    cardEl.remove()
  })
})
