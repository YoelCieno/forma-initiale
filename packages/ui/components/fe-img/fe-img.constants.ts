const FALLBACK_SVG_TEMPLATE = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 280 220">
  <rect fill="#f5f5f4" width="280" height="220"/>
  <g transform="translate(85,55)">
    <rect x="0" y="0" width="110" height="90" rx="6" fill="none" stroke="#d4d4d8" stroke-width="2"/>
    <path d="M0 70 L25 40 L40 55 L55 35 L75 60 L90 45 L110 70 V90 H0 Z" fill="#e4e4e7" stroke="#d4d4d8" stroke-width="1"/>
    <circle cx="85" cy="22" r="9" fill="#e4e4e7" stroke="#d4d4d8" stroke-width="1"/>
  </g>
  <text x="140" y="175" text-anchor="middle" fill="#a1a1aa" font-size="13" font-family="system-ui, sans-serif">No image</text>
</svg>`

export const FALLBACK_SVG = `data:image/svg+xml,${encodeURIComponent(FALLBACK_SVG_TEMPLATE)}`

export const CACHE = new Map<string, string>()
