import { define, html } from 'hybrids'
import { FALLBACK_SVG, CACHE } from './fe-img.constants.js'

export interface FeImgElement extends HTMLElement {
  src: string | undefined
  cacheKey: string | undefined
  fallbackSrc: string | undefined
	alt: string
  minHeight: string | undefined
  readonly currentSrc: string | undefined
  _handleImgError: () => void
}

export const FeImg = define<FeImgElement>({
  tag: 'fe-img',
  src: undefined,
	cacheKey: undefined,
	minHeight: '10rem',
  alt: '',
  fallbackSrc: undefined,
  // Hybrids computed property — factory fn tracks host.src + host.cacheKey deps
  currentSrc: (host) => {
    // Guard: skip cache logic when no key
    if (!host.cacheKey) return host.src

    const cached = CACHE.get(host.cacheKey)
    if (cached) return cached

    // First time for this key — populate cache
    if (host.src) CACHE.set(host.cacheKey, host.src)
    return host.src
  },
  render: {
    value: (host) => html`
      <style>
        :host {
          display: inline-block;
          width: 100%;
        }
        img {
          display: block;
          width: 100%;
          min-height: ${host.minHeight};
        }
      </style>
      <img
        src="${host.currentSrc}"
        alt="${host.alt}"
        onerror="${host._handleImgError}"
      />
    `,
    shadow: true,
  },
  _handleImgError: (host: FeImgElement) => () => {
    const img = host.shadowRoot?.querySelector('img')
    if (!img) return

    const fallback = host.fallbackSrc || FALLBACK_SVG
    if (img.getAttribute('src') !== fallback) {
      img.setAttribute('src', fallback)
    }
  },
})
