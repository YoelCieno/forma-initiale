/**
 * Validate a hex color string (#RRGGBB or #RGB format).
 * Accepts uppercase and lowercase hex digits.
 */
export function validateHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex) || /^#[0-9a-fA-F]{3}$/.test(hex)
}

/**
 * Map a WA theme name to its CSS class.
 * Returns empty string for custom/preset themes (inline token blocks, no WA class).
 */
export function getThemeClass(theme: string): string {
  const map: Record<string, string> = {
    default: 'wa-theme-default',
    cyberpunk: '',
    coffeecup: '',
    silk: '',
    custom: '',
  }
  return map[theme] ?? ''
}

/**
 * Format theme tokens as CSS variable declarations.
 */
export function formatThemeTokens(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
}

/**
 * Get theme-specific color variables for CSS token customization.
 * These are used to override default design tokens for themed experiences.
 */
export function getThemeTokens(theme: string): Record<string, string> {
  const tokens: Record<string, Record<string, string>> = {
    default: {},
    cyberpunk: {
      '--brand-fill-quiet': '#e0d6ff',
      '--brand-fill-normal': '#8b5cf6',
      '--brand-fill-loud': '#7c3aed',
      '--brand-border-quiet': '#ddd6fe',
      '--brand-border-normal': '#e9d5ff',
      '--brand-border-loud': '#c084fc',
      '--brand-on-quiet': '#5b21b6',
      '--brand-on-normal': '#fff',
      '--brand-on-loud': '#f3e8ff',
      '--color-text-body': '#e0e0ff',
      '--color-text-muted': '#a0a0c0',
      '--color-text-heading': '#ffffff',
      '--color-border': '#4b5563',
      '--color-border-light': '#374151',
      '--color-error': '#ef4444',
      '--fs-xs': '0.75rem',
      '--fs-s': '0.875rem',
      '--fs-m': '1rem',
      '--fs-l': '1.25rem',
      '--fs-xl': '1.5rem',
      '--min-width-layout': '250px',
      '--max-width-layout': '1200px',
    },
    coffeecup: {
      '--brand-fill-quiet': '#f5e9dc',
      '--brand-fill-normal': '#92400e',
      '--brand-fill-loud': '#7c2d12',
      '--brand-border-quiet': '#fde0ca',
      '--brand-border-normal': '#fcd3a5',
      '--brand-border-loud': '#fbbf24',
      '--brand-on-quiet': '#6b2f0e',
      '--brand-on-normal': '#fff',
      '--brand-on-loud': '#fef3c7',
      '--color-text-body': '#3e2723',
      '--color-text-muted': '#6b4f4a',
      '--color-text-heading': '#1c1917',
      '--color-border': '#d97706',
      '--color-border-light': '#f59e0b',
      '--color-error': '#b91c1c',
      '--fs-xs': '0.75rem',
      '--fs-s': '0.875rem',
      '--fs-m': '1rem',
      '--fs-l': '1.125rem',
      '--fs-xl': '1.375rem',
      '--min-width-layout': '250px',
      '--max-width-layout': '1200px',
    },
    silk: {
      '--brand-fill-quiet': '#f3e8ff',
      '--brand-fill-normal': '#ec4899',
      '--brand-fill-loud': '#db2777',
      '--brand-border-quiet': '#fbcfe8',
      '--brand-border-normal': '#f9a8d4',
      '--brand-border-loud': '#f472b6',
      '--brand-on-quiet': '#9d174d',
      '--brand-on-normal': '#fff',
      '--brand-on-loud': '#fdf2f8',
      '--color-text-body': '#4a3f5c',
      '--color-text-muted': '#7c6f8c',
      '--color-text-heading': '#3730a3',
      '--color-border': '#f472b6',
      '--color-border-light': '#f9a8d4',
      '--color-error': '#ef4444',
      '--fs-xs': '0.75rem',
      '--fs-s': '0.875rem',
      '--fs-m': '1rem',
      '--fs-l': '1.125rem',
      '--fs-xl': '1.25rem',
      '--min-width-layout': '250px',
      '--max-width-layout': '1200px',
    }
  }

  return tokens[theme] ?? {}
}
