import tenantConfigs from '../data/mocked-data.json'

export const FRAMEWORK_NAMES = tenantConfigs.wl.names
export const FAKE_PLANTS_NAMES = tenantConfigs.fp.names

export type PriceConfig = { readonly base: number; readonly increment: number }

export type TenantConfig = {
  readonly names: readonly string[]
  readonly price?: PriceConfig
  readonly previousPrice?: PriceConfig
  readonly rateType: 'cyclic' | 'random'
}



export const PRODUCT_TENANT_CONFIGS =
  Object.freeze(tenantConfigs) as Record<string, TenantConfig>

export const RATE_VALUE = Object.freeze({
  cyclic: (counter: number) => (counter % 5) + 1,
  random: () => Math.floor(Math.random() * 5) + 1,
})
