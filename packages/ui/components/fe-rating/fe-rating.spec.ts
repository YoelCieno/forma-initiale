import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// jsdom doesn't support ElementInternals.setFormValue which wa-rating uses
if (
  typeof ElementInternals !== 'undefined' &&
  !ElementInternals.prototype.setFormValue
) {
  ElementInternals.prototype.setFormValue = vi.fn()
}

import './fe-rating'
import type { FeRatingElement } from './fe-rating'

describe('fe-rating', () => {
  let el: FeRatingElement

  beforeEach(async () => {
    el = document.createElement('fe-rating') as FeRatingElement
    document.body.appendChild(el)
    await Promise.resolve() // hybridJS initial render
    await Promise.resolve() // WA update cycle
  })

  afterEach(() => {
    el?.parentNode?.removeChild(el)
  })

  // ── Registration ────────────────────────────────────────────

  it('registers as fe-rating custom element', () => {
    expect(customElements.get('fe-rating')).toBeDefined()
  })

  // ── Shadow DOM structure ────────────────────────────────────

  it('creates shadow root', () => {
    expect(el.shadowRoot).toBeDefined()
  })

  it('renders wa-rating inside shadow root', () => {
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(waRating).toBeDefined()
  })

  // ── value ───────────────────────────────────────────────────
  // WA rating props do NOT reflect to attrs — test via JS property

  it('defaults value to 0', () => {
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'value')).toBe(0)
  })

  it('forwards value property to inner wa-rating', async () => {
    el.value = 3
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'value')).toBe(3)
  })

  // ── max ─────────────────────────────────────────────────────

  it('defaults max to 5', () => {
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'max')).toBe(5)
  })

  it('forwards max property to inner wa-rating', async () => {
    el.max = 10
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'max')).toBe(10)
  })

  // ── precision ───────────────────────────────────────────────

  it('defaults precision to 1', () => {
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'precision')).toBe(1)
  })

  it('forwards precision property to inner wa-rating', async () => {
    el.precision = 0.5
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'precision')).toBe(0.5)
  })

  // ── size ────────────────────────────────────────────────────

  it('defaults size to m', () => {
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'size')).toBe('m')
  })

  it('forwards size property to inner wa-rating', async () => {
    el.size = 'l'
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'size')).toBe('l')
  })

  // ── label ───────────────────────────────────────────────────
  // WA rating does NOT reflect label attr; test via JS property

  it('defaults label to empty string', () => {
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'label')).toBe('')
  })

  it('forwards label property to inner wa-rating', async () => {
    el.label = 'Rate this product'
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'label')).toBe('Rate this product')
  })

  // ── disabled (boolean, no attr reflection) ──────────────────

  it('forwards disabled property to inner wa-rating', async () => {
    el.disabled = true
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'disabled')).toBe(true)
  })

  it('removes disabled from inner wa-rating when set back to false', async () => {
    el.disabled = true
    await Promise.resolve()
    await Promise.resolve()
    el.disabled = false
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'disabled')).toBe(false)
  })

  // ── readonly (boolean) ──────────────────────────────────────

  it('forwards readonly property to inner wa-rating', async () => {
    el.readonly = true
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'readonly')).toBe(true)
  })

  it('removes readonly from inner wa-rating when set back to false', async () => {
    el.readonly = true
    await Promise.resolve()
    await Promise.resolve()
    el.readonly = false
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'readonly')).toBe(false)
  })

  // ── required (boolean) ──────────────────────────────────────

  it('forwards required property to inner wa-rating', async () => {
    el.required = true
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'required')).toBe(true)
  })

  it('removes required from inner wa-rating when set back to false', async () => {
    el.required = true
    await Promise.resolve()
    await Promise.resolve()
    el.required = false
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'required')).toBe(false)
  })

  // ── name ────────────────────────────────────────────────────

  it('omits name property when undefined', () => {
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'name')).toBeUndefined()
  })

  it('forwards name property to inner wa-rating', async () => {
    el.name = 'rating'
    await Promise.resolve()
    await Promise.resolve()
    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(Reflect.get(waRating!, 'name')).toBe('rating')
  })

  // ── wa-hover event forwarding ─────────────────────────────

  it('dispatches wa-hover event when inner wa-rating hovers', () => {
    const handler = vi.fn()
    el.addEventListener('wa-hover', handler)

    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(waRating).toBeDefined()

    waRating!.dispatchEvent(
      new CustomEvent('wa-hover', {
        bubbles: true,
        composed: true,
        detail: { phase: 'start', value: 3 },
      }),
    )

    expect(handler).toHaveBeenCalledTimes(1)
  })

  // ── change event forwarding ───────────────────────────────

  it('dispatches change event when inner wa-rating value changes', () => {
    const handler = vi.fn()
    el.addEventListener('change', handler)

    const waRating = el.shadowRoot?.querySelector('wa-rating')
    expect(waRating).toBeDefined()

    waRating!.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
      }),
    )

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
