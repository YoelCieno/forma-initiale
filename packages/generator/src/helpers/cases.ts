import type { VueTenantContext } from '../models'

const kebabToPascal = (kebab: string): string => {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

const kebabToCamel = (kebab: string): string => {
  return kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

const pascalToKebab = (pascal: string): string => {
  return pascal
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

/**
 * Pinion-style task: derive PascalCase (Name) and camelCase (camelName)
 * from the kebab-case `name` property on the context.
 */
const derivePrefix = (name: string): string => {
  const parts = name.split('-')
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0]
  }
  return name.slice(0, 2)
}

const caseTransform =
  <C extends VueTenantContext>() =>
  async (ctx: C): Promise<C> => {
    ctx.Name = kebabToPascal(ctx.name)
    ctx.camelName = kebabToCamel(ctx.name)
    ctx.prefix = derivePrefix(ctx.name)
    return ctx
  }

export { kebabToPascal, kebabToCamel, pascalToKebab, caseTransform, derivePrefix }
