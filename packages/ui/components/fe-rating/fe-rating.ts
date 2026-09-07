import '@awesome.me/webawesome/dist/components/rating/rating.js'

import { define, html } from 'hybrids'

export interface FeRatingElement extends HTMLElement {
  value: number
  max: number
  precision: number
  size: string
  label: string
  disabled: boolean
	readonly: boolean
  required: boolean
  name: string | undefined
}

export const FeRating = define<FeRatingElement>({
  tag: 'fe-rating',
  value: 0,
  max: 5,
  precision: 1,
  size: 'm',
  label: '',
  disabled: false,
	readonly: false,
  required: false,
  name: undefined,
  render: {
    value: (host) => html`
      <wa-rating
        value="${host.value}"
        max="${host.max}"
        precision="${host.precision}"
        size="${host.size}"
        label="${host.label}"
        disabled="${host.disabled}"
        readonly="${host.readonly}"
        required="${host.required}"
        name="${host.name}"
      ></wa-rating>
    `,
    shadow: true,
  },
})
