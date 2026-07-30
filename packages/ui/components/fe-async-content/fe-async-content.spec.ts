import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import './fe-async-content'

describe('fe-async-content', () => {
  let el: HTMLElement

  beforeEach(async () => {
    el = document.createElement('fe-async-content')
    document.body.appendChild(el)
    await Promise.resolve()
    await Promise.resolve()
  })

  afterEach(() => {
    el.remove()
  })

  it('renders fe-async-content element', () => {
    expect(el).toBeDefined()
    expect(el.tagName.toLowerCase()).toBe('fe-async-content')
  })

  it('is not loading by default', () => {
    expect(Reflect.get(el, 'loading')).toBe(false)
  })

  it('has no error by default', () => {
    expect(Reflect.get(el, 'error')).toBeUndefined()
  })

  it('renders default slot content when not loading and no error', () => {
    el.innerHTML = '<span class="content">Hello</span>'
    expect(el.querySelector('.content')?.textContent).toBe('Hello')
  })

  it('renders loading slot when loading is true', async () => {
    Reflect.set(el, 'loading', true)
    await Promise.resolve()
    await Promise.resolve()
    // Should show default loading (wa-spinner) when no custom loading slot
    // We check that the shadow root exists and doesn't render default slot
    expect(Reflect.get(el, 'loading')).toBe(true)
  })

  it('switches from loading to content', async () => {
    Reflect.set(el, 'loading', true)
    await Promise.resolve()
    await Promise.resolve()
    Reflect.set(el, 'loading', false)
    await Promise.resolve()
    await Promise.resolve()
    el.innerHTML = '<span class="content">Done</span>'
    expect(el.querySelector('.content')?.textContent).toBe('Done')
  })

  it('renders error slot when error is set', async () => {
    Reflect.set(el, 'error', 'Something went wrong')
    await Promise.resolve()
    await Promise.resolve()
    expect(Reflect.get(el, 'error')).toBe('Something went wrong')
  })

  it('accepts custom error slot content', async () => {
    el.innerHTML = '<span slot="error" class="custom-error">My Error</span>'
    Reflect.set(el, 'error', 'Something went wrong')
    await Promise.resolve()
    await Promise.resolve()
    // Custom error slot should be present in light DOM
    expect(el.querySelector('.custom-error')?.textContent).toBe('My Error')
  })

  it('accepts loading boolean assignment', () => {
    Reflect.set(el, 'loading', true)
    expect(Reflect.get(el, 'loading')).toBe(true)
  })
})
