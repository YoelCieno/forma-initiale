/**
 * Validate a hex color string (#RRGGBB or #RGB format).
 * Accepts uppercase and lowercase hex digits.
 */
export const validateHex = (hex: string): boolean => {
  return /^#[0-9a-fA-F]{6}$/.test(hex) || /^#[0-9a-fA-F]{3}$/.test(hex)
}
