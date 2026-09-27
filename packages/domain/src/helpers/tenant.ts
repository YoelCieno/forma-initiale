export const isValidTenant = (value: string, validIds: readonly string[]): value is string => {
  return validIds.includes(value)
}
