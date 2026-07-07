export interface TenantConfig {
  names: string[]
  price: { base: number; increment: number }
  rateType: string
}

export function addTenantConfig(
  configs: Record<string, TenantConfig>,
  prefix: string,
  names: string[],
): Record<string, TenantConfig> {
  if (prefix in configs) {
    throw new Error(`Tenant "${prefix}" already exists`)
  }

  return {
    ...configs,
    [prefix]: {
      names: [...names],
      price: { base: 9.99, increment: 10 },
      rateType: 'random',
    },
  }
}
