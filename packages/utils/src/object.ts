export function object() {
  const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object'
      && value !== null
      && Object.getPrototypeOf(value) === Object.prototype
  }

  const safeJsonParse = <T = unknown>(input: string, label: string): T => {
    try {
      return JSON.parse(input)
    } catch {
      throw new Error(`Invalid JSON in ${label}`)
    }
  }

  const pick = (src: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> =>
    keys.reduce<Record<string, unknown>>((acc, k) => ({ ...acc, [k]: src[k] }), {})

  return { isObject, safeJsonParse, pick }
}
