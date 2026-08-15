import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import './fe-img'
import type { FeImgElement } from './fe-img'

describe('fe-img', () => {
  let el: FeImgElement

  beforeEach(async () => {
    el = document.createElement('fe-img') as FeImgElement
    document.body.appendChild(el)
    await Promise.resolve()
    await Promise.resolve()
  })

  afterEach(() => {
    el?.parentNode?.removeChild(el)
  })

  it('registers as fe-img custom element', () => {
    expect(customElements.get('fe-img')).toBeDefined()
  })

  it('creates shadow root', () => {
    expect(el.shadowRoot).toBeDefined()
  })

  it('renders img inside shadow root', () => {
    const img = el.shadowRoot?.querySelector('img')
    expect(img).toBeDefined()
  })

  it('forwards src property to inner img', async () => {
    el.src = 'https://example.com/img.jpg'
    await Promise.resolve()
    await Promise.resolve()
    const img = el.shadowRoot?.querySelector('img')
    expect(img?.getAttribute('src')).toBe('https://example.com/img.jpg')
  })

  it('forwards alt property to inner img', async () => {
    el.alt = 'test image'
    await Promise.resolve()
    await Promise.resolve()
    const img = el.shadowRoot?.querySelector('img')
    expect(img?.getAttribute('alt')).toBe('test image')
  })

  it('uses fallbackSrc on image error', async () => {
    el.src = 'broken.jpg'
    el.fallbackSrc = 'fallback.jpg'
    await Promise.resolve()
    await Promise.resolve()
    const img = el.shadowRoot!.querySelector('img')!
    img.dispatchEvent(new Event('error'))
    await Promise.resolve()
    await Promise.resolve()
    expect(img.getAttribute('src')).toBe('fallback.jpg')
  })

  it('uses default data URI placeholder when fallbackSrc not set on error', async () => {
    el.src = 'broken.jpg'
    await Promise.resolve()
    await Promise.resolve()
    const img = el.shadowRoot!.querySelector('img')!
    img.dispatchEvent(new Event('error'))
    await Promise.resolve()
    await Promise.resolve()
    const src = img.getAttribute('src')
    expect(src).toMatch(/^data:image\/svg\+xml/)
  })

  it('caches src by cacheKey', async () => {
    el.src = 'first.jpg'
    el.cacheKey = 'key-1'
    await Promise.resolve()
    await Promise.resolve()
    el.src = 'second.jpg'
    el.cacheKey = 'key-1'
    await Promise.resolve()
    await Promise.resolve()
    const img = el.shadowRoot?.querySelector('img')
    expect(img?.getAttribute('src')).toBe('first.jpg')
  })

  it('updates src when cacheKey changes', async () => {
    el.src = 'first.jpg'
    el.cacheKey = 'key-1'
    await Promise.resolve()
    await Promise.resolve()
    el.src = 'second.jpg'
    el.cacheKey = 'key-2'
    await Promise.resolve()
    await Promise.resolve()
    const img = el.shadowRoot?.querySelector('img')
    expect(img?.getAttribute('src')).toBe('second.jpg')
  })

  it('bubbles click events from inner img', () => {
    const handler = vi.fn()
    el.addEventListener('click', handler)
    const img = el.shadowRoot!.querySelector('img')!
    img.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  // ── loading state ────────────────────────────────────────────

  it('has loading property defaulting to true', () => {
    expect(el.loading).toBe(true)
  })

  it('reflects loading attribute when loading is true', () => {
    expect(el.hasAttribute('loading')).toBe(true)
  })

  it('sets loading to false after image load event', async () => {
    const img = el.shadowRoot!.querySelector('img')!
    img.dispatchEvent(new Event('load'))
    await Promise.resolve()
    await Promise.resolve()
    expect(el.loading).toBe(false)
  })

  it('removes loading attribute after image load event', async () => {
    const img = el.shadowRoot!.querySelector('img')!
    img.dispatchEvent(new Event('load'))
    await Promise.resolve()
    await Promise.resolve()
    expect(el.hasAttribute('loading')).toBe(false)
  })

  it('sets loading to false after image error event', async () => {
    el.src = 'broken.jpg'
    await Promise.resolve()
    await Promise.resolve()
    const img = el.shadowRoot!.querySelector('img')!
    img.dispatchEvent(new Event('error'))
    await Promise.resolve()
    await Promise.resolve()
    expect(el.loading).toBe(false)
  })

  it('removes loading attribute after image error event', async () => {
    el.src = 'broken.jpg'
    await Promise.resolve()
    await Promise.resolve()
    const img = el.shadowRoot!.querySelector('img')!
    img.dispatchEvent(new Event('error'))
    await Promise.resolve()
    await Promise.resolve()
    expect(el.hasAttribute('loading')).toBe(false)
  })
})
