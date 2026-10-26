import type { TenantContext } from '../models'
import { formatThemeTokens, getThemeTokens } from '../helpers'
import { naming } from '@repo/domain'

/** Empty placeholder file — keeps scaffold dirs tracked by git. Static: no interpolation. */
const gitkeep = ''

const tokensCss = (ctx: TenantContext) => {
  // Custom gets inline brand override
  if (ctx.theme === 'custom') {
    return `/* ${ctx.Name} custom brand override */
:where(:root) {
  --brand-fill-normal: ${ctx.brandHex ?? '#16a34a'};

  /* WA cascade derives all other brand tokens from this one variable */
}
`
  }

  // Preset themes get inline token blocks
  const themeTokens = getThemeTokens(ctx.theme)
  if (Object.keys(themeTokens).length > 0) {
    return `/* ${ctx.Name} — ${ctx.theme} theme */
:where(:root) {
${formatThemeTokens(themeTokens)}
}`
  }

  // Fallback
  return `/* ${ctx.Name} — default theme */
:where(:root) {
  /* --brand-fill-normal: #4f46e5; */
}`
}

const metadataTs = (ctx: TenantContext) => {
  const { getProductNames } = naming()
  const [alpha, beta, gamma] = getProductNames(ctx.name)
  return `import type { ProductMeta } from '@repo/presenters'

export const ${ctx.camelName}Map: Record<string, ProductMeta> = {
  '${alpha}': {
    title: 'Alpha Primum',
    description: 'The first of its kind, a pioneering specimen',
    image: 'plant',
    imageFamily: 'classic',
  },
  '${beta}': {
    title: 'Beta Secundus',
    description: 'Follows the pattern with distinct characteristics',
    image: 'plant',
    imageFamily: 'classic',
  },
  '${gamma}': {
    title: 'Gamma Tertius',
    description: 'Completes the triad with unique properties',
    image: 'plant',
    imageFamily: 'classic',
  },
}
`
}

export { gitkeep, tokensCss, metadataTs }
