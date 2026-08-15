const safeJsonParse = <T = unknown>(input: string, label: string): T => {
  try {
    return JSON.parse(input) as T
  } catch {
    throw new Error(`Invalid JSON in ${label}`)
  }
}

export { safeJsonParse }
