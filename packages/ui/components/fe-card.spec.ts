import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import './fe-card'

describe('fe-card', () => {
  let el: HTMLElement

  beforeEach(async () => {
    el = document.createElement('fe-card')
    document.body.appendChild(el)
    // WA LitElement needs a microtask to initialize
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
    // WA props don't reflect to attrs — check JS property
    expect(Reflect.get(el, 'appearance')).toBe('outlined')
  })

  it('has default orientation', () => {
    expect(Reflect.get(el, 'orientation')).toBe('vertical')
  })

  it('renders slot content', () => {
    el.innerHTML = '<span class="test-content">Hello Card</span>'
    expect(el.querySelector('.test-content')?.textContent).toBe('Hello Card')
  })

  it('accepts custom appearance', () => {
    el.setAttribute('appearance', 'filled')
    expect(Reflect.get(el, 'appearance')).toBe('filled')
  })

  it('accepts horizontal orientation', () => {
    el.setAttribute('orientation', 'horizontal')
    expect(Reflect.get(el, 'orientation')).toBe('horizontal')
  })
})
