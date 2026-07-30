import { define, html } from 'hybrids'

export interface FeLoaderElement extends HTMLElement {
  size: 'sm' | 'md' | 'lg'
  label: string
}

export const FeLoader = define<FeLoaderElement>({
  tag: 'fe-loader',
  size: 'md',
  label: 'Loading',
  render: {
    value: (host) => html`
      <div role="status" aria-label="${host.label}">
        <div class="fe-loader__bar">
          <div class="fe-loader__bar__indicator"></div>
        </div>
      </div>
    `.css`
      :host {
        display: block;
        width: 100%;
      }
      .fe-loader__bar {
        position: relative;
        width: 100%;
        height: 0.25rem;
        background-color: var(--wa-color-surface-lowered);
        border-radius: var(--wa-border-radius-pill);
        overflow: hidden;
      }
      .fe-loader__bar__indicator {
        position: absolute;
        inset: 0;
        border-radius: var(--wa-border-radius-pill);
        --c:no-repeat linear-gradient(var(--wa-color-brand-fill-normal) 0 0);
        background: var(--c),var(--c),var(--wa-color-neutral-fill-quiet);
        background-size: 60% 100%;
        animation: fe-loader-bar-indeterminate 2s infinite;
      }
      @keyframes fe-loader-bar-indeterminate {
        0%   {background-position:-150% 0,-150% 0}
        66%  {background-position: 250% 0,-150% 0}
        100% {background-position: 250% 0, 250% 0}
      }
    `,
    shadow: true,
  },
})
