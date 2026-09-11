const getErrorMessage = (err: unknown): string => {
  return err instanceof Error ? err.message : String(err)
}

const onExit = <T>(fn: () => T, prefix?: string): T => {
  try {
    return fn()
  } catch (err) {
    const msg = `Error: ${prefix ? `${prefix}: ` : ''}${getErrorMessage(err)}`
    console.error(msg)
    process.exit(1)
  }
}

export {
  getErrorMessage,
  onExit,
}
