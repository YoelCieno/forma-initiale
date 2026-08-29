export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === 'function'

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
