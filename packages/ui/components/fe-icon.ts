import '@awesome.me/webawesome/dist/components/icon/icon.js'
import { define, html } from 'hybrids'

export interface FeIconElement extends HTMLElement {
  name: string | undefined
  library: string
  family: string
  variant: string | undefined
  label: string
  autoWidth: boolean
  flip: string | undefined
  rotate: number
  animation: string | undefined
  src: string | undefined
  swapOpacity: boolean
}

export const FeIcon = define<FeIconElement>({
  tag: 'fe-icon',
  name: undefined,
  library: 'default',
  family: 'classic',
  variant: undefined,
  label: '',
  autoWidth: false,
  flip: undefined,
  rotate: 0,
  animation: undefined,
  src: undefined,
  swapOpacity: false,
  render: {
    value: (host) => html`
      <wa-icon
        name="${host.name}"
        library="${host.library}"
        family="${host.family}"
        variant="${host.variant}"
        label="${host.label}"
        auto-width="${host.autoWidth}"
        flip="${host.flip}"
        rotate="${host.rotate}"
        animation="${host.animation}"
        src="${host.src}"
        swap-opacity="${host.swapOpacity}"
      ></wa-icon>
    `,
    shadow: true,
  },
})
