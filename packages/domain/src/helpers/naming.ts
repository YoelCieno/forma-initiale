export interface Naming {
  getProductNames: (name: string) => string[]
  derivePrefix: (name: string) => string
}

export function naming(): Naming {
  const getProductNames = (name: string): string[] => [
    `${name}-alpha`,
    `${name}-beta`,
    `${name}-gamma`,
  ]

  const derivePrefix = (name: string): string => {
    const parts = name.split('-')
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return name.slice(0, 2)
  }

  return { getProductNames, derivePrefix }
}
