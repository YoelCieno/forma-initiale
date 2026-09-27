export function object() {
  const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object'
      && value !== null
      && Object.getPrototypeOf(value) === Object.prototype
  }

  const safeJsonParse = <T = unknown>(input: string, label: string): T => {
    try {
      // unavoidable boundary cast: JSON.parse returns any
      return JSON.parse(input) as T
    } catch {
      throw new Error(`Invalid JSON in ${label}`)
    }
  }

  return { isObject, safeJsonParse }
}
