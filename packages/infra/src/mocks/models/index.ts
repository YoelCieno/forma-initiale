import tenantConfigs from '../data/mocked-data.json'

export type PriceConfig = { readonly base: number; readonly increment: number }

export type TenantConfig = {
  readonly names: readonly string[]
  readonly price?: PriceConfig
  readonly previousPrice?: PriceConfig
  readonly rateType: string
}

export type TenantId = keyof typeof tenantConfigs
