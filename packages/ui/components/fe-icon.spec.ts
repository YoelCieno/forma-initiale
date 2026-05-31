import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import './fe-icon'
import type { FeIconElement } from './fe-icon'

describe('fe-icon', () => {
  let el: FeIconElement

  beforeEach(async () => {
    el = document.createElement('fe-icon') as FeIconElement
    document.body.appendChild(el)
    await Promise.resolve() // hybridJS initial render
    await Promise.resolve() // WA update cycle
  })

  afterEach(() => {
    el?.parentNode?.removeChild(el)
  })

  // -- Registration --------------------------------------------

  it('registers as fe-icon custom element', () => {
    expect(customElements.get('fe-icon')).toBeDefined()
  })

  // -- Shadow DOM structure ------------------------------------

  it('creates shadow root', () => {
    expect(el.shadowRoot).toBeDefined()
  })

  it('renders wa-icon inside shadow root', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon).toBeDefined()
  })

  // -- name ----------------------------------------------------

  it('forwards name property to inner wa-icon', async () => {
    el.name = 'star'
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('name')).toBe('star')
  })

  // -- library ------------------------------------------------

  it('defaults library to default', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('library')).toBe('default')
  })

  it('forwards library property to inner wa-icon', async () => {
    el.library = 'bootstrap'
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('library')).toBe('bootstrap')
  })

  // -- family -------------------------------------------------

  it('defaults family to classic', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('family')).toBe('classic')
  })

  it('forwards family property to inner wa-icon', async () => {
    el.family = 'brands'
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('family')).toBe('brands')
  })

  // -- variant (optional) -------------------------------------

  it('omits variant attribute when undefined', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('variant')).toBeFalsy()
  })

  it('forwards variant property to inner wa-icon', async () => {
    el.variant = 'solid'
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('variant')).toBe('solid')
  })

  // -- label --------------------------------------------------
  // WA icon does NOT reflect label attribute; test via JS property

  it('defaults label to empty string', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'label')).toBe('')
  })

  it('forwards label property to inner wa-icon', async () => {
    el.label = 'Favorite'
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'label')).toBe('Favorite')
  })

  // -- autoWidth (boolean) ------------------------------------
  // WA boolean props do not reflect to attrs reliably.
  // Tests check the underlying JS property value instead.

  it('defaults autoWidth to false', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'autoWidth')).toBe(false)
  })

  it('forwards autoWidth property to inner wa-icon', async () => {
    el.autoWidth = true
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'autoWidth')).toBe(true)
  })

  it('removes autoWidth property from inner wa-icon when set back to false', async () => {
    el.autoWidth = true
    await Promise.resolve()
    await Promise.resolve()
    el.autoWidth = false
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'autoWidth')).toBe(false)
  })

  // -- flip (optional) ----------------------------------------

  it('omits flip attribute when undefined', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('flip')).toBeFalsy()
  })

  it('forwards flip property to inner wa-icon', async () => {
    el.flip = 'x'
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('flip')).toBe('x')
  })

  // -- rotate -------------------------------------------------

  it('defaults rotate to 0', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('rotate')).toBe('0')
  })

  it('forwards rotate property to inner wa-icon', async () => {
    el.rotate = 90
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('rotate')).toBe('90')
  })

  // -- animation (optional) -----------------------------------

  it('omits animation attribute when undefined', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('animation')).toBeFalsy()
  })

  it('forwards animation property to inner wa-icon', async () => {
    el.animation = 'spin'
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon?.getAttribute('animation')).toBe('spin')
  })

  // -- src (optional) -----------------------------------------
  // WA icon does NOT reflect src attribute; test via JS property

  it('omits src attribute when undefined', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'src')).toBeUndefined()
  })

  it('forwards src property to inner wa-icon', async () => {
    el.src = '/assets/icon.svg'
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'src')).toBe('/assets/icon.svg')
  })

  // -- swapOpacity (boolean) ----------------------------------

  it('defaults swapOpacity to false', () => {
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'swapOpacity')).toBe(false)
  })

  it('forwards swapOpacity property to inner wa-icon', async () => {
    el.swapOpacity = true
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'swapOpacity')).toBe(true)
  })

  it('removes swapOpacity property from inner wa-icon when set back to false', async () => {
    el.swapOpacity = true
    await Promise.resolve()
    await Promise.resolve()
    el.swapOpacity = false
    await Promise.resolve()
    await Promise.resolve()
    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(Reflect.get(waIcon!, 'swapOpacity')).toBe(false)
  })

  // -- wa-error event forwarding ------------------------------

  it('dispatches wa-error event when inner wa-icon errors', () => {
    const handler = vi.fn()
    el.addEventListener('wa-error', handler)

    const waIcon = el.shadowRoot?.querySelector('wa-icon')
    expect(waIcon).toBeDefined()

    waIcon!.dispatchEvent(
      new CustomEvent('wa-error', { bubbles: true, composed: true }),
    )

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
