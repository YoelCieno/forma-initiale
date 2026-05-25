import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import { define, html } from 'hybrids'

export interface FeButtonElement extends HTMLElement {
  variant: string
  size: string
  appearance: string
  icon: string
  disabled: boolean
  loading: boolean
  pill: boolean
}

export const FeButton = define<FeButtonElement>({
  tag: 'fe-button',
  variant: 'neutral',
  size: 'm',
  appearance: 'filled',
  icon: '',
  disabled: false,
  loading: false,
  pill: false,
  render: {
    value: (host) => html`
      <wa-button
        variant="${host.variant}"
        size="${host.size}"
        appearance="${host.appearance}"
        disabled="${host.disabled}"
        loading="${host.loading}"
        pill="${host.pill}"
      >
        ${host.icon && html`<wa-icon name="${host.icon}"></wa-icon>`}
        <slot></slot>
      </wa-button>
    `,
    shadow: true,
  },
})
