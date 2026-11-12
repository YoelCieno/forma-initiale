import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import './fe-loader'
import type { FeLoaderElement } from './fe-loader'

describe('fe-loader', () => {
  let el: FeLoaderElement

  beforeEach(async () => {
    el = document.createElement('fe-loader') as FeLoaderElement
    document.body.appendChild(el)
    await Promise.resolve() // hybridJS initial render
    await Promise.resolve() // Lit update cycle
  })

  afterEach(() => {
    el?.parentNode?.removeChild(el)
  })

  // ── Registration ─────────────────────────────────────────────

  it('registers as fe-loader custom element', () => {
    expect(customElements.get('fe-loader')).toBeDefined()
  })

  // ── Shadow DOM structure ────────────────────────────────────

  it('creates shadow root', () => {
    expect(el.shadowRoot).toBeDefined()
  })

  // ── Defaults ─────────────────────────────────────────────────

  it('defaults size to sm', () => {
    expect(el.size).toBe('sm')
  })

  it('defaults label to Loading', () => {
    expect(el.label).toBe('Loading')
  })

  it('defaults loading to false (renders empty host)', () => {
    expect(el.loading).toBe(false)
    expect(el.shadowRoot!.querySelector('.fe-loader__bar')).toBeNull()
  })

  // helper: enable bar render (hybridJS render needs 2 microtask ticks)
  const showBar = async () => {
    el.loading = true
    await Promise.resolve()
    await Promise.resolve()
  }

  // ── Bar rendering ──────────────────────────────────────────

  it('renders bar element', async () => {
    await showBar()
    const bar = el.shadowRoot!.querySelector('.fe-loader__bar')
    expect(bar).toBeDefined()
  })

  it('renders bar indicator inside bar', async () => {
    await showBar()
    const indicator = el.shadowRoot!.querySelector('.fe-loader__bar__indicator')
    expect(indicator).toBeDefined()
  })

  it('scales bar height with size', async () => {
    await showBar()
    const bar = el.shadowRoot!.querySelector('.fe-loader__bar') as HTMLElement
    // jsdom 30+ resolves rem units in getComputedStyle against root font-size
    // (16px): 0.25rem -> 4px, 0.75rem -> 12px. jsdom 29 passed tokens through.
    expect(getComputedStyle(bar).height).toBe('4px')
    el.size = 'lg'
    await Promise.resolve()
    await Promise.resolve()
    expect(getComputedStyle(bar).height).toBe('12px')
  })

  // ── label ──────────────────────────────────────────────────

  it('sets aria-label based on label prop', async () => {
    await showBar()
    const labelled = el.shadowRoot!.querySelector('[aria-label]')
    expect(labelled).toBeDefined()
    expect(labelled!.getAttribute('aria-label')).toBe('Loading')
  })

  it('updates aria-label when label changes', async () => {
    await showBar()
    el.label = 'Please wait'
    await Promise.resolve()
    await Promise.resolve()
    const labelled = el.shadowRoot!.querySelector('[aria-label]')
    expect(labelled!.getAttribute('aria-label')).toBe('Please wait')
  })

  // ── a11y ────────────────────────────────────────────────────

  it('has role="status" on the container', async () => {
    await showBar()
    expect(el.shadowRoot!.querySelector('[role="status"]')).toBeDefined()
  })
})
