import WaCard from '@awesome.me/webawesome/dist/components/card/card.js'

// Register fe-card alias for the WA card component.
// Thin re-export — empty subclass of WaCard, zero custom logic.
// WA's WaCard handles all rendering, slots, attributes, and shadow DOM.
class FeCard extends WaCard {}

if (!customElements.get('fe-card')) {
  customElements.define('fe-card', FeCard)
}

export interface FeCardElement extends HTMLElement {
  appearance: 'accent' | 'filled' | 'outlined' | 'filled-outlined' | 'plain'
  orientation: 'horizontal' | 'vertical'
  withFooter: boolean
  withHeader: boolean
  withMedia: boolean
}
