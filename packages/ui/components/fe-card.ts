import '@awesome.me/webawesome/dist/components/card/card.js'

import { define, html } from 'hybrids'

export interface FeCardElement extends HTMLElement {
  appearance: 'accent' | 'filled' | 'outlined' | 'filled-outlined' | 'plain'
  orientation: 'vertical' | 'horizontal'
  disabled: boolean
}

export const FeCard = define<FeCardElement>({
  tag: 'fe-card',
  appearance: 'outlined',
  orientation: 'vertical',
  disabled: false,
  render: {
    value: (host) => {
      // Detect initial content after render cycle
      const hasHeader = !!host.querySelector(':scope > [slot="header"]')
      const hasFooter = !!host.querySelector(':scope > [slot="footer"]')
      const hasMedia = !!host.querySelector(':scope > [slot="media"]')

      return html`
        <wa-card
          appearance="${host.appearance}"
          orientation="${host.orientation}"
          inert="${host.disabled}"
          style="${host.disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}"
        >
          ${hasMedia ? html`<slot slot="media" name="media"></slot>` : undefined}
          ${hasHeader ? html`<slot slot="header" name="header"></slot>` : undefined}
          <slot></slot>
          ${hasFooter ? html`<slot slot="footer" name="footer"></slot>` : undefined}
          <slot slot="actions" name="actions"></slot>
        </wa-card>
      `
    },
    shadow: true,
  },
})
