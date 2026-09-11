import { caseType } from '@repo/utils/string'
import type { VueTenantContext } from '../models'

const { kebabToPascal, kebabToCamel, pascalToKebab } = caseType()

const derivePrefix = (name: string): string => {
  const parts = name.split('-')
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0]
  }
  return name.slice(0, 2)
}

const caseTransform = <C extends VueTenantContext>() => async (ctx: C): Promise<C> => {
  ctx.Name = kebabToPascal(ctx.name)
  ctx.camelName = kebabToCamel(ctx.name)
  ctx.prefix = derivePrefix(ctx.name)

  return ctx
}

export {
  kebabToPascal,
  kebabToCamel,
  pascalToKebab,
  caseTransform,
  derivePrefix
}
