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

  // ── Bar rendering ──────────────────────────────────────────

  it('renders bar element', () => {
    const bar = el.shadowRoot!.querySelector('.fe-loader__bar')
    expect(bar).toBeDefined()
  })

  it('renders bar indicator inside bar', () => {
    const indicator = el.shadowRoot!.querySelector('.fe-loader__bar__indicator')
    expect(indicator).toBeDefined()
  })

  it('scales bar height with size', async () => {
    const bar = el.shadowRoot!.querySelector('.fe-loader__bar') as HTMLElement
    expect(getComputedStyle(bar).height).toBe('0.25rem')
    el.size = 'lg'
    await Promise.resolve()
    await Promise.resolve()
    expect(getComputedStyle(bar).height).toBe('0.75rem')
  })

  // ── label ──────────────────────────────────────────────────

  it('sets aria-label based on label prop', () => {
    const labelled = el.shadowRoot!.querySelector('[aria-label]')
    expect(labelled).toBeDefined()
    expect(labelled!.getAttribute('aria-label')).toBe('Loading')
  })

  it('updates aria-label when label changes', async () => {
    el.label = 'Please wait'
    await Promise.resolve()
    await Promise.resolve()
    const labelled = el.shadowRoot!.querySelector('[aria-label]')
    expect(labelled!.getAttribute('aria-label')).toBe('Please wait')
  })

  // ── a11y ────────────────────────────────────────────────────

  it('has role="status" on the container', () => {
    expect(el.shadowRoot!.querySelector('[role="status"]')).toBeDefined()
  })
})
