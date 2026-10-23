import { caseType } from '@repo/utils/string'
import { naming } from '@repo/domain'
import type { TenantContext } from '../models'

const { kebabToPascal, kebabToCamel, pascalToKebab } = caseType()
const { derivePrefix } = naming()

const caseTransform = <C extends TenantContext>() => async (ctx: C): Promise<C> => {
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
