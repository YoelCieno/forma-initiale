/**
 * Format a record of key-value pairs as CSS variable declarations.
 */
export const formatCSSKeyValue = (tokens: Record<string, string>): string => {
  return Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
}
