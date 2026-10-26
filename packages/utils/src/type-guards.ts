interface TypeGuards {
  isFunction: (value: unknown) => value is (...args: unknown[]) => unknown
  isNumber: (value: unknown) => value is number
}

export function typeGuards(): TypeGuards {
  const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => {
    return typeof value === 'function'
  }

  const isNumber = (value: unknown): value is number => {
    return typeof value === 'number'
  }

  return { isFunction, isNumber }
}
