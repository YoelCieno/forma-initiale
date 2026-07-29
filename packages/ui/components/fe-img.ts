import { define, html } from 'hybrids'

const DEFAULT_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%%25%27 height=%27100%%25%27%3E%3Crect fill=%27%23eee%27 width=%27100%%25%27 height=%27100%%25%27/%3E%3Ctext x=%2750%%25%27 y=%2750%%25%27 text-anchor=%27middle%27 fill=%27%23999%27 font-size=%2714%27 dy=%27.3em%27%3EImage not found%3C/text%3E%3C/svg%3E'

const CACHE = new Map<string, string>()

export interface FeImgElement extends HTMLElement {
  src: string | undefined
  cacheKey: string | undefined
  fallbackSrc: string | undefined
  alt: string
  readonly currentSrc: string | undefined
  _handleImgError: () => void
}

export const FeImg = define<FeImgElement>({
  tag: 'fe-img',
  src: undefined,
  cacheKey: undefined,
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
      <img
        src="${host.currentSrc}"
        alt="${host.alt}"
        width="100%"
        height="100%"
        onerror="${host._handleImgError}"
      />
    `,
    shadow: true,
  },
  _handleImgError: (host: FeImgElement) => () => {
    const img = host.shadowRoot?.querySelector('img')
		if (!img) return

    const fallback = host.fallbackSrc || DEFAULT_FALLBACK
    if (img.getAttribute('src') !== fallback) {
      img.setAttribute('src', fallback)
    }
  },
})
