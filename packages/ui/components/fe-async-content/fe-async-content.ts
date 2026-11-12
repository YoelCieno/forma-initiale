import '@awesome.me/webawesome/dist/components/spinner/spinner.js'

import { define, html } from 'hybrids'

export interface FeAsyncContentElement extends HTMLElement {
  loading: boolean
  error: string | undefined
}

export const FeAsyncContent = define<FeAsyncContentElement>({
  tag: 'fe-async-content',
  loading: false,
  error: undefined,
  render: {
    value: (host) => {
      if (host.loading) {
        return html`
          <slot name="loading">
            <div class="fe-async-content__loading">
              <wa-spinner />
            </div>
          </slot>
        `.css`
          .fe-async-content__loading {
            text-align: center;
            font-size: 7.5rem;
            margin-top: 2.5rem;
          }
        `
      }
      if (host.error) {
        return html`
          <slot name="error">
            <div class="fe-async-content__error">${host.error}</div>
          </slot>
        `
      }
      return html`<slot></slot>`
    },
    shadow: true,
  },
})
