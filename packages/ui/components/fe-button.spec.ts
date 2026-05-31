import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import './fe-button'
import type { FeButtonElement } from './fe-button'

describe('fe-button', () => {
  let el: FeButtonElement

  beforeEach(async () => {
    el = document.createElement('fe-button') as FeButtonElement
    document.body.appendChild(el)
    await Promise.resolve() // hybridJS initial render
    await Promise.resolve() // Lit initial update + reflection
  })

  afterEach(() => {
    el?.parentNode?.removeChild(el)
  })

  // ── Registration ────────────────────────────────────────────

  it('registers as fe-button custom element', () => {
    expect(customElements.get('fe-button')).toBeDefined()
  })

  // ── Shadow DOM structure ────────────────────────────────────

  it('creates shadow root', () => {
    expect(el.shadowRoot).toBeDefined()
  })

  it('renders wa-button inside shadow root', () => {
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton).toBeDefined()
  })

  it('renders a slot element for child content', () => {
    const slot = el.shadowRoot?.querySelector('slot')
    expect(slot).toBeDefined()
  })

  // ── Variant ─────────────────────────────────────────────────

  it('defaults variant to neutral', () => {
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton?.getAttribute('variant')).toBe('neutral')
  })

  it('forwards variant property to inner wa-button', async () => {
    el.variant = 'brand'
    await Promise.resolve() // hybridJS re-render
    await Promise.resolve() // Lit reflect to attribute
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton?.getAttribute('variant')).toBe('brand')
  })

  // ── Size ────────────────────────────────────────────────────

  it('defaults size to m', () => {
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton?.getAttribute('size')).toBe('m')
  })

  it('forwards size property to inner wa-button', async () => {
    el.size = 'l'
    await Promise.resolve()
    await Promise.resolve()
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton?.getAttribute('size')).toBe('l')
  })

  // ── Appearance ──────────────────────────────────────────────

  it('defaults appearance to filled', () => {
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton?.getAttribute('appearance')).toBe('filled')
  })

  it('forwards appearance property to inner wa-button', async () => {
    el.appearance = 'outlined'
    await Promise.resolve()
    await Promise.resolve()
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton?.getAttribute('appearance')).toBe('outlined')
  })

  // ── Icon ────────────────────────────────────────────────────

  it('renders wa-icon inside shadow root when icon property is set', async () => {
    el.icon = 'check'
    await Promise.resolve() // hybridJS re-render (creates wa-icon)
    await Promise.resolve() // Lit reflect name attribute
    const icon = el.shadowRoot?.querySelector('wa-icon')
    expect(icon).toBeDefined()
    expect(icon?.getAttribute('name')).toBe('check')
  })

  it('omits wa-icon when icon property is empty', () => {
    const icon = el.shadowRoot?.querySelector('wa-icon')
    expect(icon).toBeNull()
  })

  // ── disabled ────────────────────────────────────────────────
  // WA boolean props (disabled, loading, pill) do not reflect to attributes.
  // Tests check the underlying JS property value instead.

  it('forwards disabled property to inner wa-button', async () => {
    el.disabled = true
    await Promise.resolve() // hybridJS re-render
    // await Promise.resolve() // Lit update
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(Reflect.get(waButton!, 'disabled')).toBe(true)
  })

  it('removes disabled property from inner wa-button when host disables it', async () => {
    el.disabled = true
    await Promise.resolve()
    await Promise.resolve()
    el.disabled = false
    await Promise.resolve()
    await Promise.resolve()
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(Reflect.get(waButton!, 'disabled')).toBe(false)
  })

  // ── loading ────────────────────────────────────────────────

  it('forwards loading property to inner wa-button', async () => {
    el.loading = true
    await Promise.resolve()
    await Promise.resolve()
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(Reflect.get(waButton!, 'loading')).toBe(true)
  })

  it('removes loading property from inner wa-button when host disables it', async () => {
    el.loading = true
    await Promise.resolve()
    await Promise.resolve()
    el.loading = false
    await Promise.resolve()
    await Promise.resolve()
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(Reflect.get(waButton!, 'loading')).toBe(false)
  })

  // ── pill ────────────────────────────────────────────────────

  it('forwards pill property to inner wa-button', async () => {
    el.pill = true
    await Promise.resolve()
    await Promise.resolve()
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(Reflect.get(waButton!, 'pill')).toBe(true)
  })

  it('removes pill property from inner wa-button when host disables it', async () => {
    el.pill = true
    await Promise.resolve()
    await Promise.resolve()
    el.pill = false
    await Promise.resolve()
    await Promise.resolve()
    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(Reflect.get(waButton!, 'pill')).toBe(false)
  })

  // ── Click event ──────────────────────────────────────────────

  it('dispatches click event when inner wa-button is clicked', () => {
    const handler = vi.fn()
    el.addEventListener('click', handler)

    const waButton = el.shadowRoot?.querySelector('wa-button')
    expect(waButton).toBeDefined()

    waButton!.dispatchEvent(
      new MouseEvent('click', { bubbles: true, composed: true }),
    )

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
