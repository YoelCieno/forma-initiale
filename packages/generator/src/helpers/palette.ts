/**
 * Validate a hex color string (#RRGGBB or #RGB format).
 * Accepts uppercase and lowercase hex digits.
 */
export function validateHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex) || /^#[0-9a-fA-F]{3}$/.test(hex)
}

/**
 * Map a WA theme name to its CSS class.
 * Returns empty string for 'custom' (no WA theme class needed).
 */
export function getThemeClass(theme: string): string {
  const map: Record<string, string> = {
    default: 'wa-theme-default',
    awesome: 'wa-theme-awesome',
    shoelace: 'wa-theme-shoelace',
    custom: '',
  }
  return map[theme] ?? ''
}
