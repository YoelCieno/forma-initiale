interface Case {
  kebabToPascal(kebab: string): string
  kebabToCamel(kebab: string): string
  pascalToKebab(pascal: string): string
}

export function caseType(): Case {
  const kebabToPascal = (kebab: string): string => {
    return kebab
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  const kebabToCamel = (kebab: string): string => {
    return kebab.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
  }

  const pascalToKebab = (pascal: string): string => {
    return pascal
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')
  }

  return {
    kebabToPascal,
    kebabToCamel,
    pascalToKebab,
  }
}
