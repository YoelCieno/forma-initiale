import { validateHex, formatCSSKeyValue } from '@repo/utils'
import { theme } from '@repo/domain'

const { getThemeClass, getThemeTokens } = theme()

/**
 * Format theme tokens as CSS variable declarations.
 * Delegates to @repo/utils formatCSSKeyValue.
 */
const formatThemeTokens = (tokens: Record<string, string>): string => {
  return formatCSSKeyValue(tokens)
}

export { validateHex, getThemeClass, formatThemeTokens, getThemeTokens }
