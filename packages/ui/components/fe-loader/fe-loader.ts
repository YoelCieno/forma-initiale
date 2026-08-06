import { define, html } from 'hybrids'

export interface FeLoaderElement extends HTMLElement {
  size: 'sm' | 'md' | 'lg'
  label: string
}

const sizeMap: Record<FeLoaderElement['size'], string> = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
}

export const FeLoader = define<FeLoaderElement>({
  tag: 'fe-loader',
  size: 'sm',
  label: 'Loading',
  render: {
    value: (host) => html`
      <div class="fe-loader__bar" role="status" aria-label="${host.label}">
        <div class="fe-loader__bar__indicator"></div>
      </div>
    `.css`
      :host {
        display: block;
        width: 100%;
      }
      .fe-loader__bar {
        position: relative;
        width: 100%;
        height: ${sizeMap[host.size]};
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
      @media (prefers-reduced-motion: reduce) {
        .fe-loader__bar__indicator {
          animation: none;
        }
      }
    `,
    shadow: true,
  },
})
