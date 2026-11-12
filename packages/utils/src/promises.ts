export const settle = async (n = 2): Promise<void> => {
  for (let i = 0; i < n; i++) await Promise.resolve()
}
